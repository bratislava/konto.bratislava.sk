import { PassThrough, Readable } from 'node:stream'

import { Injectable, StreamableFile } from '@nestjs/common'
import { Forms } from '@prisma/client'
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
import {
  extractJsonFromSlovenskoSkXml,
  ExtractJsonFromSlovenskoSkXmlError,
} from 'forms-shared/slovensko-sk/extractJson'
import { generateSlovenskoSkXmlObject } from 'forms-shared/slovensko-sk/generateXml'
import { buildSlovenskoSkXml } from 'forms-shared/slovensko-sk/xmlBuilder'
import { renderSummaryPdf } from 'forms-shared/summary-pdf/renderSummaryPdf'
import { chromium } from 'playwright'

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
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
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
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

  constructor(
    private readonly taxService: TaxService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly formsService: FormsService,
    private readonly prismaService: PrismaService,
    private readonly minioClientSubservice: MinioClientSubservice,
    private readonly formValidatorRegistryService: FormValidatorRegistryService,
  ) {
    this.logger = new LineLoggerSubservice('ConvertService')
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

    return generateSlovenskoSkXmlObject(
      isSlovenskoSkTaxFormDefinition(formDefinition)
        ? patchConvertServiceTaxFormDefinition(formDefinition)
        : formDefinition,
      formDataJson,
      this.formValidatorRegistryService.getRegistry(),
      formWithFiles.files,
    )
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

    return this.convertJsonToXmlObject(form, formDefinition, formDataJson)
  }

  async convertJsonToXmlV2(
    data: JsonToXmlV2RequestDto,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<string> {
    const form = await this.formsService.getFormWithAccessCheck(
      data.formId,
      user?.sub ?? null,
      ico,
    )

    const xmlObject = await this.convertJsonToXmlObjectForForm(
      form,
      data.jsonData,
    )
    return buildSlovenskoSkXml(xmlObject, { headless: false, pretty: true })
  }

  async convertXmlToJson(
    data: XmlToJsonRequestDto,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<XmlToJsonResponseDto> {
    const form = await this.formsService.getFormWithAccessCheck(
      data.formId,
      user?.sub ?? null,
      ico,
    )

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

    try {
      const jsonForm = await extractJsonFromSlovenskoSkXml(
        isSlovenskoSkTaxFormDefinition(formDefinition)
          ? patchConvertServiceTaxFormDefinition(formDefinition)
          : formDefinition,
        data.xmlForm,
      )
      return { jsonForm }
    } catch (error) {
      if (error instanceof ExtractJsonFromSlovenskoSkXmlError) {
        const { error: errorEnum, message: errorMessage } =
          extractJsonErrorMapping[error.type]
        throw this.throwerErrorGuard.BadRequestException(
          // eslint-disable-next-line custom-rules/thrower-error-guard-enum
          errorEnum,
          errorMessage,
        )
      } else {
        this.logger.error(
          `Unexpected error during XML to JSON conversion: ${error}`,
        )
        throw error
      }
    }
  }

  private async generateTaxPdf(
    formDataJson: PrismaJson.FormDataJson,
    formId?: string,
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
        `There was an error during generating pdf. ${<string>error}`,
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
      pdfBuffer = await renderSummaryPdf({
        formDefinition,
        formData: jsonForm,
        launchBrowser: () => chromium.launch(),
        clientFiles,
        serverFiles: form.files,
        validatorRegistry: this.formValidatorRegistryService.getRegistry(),
      })
    } catch (error) {
      this.logger.error(`Error during generating PDF: ${<string>error}`)

      throw this.throwerErrorGuard.InternalServerErrorException(
        ConvertErrorsEnum.PDF_GENERATION_FAILED,
        ConvertErrorsResponseEnum.PDF_GENERATION_FAILED,
      )
    }

    return Readable.from(pdfBuffer)
  }

  async convertToPdf(
    data: ConvertToPdfRequestDto,
    ico: string | null,
    res: Response,
    user?: CognitoGetUserData,
  ): Promise<StreamableFile> {
    // for eligible tax forms (those of signed-in users) store json before transform and the transformed pdf itself for debug purposes
    let taxDebugBucket = ''
    let directoryName = ''
    let stringifiedData = ''
    let shouldStoreDebugPdfData = false

    const form = await this.formsService.getFormWithAccessCheck(
      data.formId,
      user?.sub ?? null,
      ico,
    )

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    const formJsonData = data.jsonData ?? form.formDataJson

    // common init for both json and pdf debug storage
    if (isSlovenskoSkTaxFormDefinition(formDefinition)) {
      try {
        taxDebugBucket = process.env.TAX_PDF_DEBUG_BUCKET || 'forms-tax-debug'
        directoryName = this.getTaxDebugBucketDirectoryName(formJsonData)
        stringifiedData = JSON.stringify(data, null, 2)
        shouldStoreDebugPdfData = true
      } catch (error) {
        console.error(
          `Error "statusCode":500 - failed to init debugDataStorage, will skip creating files in mino`,
        )
        console.error(error)
      }
    }

    // store json before transform
    if (shouldStoreDebugPdfData) {
      this.minioClientSubservice
        .putObject(
          taxDebugBucket,
          `${directoryName}/json.json`,
          stringifiedData,
        )
        .catch((error) => {
          console.error(
            `Error "statusCode":500 - failed to create a copy of pdf form, serialized form data: ${stringifiedData}`,
          )
          console.error(error)
        })
    }

    const file = await this.generatePdf(
      formJsonData,
      data.formId,
      formDefinition,
      data.clientFiles as ClientFileInfo[],
    )

    // we need two separate streams to read from - reading just from the file stream above would empty it and no data would be left for response
    // reference: https://stackoverflow.com/a/51143558
    const minioStream = new PassThrough()
    const responseStream = new PassThrough()
    file.pipe(minioStream)
    file.pipe(responseStream)

    // store pdf after transform
    if (shouldStoreDebugPdfData) {
      this.minioClientSubservice
        .putObject(taxDebugBucket, `${directoryName}/pdf.pdf`, file)
        .catch((error) => {
          console.error(
            `Error 500 - failed to create a copy of pdf form, serialized form data: ${stringifiedData}`,
          )
          console.error(error)
        })
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Disposition': `attachment; filename="${formDefinition.slug}.pdf"`,
    })

    return new StreamableFile(responseStream)
  }

  getTaxDebugBucketDirectoryName(jsonData: PrismaJson.FormDataJson): string {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions */
    const udajeODanovnikovi = (jsonData as any)?.udajeODanovnikovi
    const directoryName = [
      udajeODanovnikovi?.priznanieAko === 'fyzickaOsobaPodnikatel'
        ? 'SZCO'
        : udajeODanovnikovi?.priznanieAko === 'pravnickaOsoba'
          ? 'PO'
          : 'FO',
      udajeODanovnikovi?.priezvisko ??
        udajeODanovnikovi?.obchodneMenoAleboNazov,
      udajeODanovnikovi?.menoTitul?.meno,
      new Date().toISOString(),
    ]
      .filter((s: any) => typeof s === 'string')
      .map((s: string, index, array) =>
        index === array.length - 1 ? s : encodeURIComponent(s),
      )
      .join('-')
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions */
    return directoryName
  }
}
