import { Readable } from 'node:stream'

import { Injectable, StreamableFile } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Forms, FormState } from '@prisma/client'
import { GenericObjectType } from '@rjsf/utils'
import { Response } from 'express'
import {
  FormDefinition,
  FormDefinitionSlovenskoSk,
  isSlovenskoSkFormDefinition,
  isSlovenskoSkTaxFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { ClientFileInfo } from 'forms-shared/form-files/fileStatus'
import { mergeClientAndServerFilesSummary } from 'forms-shared/form-files/mergeClientAndServerFiles'
import {
  extractJsonFromSlovenskoSkXml,
  ExtractJsonFromSlovenskoSkXmlError,
} from 'forms-shared/slovensko-sk/extractJson'
import { generateSlovenskoSkXmlObject } from 'forms-shared/slovensko-sk/generateXml'
import { buildSlovenskoSkXml } from 'forms-shared/slovensko-sk/xmlBuilder'
import { getFormSummary } from 'forms-shared/summary/summary'
import { renderSummaryPdf } from 'forms-shared/summary-pdf/renderSummaryPdf'
import { validateSummary } from 'forms-shared/summary-renderer/validateSummary'
import {
  versionCompareIsContinuable,
  versionCompareRequiresConfirmationImportXml,
} from 'forms-shared/versioning/version-compare'
import { chromium } from 'playwright'

import { User } from '../auth-v2/types/user'
import FormValidatorRegistryService from '../form-validator-registry/form-validator-registry.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import PrismaService from '../prisma/prisma.service'
import TaxService from '../tax/tax.service'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { FormWithFiles } from '../utils/types/prisma'
import { patchConvertServiceTaxFormDefinition } from './convert.helper'
import {
  ConvertToPdfRequestDto,
  JsonToXmlV2RequestDto,
  XmlToJsonRequestDto,
  XmlToJsonResponseDto,
} from './dtos/form.dto'
import { extractJsonErrorMapping } from './errors/convert.errors.dto'
import {
  ConvertErrorsEnum,
  ConvertErrorsResponseEnum,
} from './errors/convert.errors.enum'

@Injectable()
export default class ConvertService {
  private readonly logger: LineLoggerSubservice

  private readonly versioningEnabled: boolean

  constructor(
    private readonly taxService: TaxService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly formsService: FormsService,
    private readonly prismaService: PrismaService,
    private readonly formValidatorRegistryService: FormValidatorRegistryService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new LineLoggerSubservice('ConvertService')
    this.versioningEnabled =
      this.configService.getOrThrow<string>('FEATURE_TOGGLE_VERSIONING') ===
      'true'
  }

  private async convertJsonToXmlObject(
    form: Forms,
    formDefinition: FormDefinitionSlovenskoSk,
    formDataJson: PrismaJson.FormDataJson,
  ): Promise<GenericObjectType> {
    // Find a better way how to get the form with files
    const formWithFiles = (await this.prismaService.forms.findUnique({
      where: {
        id: form.id,
      },
      include: {
        files: true,
      },
    })) as FormWithFiles

    const formDefinitionPatched = isSlovenskoSkTaxFormDefinition(formDefinition)
      ? patchConvertServiceTaxFormDefinition(formDefinition)
      : formDefinition

    // Forms that are not sent have their summary generated on the fly. For sent forms the summary is stored in the database.
    // Sent forms cannot contain `clientFiles` and don't render errors (it is not possible to send form with errors).
    const formSummary =
      form.state === FormState.DRAFT
        ? getFormSummary({
            formDefinition: formDefinitionPatched,
            formDataJson,
            validatorRegistry: this.formValidatorRegistryService.getRegistry(),
          })
        : form.formSummary

    if (formSummary == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_SUMMARY,
        `convertJsonToXmlObject: ${FormsErrorsResponseEnum.EMPTY_FORM_SUMMARY}`,
      )
    }

    return generateSlovenskoSkXmlObject({
      formDefinition: formDefinitionPatched,
      formSummary,
      formId: form.id,
      jsonVersion: form.jsonVersion,
      formData: formDataJson,
      serverFiles: formWithFiles.files,
    })
  }

  /**
   * Do not use directly for user facing endpoints as this bypasses the access check in `convertJsonToXmlObjectNewGovernment`.
   *
   * TODO: Pass files to the function instead
   */
  async convertJsonToXmlObjectForForm(
    form: Forms,
    formDataJsonOverride?: PrismaJson.FormDataJson,
  ): Promise<GenericObjectType> {
    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (formDefinition === null) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `convertJsonToXmlForForm: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }
    if (!isSlovenskoSkFormDefinition(formDefinition)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        `convertJsonToXmlForForm: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE}: ${formDefinition.type}, slug: ${form.formDefinitionSlug}`,
      )
    }
    const formDataJson = formDataJsonOverride ?? form.formDataJson

    if (formDataJson == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_DATA,
        `convertJsonToXmlForForm: ${FormsErrorsResponseEnum.EMPTY_FORM_DATA}`,
      )
    }

    return this.convertJsonToXmlObject(form, formDefinition, formDataJson)
  }

  async convertJsonToXmlV2(
    formId: string,
    data: JsonToXmlV2RequestDto,
  ): Promise<string> {
    const form = await this.formsService.getUniqueForm(formId)

    if (!form) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      )
    }

    const xmlObject = await this.convertJsonToXmlObjectForForm(
      form,
      data.jsonData,
    )
    return buildSlovenskoSkXml(xmlObject, { headless: false, pretty: true })
  }

  async convertXmlToJson(
    formId: string,
    data: XmlToJsonRequestDto,
  ): Promise<XmlToJsonResponseDto> {
    const form = await this.formsService.getUniqueForm(formId)

    if (!form) {
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

    if (!isSlovenskoSkFormDefinition(formDefinition)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE}: ${formDefinition.type}, slug: ${form.formDefinitionSlug}`,
      )
    }

    let extractJsonResult: {
      formDataJson: GenericObjectType
      jsonVersion: string
    }
    try {
      extractJsonResult = await extractJsonFromSlovenskoSkXml(
        isSlovenskoSkTaxFormDefinition(formDefinition)
          ? patchConvertServiceTaxFormDefinition(formDefinition)
          : formDefinition,
        data.xmlForm,
      )
    } catch (error) {
      if (error instanceof ExtractJsonFromSlovenskoSkXmlError) {
        const { error: errorEnum, message: errorMessage } =
          extractJsonErrorMapping[error.type]
        throw this.throwerErrorGuard.BadRequestException(
          // eslint-disable-next-line custom-rules/thrower-error-guard-enum
          errorEnum,
          errorMessage,
        )
      }
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Unexpected error during XML to JSON conversion',
        undefined,
        error,
      )
    }

    if (
      this.versioningEnabled &&
      !versionCompareIsContinuable({
        currentVersion: extractJsonResult.jsonVersion,
        latestVersion: formDefinition.jsonVersion,
      })
    ) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ConvertErrorsEnum.INCOMPATIBLE_JSON_VERSION,
        ConvertErrorsResponseEnum.INCOMPATIBLE_JSON_VERSION,
      )
    }
    return {
      formDataJson: extractJsonResult.formDataJson,
      requiresVersionConfirmation: this.versioningEnabled
        ? versionCompareRequiresConfirmationImportXml({
            currentVersion: extractJsonResult.jsonVersion,
            latestVersion: formDefinition.jsonVersion,
          })
        : false,
    }
  }

  private async generateTaxPdf(
    formDataJson: PrismaJson.FormDataJson,
    formId: string,
  ): Promise<Readable> {
    try {
      const base64Pdf = await this.taxService.getFilledInPdfBase64(
        formDataJson,
        formId,
      )

      const buffer = Buffer.from(base64Pdf, 'base64')
      return Readable.from(buffer)
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'There was an error during generating pdf.',
        undefined,
        error,
      )
    }
  }

  public async generatePdf(
    jsonForm: PrismaJson.FormDataJson,
    formId: string,
    formDefinition: FormDefinition,
    clientFiles?: ClientFileInfo[],
    /**
     * If true, the summary PDF instead of government sheet will be generated for tax form.
     */
    forceSummaryPdfForTaxForm?: boolean,
  ): Promise<Readable> {
    const form = await this.prismaService.forms.findUnique({
      where: {
        id: formId,
      },
      include: {
        files: true,
      },
    })
    if (form === null) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      )
    }

    if (
      isSlovenskoSkTaxFormDefinition(formDefinition) &&
      !forceSummaryPdfForTaxForm
    ) {
      return this.generateTaxPdf(jsonForm, formId)
    }

    let pdfBuffer: Buffer
    try {
      // Forms that are not sent have their summary generated on the fly. For sent forms the summary is stored in the database.
      // Sent forms cannot contain `clientFiles` and don't render errors (it is not possible to send form with errors).
      if (form.state === FormState.DRAFT) {
        const formSummary = getFormSummary({
          formDefinition,
          formDataJson: jsonForm,
          validatorRegistry: this.formValidatorRegistryService.getRegistry(),
        })
        const fileInfos = mergeClientAndServerFilesSummary(
          clientFiles,
          form.files,
        )
        const { validationData } = validateSummary({
          schema: formDefinition.schema,
          formData: jsonForm,
          fileInfos,
          validatorRegistry: this.formValidatorRegistryService.getRegistry(),
        })
        pdfBuffer = await renderSummaryPdf({
          formSummary,
          validationData,
          launchBrowser: () => chromium.launch(),
          clientFiles,
          serverFiles: form.files,
        })
      } else {
        if (form.formSummary == null) {
          throw this.throwerErrorGuard.UnprocessableEntityException(
            FormsErrorsEnum.EMPTY_FORM_SUMMARY,
            FormsErrorsResponseEnum.EMPTY_FORM_SUMMARY,
          )
        }

        pdfBuffer = await renderSummaryPdf({
          formSummary: form.formSummary,
          validationData: null,
          launchBrowser: () => chromium.launch(),
          serverFiles: form.files,
        })
      }
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ConvertErrorsEnum.PDF_GENERATION_FAILED,
        ConvertErrorsResponseEnum.PDF_GENERATION_FAILED,
        undefined,
        error,
      )
    }

    return Readable.from(pdfBuffer)
  }

  async convertToPdf(
    data: ConvertToPdfRequestDto,
    res: Response,
    user: User,
  ): Promise<StreamableFile> {
    const form = await this.formsService.getFormWithAccessCheck(
      data.formId,
      user,
    )

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    const formJsonData = data.jsonData ?? form.formDataJson

    if (formJsonData == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_DATA,
        FormsErrorsResponseEnum.EMPTY_FORM_DATA,
      )
    }

    const file = await this.generatePdf(
      formJsonData,
      data.formId,
      formDefinition,
      data.clientFiles as ClientFileInfo[],
    )

    res.set({
      'Content-Type': 'application/pdf',
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Disposition': `attachment; filename="${formDefinition.slug}.pdf"`,
    })

    return new StreamableFile(file)
  }
}
