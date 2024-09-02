import { OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FormError, Forms, FormState, Prisma } from '@prisma/client'
import { GenericObjectType } from '@rjsf/utils'
import axios, { AxiosResponse } from 'axios'
import { Job } from 'bull'
import {
  FormDefinition,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import {
  SharepointData,
  SharepointRelationData,
} from 'forms-shared/definitions/sharepointTypes'
import { omitExtraData } from 'forms-shared/form-utils/omitExtraData'
import {
  getArrayForOneToMany,
  getValuesForFields,
} from 'forms-shared/sharepoint/getValuesForSharepoint'
import { SharepointDataAllColumnMappingsToFields } from 'forms-shared/sharepoint/types'
import { escape, get as lodashGet } from 'lodash'

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
    private configService: ConfigService,
  ) {
    this.logger = new Logger('SharepointSubservice')

    if (
      !this.configService.get<string>('SHAREPOINT_TENANT_ID') ||
      !this.configService.get<string>('SHAREPOINT_CLIENT_ID') ||
      !this.configService.get<string>('SHAREPOINT_CLIENT_SECRET') ||
      !this.configService.get<string>('SHAREPOINT_DOMAIN') ||
      !this.configService.get<string>('SHAREPOINT_URL')
    ) {
      throw new Error(
        'Missing Sharepoint .env values, one of: SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_DOMAIN, SHAREPOINT_URL',
      )
    }
  }

  @Process()
  async transcode(job: Job<{ formId: string }>): Promise<void> {
    this.logger.log(`Sending form ${job.data.formId} to sharepoint`)
    await this.postNewRecord(job.data.formId)
  }

  @OnQueueFailed()
  handler(job: Job<{ formId: string }>, err: Error): void {
    alertError(
      `Sending form ${job.data.formId} to Sharepoint has failed.`,
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

  private async handleOneToOne(
    sharepointDataOneToOne: Record<string, SharepointRelationData>,
    form: Forms,
    formTitle: string,
    jsonDataExtraDataOmitted: Prisma.JsonValue,
    accessToken: string,
    fields: SharepointDataAllColumnMappingsToFields,
  ): Promise<Record<string, number>> {
    const result: Record<string, number> = {}
    await Promise.all(
      Object.entries(sharepointDataOneToOne).map(async ([path, value]) => {
        if (!lodashGet(jsonDataExtraDataOmitted, path, false)) {
          return
        }

        const valuesForFieldsOneToOne = getValuesForFields(
          value,
          { ...form, title: formTitle },
          jsonDataExtraDataOmitted,
          fields.oneToOne.fieldMaps[value.databaseName].fieldMap,
        )

        const { id } = await this.postDataToSharepoint(
          value.databaseName,
          accessToken,
          valuesForFieldsOneToOne,
        )
        result[value.originalTableId] = id
      }),
    )

    return result
  }

  private async handleOneToMany(
    sharepointDataOneToMany: Record<string, SharepointRelationData>,
    form: Forms,
    formTitle: string,
    jsonDataExtraDataOmitted: Prisma.JsonValue,
    accessToken: string,
    fields: SharepointDataAllColumnMappingsToFields,
    originalRecordId: number,
  ): Promise<void> {
    const allPromises = Object.entries(sharepointDataOneToMany).flatMap(
      async ([key, value]) => {
        const recordsArray = getArrayForOneToMany(
          { ...form, jsonDataExtraDataOmitted },
          key,
        )

        return recordsArray.map(async (record) => {
          const foreignFields: Record<string, any> = {}
          foreignFields[value.originalTableId] = originalRecordId

          const valuesForFieldsOneToMany = getValuesForFields(
            value,
            { ...form, title: formTitle },
            record,
            fields.oneToMany[value.databaseName].fieldMap,
            foreignFields,
          )

          await this.postDataToSharepoint(
            value.databaseName,
            accessToken,
            valuesForFieldsOneToMany,
          )
        })
      },
    )

    await Promise.all(allPromises)
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
    const fields = await this.getAllFieldsMappings(sharepointData, accessToken)

    const jsonDataExtraDataOmitted = omitExtraData(
      schemas.schema,
      form.formDataJson as GenericObjectType,
    )
    const valuesForFields = getValuesForFields(
      sharepointData,
      { ...form, title: formTitle },
      jsonDataExtraDataOmitted,
      fields.fieldMap,
    )

    if (sharepointData.oneToOne) {
      const oneToOneAdded = await this.handleOneToOne(
        sharepointData.oneToOne,
        form,
        formTitle,
        jsonDataExtraDataOmitted,
        accessToken,
        fields,
      )
      Object.entries(oneToOneAdded).forEach(([key, id]) => {
        valuesForFields[
          `${fields.oneToOne.oneToOneOriginalTableFields[key]}Id`
        ] = id
      })
    }

    const { id } = await this.postDataToSharepoint(
      sharepointData.databaseName,
      accessToken,
      valuesForFields,
    )

    if (sharepointData.oneToMany) {
      await this.handleOneToMany(
        sharepointData.oneToMany,
        form,
        formTitle,
        jsonDataExtraDataOmitted,
        accessToken,
        fields,
        id,
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
    columns: string[],
    accessToken: string,
    dbName: string,
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {}
    const url = `${escape(this.configService.get<string>('SHAREPOINT_URL'))}/lists/getbytitle('${dbName}')/fields`

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
            { d: { results: Array<Record<string, string>> } },
            object
          >,
        ) => response.data.d.results,
      )

    columns.forEach((col) => {
      const filtered = fields.find((field) => field.Title === col)
      if (!filtered) {
        throw this.throwerErrorGuard.BadRequestException(
          SharepointErrorsEnum.UNKNOWN_COLUMN,
          `${SharepointErrorsResponseEnum.UNKNOWN_COLUMN} Column: ${col}, dtb name: ${dbName}.`,
        )
      }
      result[col] = filtered.StaticName
    })

    return result
  }

  private async getAllFieldsMappings(
    sharepointData: SharepointData,
    accessToken: string,
  ): Promise<SharepointDataAllColumnMappingsToFields> {
    const fieldMapBasic = await this.mapColumnsToFields(
      Object.keys(sharepointData.columnMap),
      accessToken,
      sharepointData.databaseName,
    )
    const result: SharepointDataAllColumnMappingsToFields = {
      fieldMap: fieldMapBasic,
      oneToMany: {},
      oneToOne: {
        fieldMaps: {},
        oneToOneOriginalTableFields: {},
      },
    }

    if (sharepointData.oneToMany) {
      await Promise.all(
        Object.values(sharepointData.oneToMany).map(async (value) => {
          const oneToManyFields = await this.mapColumnsToFields(
            [...Object.keys(value.columnMap), value.originalTableId],
            accessToken,
            value.databaseName,
          )
          result.oneToMany[value.databaseName] = { fieldMap: oneToManyFields }
        }),
      )
    }

    if (sharepointData.oneToOne) {
      result.oneToOne.oneToOneOriginalTableFields =
        await this.mapColumnsToFields(
          Object.values(sharepointData.oneToOne).map(
            (record) => record.originalTableId,
          ),
          accessToken,
          sharepointData.databaseName,
        )

      await Promise.all(
        Object.values(sharepointData.oneToOne).map(async (value) => {
          result.oneToOne.fieldMaps[value.databaseName] = {
            fieldMap: await this.mapColumnsToFields(
              Object.keys(value.columnMap),
              accessToken,
              value.databaseName,
            ),
          }
        }),
      )
    }

    return result
  }

  private async postDataToSharepoint(
    dbName: string,
    accessToken: string,
    fieldValues: Record<string, string>,
  ): Promise<{ id: number }> {
    const url = `${escape(this.configService.get<string>('SHAREPOINT_URL'))}/lists/getbytitle('${dbName}')/items`

    const result = await axios
      .post(url, fieldValues, {
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
          } Error: ${<string>error} when sending to database: ${dbName}, posted data: ${JSON.stringify(fieldValues)} .`,
        )
      })
      .then(
        (res: AxiosResponse<{ d: { ID: number } }, object>) => res.data.d.ID,
      )

    return { id: result }
  }

  private async getAccessToken(): Promise<string> {
    const url = `https://accounts.accesscontrol.windows.net/${escape(
      this.configService.get<string>('SHAREPOINT_TENANT_ID'),
    )}/tokens/OAuth/2`
    const result = await axios
      .post(
        url,
        {
          grant_type: 'client_credentials',
          client_id: `${escape(this.configService.get<string>('SHAREPOINT_CLIENT_ID'))}@${escape(
            this.configService.get<string>('SHAREPOINT_TENANT_ID'),
          )}`,
          client_secret: this.configService.get<string>(
            'SHAREPOINT_CLIENT_SECRET',
          ),
          resource: `00000003-0000-0ff1-ce00-000000000000/${
            this.configService.get<string>('SHAREPOINT_DOMAIN') ?? ''
          }@${this.configService.get<string>('SHAREPOINT_TENANT_ID') ?? ''}`,
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

    return result
  }

  private getTitle(form: Forms, formDefinition: FormDefinition): string {
    // fallback to messageSubject if title can't be parsed
    return (
      getFrontendFormTitleFromForm(form, formDefinition) ||
      getSubjectTextFromForm(form, formDefinition)
    )
  }
}
