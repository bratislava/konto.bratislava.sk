import { OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { FormError, Forms, FormState } from '@prisma/client'
import { GenericObjectType } from '@rjsf/utils'
import axios, { AxiosResponse } from 'axios'
import { Job } from 'bull'
import {
  FormDefinition,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { omitExtraData } from 'forms-shared/form-utils/omitExtraData'
import {
  getArrayForOneToMany,
  getValuesForFields,
} from 'forms-shared/sharepoint/getValuesForSharepoint'
import { escape, filter, List } from 'lodash'

import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../guards/thrower-error.guard'
import {
  getFrontendFormTitleFromForm,
  getSubjectTextFromForm,
} from '../handlers/text.handler'
import alertError from '../logging'
import {
  SharepointErrorsEnum,
  SharepointErrorsResponseEnum,
} from './dtos/sharepoint.errors.enum'

@Injectable()
@Processor('sharepoint')
export default class SharepointSubservice {
  private readonly logger: Logger

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private prismaService: PrismaService,
  ) {
    this.logger = new Logger('SharepointSubservice')

    if (
      !process.env.SHAREPOINT_TENANT_ID ||
      !process.env.SHAREPOINT_CLIENT_ID ||
      !process.env.SHAREPOINT_CLIENT_SECRET ||
      !process.env.SHAREPOINT_DOMAIN ||
      !process.env.SHAREPOINT_URL
    ) {
      throw new Error(
        'Missing Sharepoint .env values, one of: SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_DOMAIN, SHAREPOINT_URL',
      )
    }
  }

  @Process()
  async transcode(job: Job<{ formId: string }>): Promise<void> {
    await this.postNewRecord(job.data.formId)
  }

  @OnQueueFailed()
  handler(job: Job<{ formId: string }>, err: Error): void {
    alertError(
      `Sending form ${job.data.formId} to Sharepoint has failed. Number of tries for this form so far: ${job.attemptsMade}`,
      this.logger,
      JSON.stringify(err),
    )

    this.prismaService.forms
      .update({
        where: {
          id: job.data.formId,
        },
        data: {
          error: FormError.SHAREPOINT_SEND_ERROR,
        },
      })
      .catch((error) => {
        alertError(
          `Setting form error with id ${job.data.formId} to POWERAPPS_SEND_ERROR failed.`,
          this.logger,
          JSON.stringify(error),
        )
      })
  }

  public async postNewRecord(formId: string): Promise<void> {
    const form = await this.prismaService.forms.findUnique({
      where: {
        id: formId,
        archived: false,
      },
    })
    if (form === null) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      )
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    if (
      formDefinition.type !== FormDefinitionType.SlovenskoSkGeneric ||
      !formDefinition.sharepointData
    ) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        SharepointErrorsEnum.SHAREPOINT_DATA_NOT_PROVIDED,
        `${SharepointErrorsResponseEnum.SHAREPOINT_DATA_NOT_PROVIDED} Form id: ${form.id}.`,
      )
    }

    const accessToken = await this.getAccessToken()
    const { sharepointData, schemas } = formDefinition
    const formTitle = this.getTitle(form, formDefinition)
    const fields = await this.mapColumnsToFields(
      Object.keys(sharepointData.columnMap),
      accessToken,
      sharepointData.databaseName,
    )
    const jsonDataExtraDataOmitted = omitExtraData(
      schemas.schema,
      form.formDataJson as GenericObjectType,
    )
    const valuesForFields = getValuesForFields(
      sharepointData,
      { ...form, title: formTitle },
      jsonDataExtraDataOmitted,
      fields,
    )

    if (sharepointData.oneToOne) {
      const oneToOneOriginalTableFields = await this.mapColumnsToFields(
        Object.values(sharepointData.oneToOne).map(
          (record) => record.originalTableId,
        ),
        accessToken,
        sharepointData.databaseName,
      )

      await Promise.all(
        Object.values(sharepointData.oneToOne).map(async (value) => {
          const oneToOneFields = await this.mapColumnsToFields(
            Object.keys(value.columnMap),
            accessToken,
            value.databaseName,
          )
          const valuesForFieldsOneToOne = getValuesForFields(
            value,
            { ...form, title: formTitle },
            jsonDataExtraDataOmitted,
            oneToOneFields,
          )

          const addedId = await this.postDataToSharepoint(
            value.databaseName,
            accessToken,
            valuesForFieldsOneToOne,
          )

          valuesForFields[
            `${oneToOneOriginalTableFields[value.originalTableId]}Id`
          ] = addedId
        }),
      )
    }

    const baseId = await this.postDataToSharepoint(
      sharepointData.databaseName,
      accessToken,
      valuesForFields,
    )

    if (sharepointData.oneToMany) {
      await Promise.all(
        Object.entries(sharepointData.oneToMany).map(async ([key, value]) => {
          const recordsArray = getArrayForOneToMany(
            { ...form, jsonDataExtraDataOmitted },
            key,
          )

          await Promise.all(
            recordsArray.map(async (record) => {
              const foreignFields: Record<string, any> = {}
              foreignFields[value.originalTableId] = baseId

              const oneToManyFields = await this.mapColumnsToFields(
                [
                  ...Object.keys(value.columnMap),
                  ...Object.keys(foreignFields),
                ],
                accessToken,
                value.databaseName,
              )

              const valuesForFieldsOneToMany = getValuesForFields(
                value,
                { ...form, title: formTitle },
                record,
                oneToManyFields,
                foreignFields,
              )

              await this.postDataToSharepoint(
                value.databaseName,
                accessToken,
                valuesForFieldsOneToMany,
              )
            }),
          )
        }),
      )
    }

    await this.prismaService.forms.update({
      where: {
        id: formId,
      },
      data: {
        error: FormError.NONE,
        state: FormState.PROCESSING,
      },
    })
  }

  private async mapColumnsToFields(
    columns: Array<string>,
    accessToken: string,
    dtbName: string,
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {}
    const { SHAREPOINT_URL } = process.env
    const url = `${escape(SHAREPOINT_URL)}/lists/getbytitle('${dtbName}')/fields`

    const fields = await axios
      .get(url, {
        headers: {
          Accept: 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(
        (
          response: AxiosResponse<
            { d: { results: List<Record<string, string>> } },
            object
          >,
        ) => response.data.d.results,
      )

    columns.forEach((col) => {
      const filtered = filter<Record<string, string>>(
        fields,
        (field) => field.Title === col,
      )
      if (filtered.length === 0) {
        throw this.throwerErrorGuard.BadRequestException(
          SharepointErrorsEnum.UNKNOWN_COLUMN,
          `${SharepointErrorsResponseEnum.UNKNOWN_COLUMN} Column: ${col}, dtb name: ${dtbName}.`,
        )
      }
      result[col] = filtered[0].StaticName
    })

    return result
  }

  private async postDataToSharepoint(
    dtbName: string,
    accessToken: string,
    fieldValues: Record<string, string>,
  ): Promise<number> {
    const { SHAREPOINT_URL } = process.env
    const url = `${escape(SHAREPOINT_URL)}/lists/getbytitle('${dtbName}')/items`
    const postData = {
      ...fieldValues,
    }

    const result = await axios
      .post(url, postData, {
        headers: {
          Accept: 'application/json;odata=verbose',
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .catch((error) => {
        throw this.throwerErrorGuard.BadRequestException(
          SharepointErrorsEnum.POST_DATA_TO_SHAREPOINT_ERROR,
          `${
            SharepointErrorsResponseEnum.POST_DATA_TO_SHAREPOINT_ERROR
          } Error: ${<string>error} when sending to database: ${dtbName}, posted data: ${JSON.stringify(postData)} .`,
        )
      })
      .then(
        (res: AxiosResponse<{ d: { ID: number } }, object>) => res.data.d.ID,
      )

    return result
  }

  private async getAccessToken(): Promise<string> {
    const {
      SHAREPOINT_TENANT_ID,
      SHAREPOINT_CLIENT_ID,
      SHAREPOINT_CLIENT_SECRET,
      SHAREPOINT_DOMAIN,
    } = process.env
    const url = `https://accounts.accesscontrol.windows.net/${escape(
      SHAREPOINT_TENANT_ID,
    )}/tokens/OAuth/2`
    const result = await axios
      .post(
        url,
        {
          grant_type: 'client_credentials',
          client_id: `${escape(SHAREPOINT_CLIENT_ID)}@${escape(
            SHAREPOINT_TENANT_ID,
          )}`,
          client_secret: SHAREPOINT_CLIENT_SECRET,
          resource: `00000003-0000-0ff1-ce00-000000000000/${
            SHAREPOINT_DOMAIN ?? ''
          }@${SHAREPOINT_TENANT_ID ?? ''}`,
        },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      )
      .then(
        (response: AxiosResponse<{ access_token: string }, object>) =>
          response.data.access_token,
      )
      .catch((error) => {
        throw this.throwerErrorGuard.BadRequestException(
          SharepointErrorsEnum.ACCESS_TOKEN_ERROR,
          `${SharepointErrorsResponseEnum.ACCESS_TOKEN_ERROR} Error: ${<string>(
            error
          )}`,
        )
      })

    return result ?? ''
  }

  private getTitle(form: Forms, formDefinition: FormDefinition): string {
    const messageSubject = getSubjectTextFromForm(form, formDefinition)
    // fallback to messageSubject if title can't be parsed
    return getFrontendFormTitleFromForm(form, formDefinition) || messageSubject
  }
}
