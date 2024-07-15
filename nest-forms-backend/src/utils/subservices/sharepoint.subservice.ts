import { OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { FormError, Forms, FormState, Prisma } from '@prisma/client'
import axios, { AxiosResponse } from 'axios'
import { Job } from 'bull'
import {
  FormDefinition,
  FormDefinitionType,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import {
  SharepointColumnMapValue,
  SharepointData,
} from 'forms-shared/definitions/sharepointTypes'
import { escape, filter, get as lodashGet, List } from 'lodash'

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
    const { sharepointData } = formDefinition
    const valuesForFields = await this.getValuesForFields(
      sharepointData,
      form,
      formDefinition,
      accessToken,
    )

    if (sharepointData.oneToOne) {
      const fields = await this.mapColumnsToFields(
        Object.values(sharepointData.oneToOne).map((record) => {
          return record.originalTableId
        }),
        accessToken,
        sharepointData.databaseName
      )

      await Promise.all(
        Object.values(sharepointData.oneToOne).map(async (value) => {
          const valuesForFieldsOneToOne = await this.getValuesForFields(
            value,
            form,
            formDefinition,
            accessToken,
          )

          const addedId = await this.postDataToSharepoint(
            value.databaseName,
            accessToken,
            valuesForFieldsOneToOne,
          )

          valuesForFields[fields[value.originalTableId] + 'Id'] = addedId
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
          const recordsArray = this.getArrayForOneToMany(form, key)

          await Promise.all(
            recordsArray.map(async (record) => {
              const foreignFields: Record<string, any> = {}
              foreignFields[value.originalTableId] = baseId
    
              const valuesForFieldsOneToMany = await this.getValuesForFields(
                value,
                form,
                formDefinition,
                accessToken,
                record,
                foreignFields
              )
    
              await this.postDataToSharepoint(
                value.databaseName,
                accessToken,
                valuesForFieldsOneToMany,
              )
            })
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
      .then((res: AxiosResponse<{ d: { ID: number } }, object>) =>
        res.data.d.ID,
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

  /**
   * TODO
   * 
   * @param sharepointData 
   * @param form 
   * @param formDefinition 
   * @param accessToken 
   * @param jsonData 
   * @param foreignFields 
   * @returns 
   */
  private async getValuesForFields(
    sharepointData: SharepointData,
    form: Forms,
    formDefinition: FormDefinition,
    accessToken: string,
    jsonData?: Prisma.JsonValue,
    foreignFields?: Record<string, string>
  ): Promise<Record<string, any>> {
    const fields = await this.mapColumnsToFields(
      Object.keys(sharepointData.columnMap).concat(foreignFields ? Object.keys(foreignFields) : []),
      accessToken,
      sharepointData.databaseName,
    )

    const result: Record<string, any> = {}
    Object.keys(fields).forEach((key) => {
      if (sharepointData.columnMap[key]) {
        switch (sharepointData.columnMap[key].type) {
          case 'json_path':
            const valueAtJsonPath = this.getValueAtJsonPath(
              jsonData ?? form.formDataJson,
              sharepointData.columnMap[key],
            )
            if (valueAtJsonPath === null) {
              break
            }

            result[fields[key]] = valueAtJsonPath
            break
  
          case 'mag_number':
            result[fields[key]] = form.ginisDocumentId ?? ''
            break
  
          case 'title':
            result[fields[key]] = this.getTitle(form, formDefinition)
            break
  
          default:
            throw this.throwerErrorGuard.NotAcceptableException(
              SharepointErrorsEnum.UNKNOWNN_TYPE_IN_SHAREPOINT_DATA,
              `${SharepointErrorsResponseEnum.UNKNOWNN_TYPE_IN_SHAREPOINT_DATA}. Type: ${sharepointData.columnMap[key].type}`,
            )
        }
      } else if (foreignFields) {
        result[fields[key] + 'Id'] = foreignFields[key]
      } else {
        throw new Error(`Provided key ${key} not found in column map or extra keys. Slug: ${form.formDefinitionSlug}.`)
      }
    })

    return result
  }

  private getValueAtJsonPath(
    jsonFormData: Prisma.JsonValue,
    columnMapValue: SharepointColumnMapValue,
  ): string | null {
    if (columnMapValue.type !== 'json_path') {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        SharepointErrorsEnum.SHAREPOINT_DATA_NOT_PROVIDED,
        `${SharepointErrorsResponseEnum.SHAREPOINT_DATA_NOT_PROVIDED} There must be an info field for json_path.`,
      )
    }
    let atPath: string | null = lodashGet(jsonFormData, columnMapValue.info, null)
    if (Array.isArray(atPath)) {
      atPath = (atPath as Array<object>).map((x) => x.toString()).join(', ')
    }
    return atPath
  }

  private getArrayForOneToMany(
    form: Forms,
    path: string
  ): Array<Prisma.JsonValue> {
    const atPath = lodashGet(form.formDataJson, path, null)
    if (!Array.isArray(atPath)) {
      throw new Error(`Getting array data for oneToMany in form ${form.id} on path ${path} did not return array. Instead got value: ${atPath}`)
    }
    return atPath
  }

  private getTitle(form: Forms, formDefinition: FormDefinition): string {
    const messageSubject = getSubjectTextFromForm(form, formDefinition)
    // fallback to messageSubject if title can't be parsed
    return getFrontendFormTitleFromForm(form, formDefinition) || messageSubject
  }
}
