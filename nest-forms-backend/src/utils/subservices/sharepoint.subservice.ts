import { Injectable, Logger } from "@nestjs/common"
import { FormError, FormState, Forms, Prisma } from "@prisma/client"
import { SharepointColumnMapValue } from "forms-shared/definitions/sharepoint"
import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import ThrowerErrorGuard from "../guards/thrower-error.guard"
import { SharepointErrorsEnum, SharepointErrorsResponseEnum } from "./dtos/sharepoint.errors.enum"
import { escape, filter, get as lodashGet, List } from 'lodash'
import { getFrontendFormTitleFromForm, getSubjectTextFromForm } from "../handlers/text.handler"
import axios, { AxiosResponse } from "axios"
import PrismaService from "../../prisma/prisma.service"
import { FormsErrorsEnum, FormsErrorsResponseEnum } from "../../forms/forms.errors.enum"
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { Job } from "bull"
import { OnQueueFailed, Process } from "@nestjs/bull"
import alertError from "../logging"


@Injectable()
export default class SharepointSubservice {
  private readonly logger: Logger

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private prismaService: PrismaService
  ) {
    this.logger = new Logger('SharepointSubservice')
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

    const accessToken = await this.getAccessToken()
    const sharepointData = formDefinition.sharepointData
    const fields = await this.mapColumnsToFields(
      Object.keys(sharepointData.columnMap),
      accessToken,
      sharepointData.databaseName,
    )

    await this.postDataToSharepoint(
      sharepointData.databaseName,
      sharepointData.tableName,
      accessToken,
      this.getValuesForFields(fields, sharepointData.columnMap, form, formDefinition),
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

  private async mapColumnsToFields(
    columns: Array<string>,
    accessToken: string,
    dtbName: string,
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {}
    const { SHAREPOINT_URL } = process.env
    const url = `${escape(SHAREPOINT_URL)}/getbytitle('${dtbName}')/fields`

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
          `${SharepointErrorsResponseEnum.UNKNOWN_COLUMN} Column: ${col}.`,
        )
      }
      result[col] = filtered[0].StaticName
    })

    return result
  }

  private async postDataToSharepoint(
    dtbName: string,
    tableName: string,
    accessToken: string,
    fieldValues: Record<string, string>,
  ): Promise<string> {
    const { SHAREPOINT_URL } = process.env
    const url = `${escape(SHAREPOINT_URL)}/getbytitle('${dtbName}')/items`
    const postData = {
      ...fieldValues,
      __metadata: {
        type: tableName,
      },
    }

    const result = await axios
      .post(url, postData, {
        headers: {
          Accept: 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .catch((error) => {
        throw this.throwerErrorGuard.BadRequestException(
          SharepointErrorsEnum.POST_DATA_TO_SHAREPOINT_ERROR,
          `${
            SharepointErrorsResponseEnum.POST_DATA_TO_SHAREPOINT_ERROR
          } Error: ${<string>error}, posted data: ${postData.toString()}.`,
        )
      })
      .then((res: AxiosResponse<{ d: { ID: string | number } }, object>) =>
        res.data.d.ID.toString(),
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

  private getValuesForFields(
    fields: Record<string, string>,
    paths: Record<string, SharepointColumnMapValue>,
    form: Forms,
    formDefinition: FormDefinition
  ): Record<string, string> {
    const result: Record<string, string> = {}
    Object.keys(fields).forEach((key) => {
      switch (paths[key].type) {
        case 'json_path':
          result[fields[key]] = this.getValueAtJsonPath(
            form.formDataJson,
            paths[key],
          )
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
            `${SharepointErrorsResponseEnum.UNKNOWNN_TYPE_IN_SHAREPOINT_DATA}. Type: ${paths[key].type}`,
          )
      }
    })

    return result
  }

  private getValueAtJsonPath(
    jsonFormData: Prisma.JsonValue,
    columnMapValue: SharepointColumnMapValue,
  ): string {
    if (columnMapValue.info === undefined) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        SharepointErrorsEnum.SHAREPOINT_DATA_NOT_PROVIDED,
        `${SharepointErrorsResponseEnum.SHAREPOINT_DATA_NOT_PROVIDED} There must be an info field for json_path.`,
      )
    }
    let atPath = lodashGet(jsonFormData, columnMapValue.info, '')
    if (typeof atPath === 'boolean') {
      atPath = atPath ? 'áno' : 'nie'
    } else if (Array.isArray(atPath)) {
      atPath = (atPath as Array<object>).map((x) => x.toString()).join(', ')
    }
    return atPath
  }

  private getTitle(form: Forms, formDefinition: FormDefinition): string {
    const messageSubject = getSubjectTextFromForm(form, formDefinition)
    // fallback to messageSubject if title can't be parsed
    return getFrontendFormTitleFromForm(form, formDefinition) || messageSubject
  }
}
