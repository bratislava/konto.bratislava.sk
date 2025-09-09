import { OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { FormError, Forms, FormState } from '@prisma/client'
import axios, { AxiosResponse } from 'axios'
import { Job } from 'bull'
import { FormDefinitionType } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import {
  SharepointData,
  SharepointRelationData,
} from 'forms-shared/definitions/sharepointTypes'
import { extractFormSubjectPlain } from 'forms-shared/form-utils/formDataExtractors'
import { omitExtraData } from 'forms-shared/form-utils/omitExtraData'
import {
  getArrayForOneToMany,
  getValuesForFields,
} from 'forms-shared/sharepoint/getValuesForSharepoint'
import { SharepointDataAllColumnMappingsToFields } from 'forms-shared/sharepoint/types'
import lodashGet from 'lodash/get'

import BaConfigService from '../../config/ba-config.service'
import FormValidatorRegistryService from '../../form-validator-registry/form-validator-registry.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../guards/thrower-error.guard'
import {
  SharepointErrorsEnum,
  SharepointErrorsResponseEnum,
} from './dtos/sharepoint.errors.enum'
import alertError, { LineLoggerSubservice } from './line-logger.subservice'

@Injectable()
@Processor('sharepoint')
export default class SharepointSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private prismaService: PrismaService,
    private readonly baConfigService: BaConfigService,
    private formValidatorRegistryService: FormValidatorRegistryService,
  ) {
    this.logger = new LineLoggerSubservice('SharepointSubservice')
  }

  @Process()
  async transcode(job: Job<{ formId: string }>): Promise<void> {
    this.logger.log(`Sending form ${job.data.formId} to sharepoint`)
    await this.postNewRecord(job.data.formId)
  }

  @OnQueueFailed()
  handler(job: Job<{ formId: string }>, err: Error): void {
    this.logger.error(
      this.throwerErrorGuard.InternalServerErrorException(
        SharepointErrorsEnum.GENERAL_ERROR,
        SharepointErrorsResponseEnum.GENERAL_ERROR,
        `Sending form ${job.data.formId} to Sharepoint has failed.`,
        err,
      ),
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
    formSubject: string,
    jsonDataExtraDataOmitted: PrismaJson.FormDataJson,
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
          { ...form, title: formSubject },
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
    formSubject: string,
    jsonDataExtraDataOmitted: PrismaJson.FormDataJson,
    accessToken: string,
    fields: SharepointDataAllColumnMappingsToFields,
  ): Promise<Record<string, number[]>> {
    const result: Record<string, number[]> = {}
    const allPromises = Object.entries(sharepointDataOneToMany).map(
      async ([key, value]) => {
        result[value.originalTableId] = []

        const recordsArray = getArrayForOneToMany(
          { ...form, jsonDataExtraDataOmitted },
          key,
        )

        const recordPromises = recordsArray.map(async (record) => {
          const valuesForFieldsOneToMany = getValuesForFields(
            value,
            { ...form, title: formSubject },
            record,
            fields.oneToMany.fieldMaps[value.databaseName].fieldMap,
          )

          const { id } = await this.postDataToSharepoint(
            value.databaseName,
            accessToken,
            valuesForFieldsOneToMany,
          )
          result[value.originalTableId].push(id)
        })
        await Promise.all(recordPromises)
      },
    )

    await Promise.all(allPromises)
    return result
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

    if (form.formDataJson == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_DATA,
        FormsErrorsResponseEnum.EMPTY_FORM_DATA,
      )
    }

    const accessToken = await this.getAccessToken()
    const { sharepointData, schema } = formDefinition
    const formSubject = extractFormSubjectPlain(
      formDefinition,
      form.formDataJson,
    )
    const fields = await this.getAllFieldsMappings(sharepointData, accessToken)

    const jsonDataExtraDataOmitted = omitExtraData(
      schema,
      form.formDataJson,
      this.formValidatorRegistryService.getRegistry(),
    )
    const valuesForFields = getValuesForFields(
      sharepointData,
      { ...form, title: formSubject },
      jsonDataExtraDataOmitted,
      fields.fieldMap,
    )

    if (sharepointData.oneToOne) {
      const oneToOneAdded = await this.handleOneToOne(
        sharepointData.oneToOne,
        form,
        formSubject,
        jsonDataExtraDataOmitted,
        accessToken,
        fields,
      )
      Object.entries(oneToOneAdded).forEach(([key, id]) => {
        valuesForFields[`${fields.oneToOne.originalTableFields[key]}LookupId`] =
          id
      })
    }

    if (sharepointData.oneToMany) {
      const oneToManyAdded = await this.handleOneToMany(
        sharepointData.oneToMany,
        form,
        formSubject,
        jsonDataExtraDataOmitted,
        accessToken,
        fields,
      )

      // https://stackoverflow.com/questions/77935301/updating-a-lookup-field-in-sharepoint-via-microsoft-graph-api-results-in-invali
      Object.entries(oneToManyAdded).forEach(([key, ids]) => {
        valuesForFields[
          `${fields.oneToMany.originalTableFields[key]}LookupId`
        ] = ids
        valuesForFields[
          `${fields.oneToMany.originalTableFields[key]}LookupId@odata.type`
        ] = 'Collection(Edm.Int32)'
      })
    }

    await this.postDataToSharepoint(
      sharepointData.databaseName,
      accessToken,
      valuesForFields,
    )

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

  private getListUrl(listName: string): string {
    return `${this.baConfigService.sharepoint.graphUrl}/sites/${this.baConfigService.sharepoint.siteId}/lists/${listName}`
  }

  private async mapColumnsToFields(
    columns: string[],
    accessToken: string,
    dbName: string,
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {}
    const url = `${this.getListUrl(dbName)}/columns`

    const fields = await axios
      .get(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then(
        (response: AxiosResponse<{ value: Array<any> }, object>) =>
          response.data.value,
      )

    columns.forEach((col) => {
      const filtered = fields.find((field) => field.displayName === col)
      if (!filtered) {
        throw this.throwerErrorGuard.BadRequestException(
          SharepointErrorsEnum.UNKNOWN_COLUMN,
          `${SharepointErrorsResponseEnum.UNKNOWN_COLUMN} Column: ${col}, dtb name: ${dbName}.`,
        )
      }
      result[col] = filtered.name
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
      oneToMany: {
        fieldMaps: {},
        originalTableFields: {},
      },
      oneToOne: {
        fieldMaps: {},
        originalTableFields: {},
      },
    }

    if (sharepointData.oneToMany) {
      result.oneToMany.originalTableFields = await this.mapColumnsToFields(
        Object.values(sharepointData.oneToMany).map(
          (record) => record.originalTableId,
        ),
        accessToken,
        sharepointData.databaseName,
      )

      await Promise.all(
        Object.values(sharepointData.oneToMany).map(async (value) => {
          result.oneToMany.fieldMaps[value.databaseName] = {
            fieldMap: await this.mapColumnsToFields(
              Object.keys(value.columnMap),
              accessToken,
              value.databaseName,
            ),
          }
        }),
      )
    }

    if (sharepointData.oneToOne) {
      result.oneToOne.originalTableFields = await this.mapColumnsToFields(
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
    const url = `${this.getListUrl(dbName)}/items`

    try {
      const res: AxiosResponse<{ id: string }> = await axios.post(
        url,
        { fields: fieldValues },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      return { id: parseInt(res.data.id, 10) }
    } catch (error) {
      throw this.throwerErrorGuard.BadRequestException(
        SharepointErrorsEnum.POST_DATA_TO_SHAREPOINT_ERROR,
        SharepointErrorsResponseEnum.POST_DATA_TO_SHAREPOINT_ERROR,
        JSON.stringify({
          databaseName: dbName,
          postedData: JSON.stringify(fieldValues),
        }),
        error,
      )
    }
  }

  private async getAccessToken(): Promise<string> {
    const url = `https://login.microsoftonline.com/${this.baConfigService.sharepoint.tenantId}/oauth2/v2.0/token`
    const result = await axios
      .post(
        url,
        {
          grant_type: 'client_credentials',
          client_id: this.baConfigService.sharepoint.clientId,
          client_secret: this.baConfigService.sharepoint.clientSecret,
          scope: `https://graph.microsoft.com/.default`,
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
          SharepointErrorsResponseEnum.ACCESS_TOKEN_ERROR,
          undefined,
          error,
        )
      })

    return result
  }
}
