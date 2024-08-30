import { PassThrough, Readable } from 'node:stream'

import { Injectable, Logger, StreamableFile } from '@nestjs/common'
import { Forms, Prisma } from '@prisma/client'
import { GenericObjectType, RJSFSchema } from '@rjsf/utils'
import * as cheerio from 'cheerio'
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
import { generateSlovenskoSkXml } from 'forms-shared/slovensko-sk/generateXml'
import { renderSummaryPdf } from 'forms-shared/summary-pdf/renderSummaryPdf'
import { chromium } from 'playwright'
import { parseStringPromise } from 'xml2js'
import { firstCharLowerCase } from 'xml2js/lib/processors'

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import PrismaService from '../prisma/prisma.service'
import TaxService from '../tax/tax.service'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import { JsonSchema } from '../utils/types/global'
import { FormWithFiles } from '../utils/types/prisma'
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
import createXmlTemplate from './utils-services/createXmlTemplate'
import JsonXmlConvertService from './utils-services/json-xml.convert.service'

@Injectable()
export default class ConvertService {
  private readonly logger: Logger

  constructor(
    private readonly jsonXmlService: JsonXmlConvertService,
    private readonly taxService: TaxService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly formsService: FormsService,
    private readonly prismaService: PrismaService,
    private readonly minioClientSubservice: MinioClientSubservice,
  ) {
    this.logger = new Logger('ConvertService')
  }

  /**
   * Temporary function to convert forms with new government XMLs, will be deleted when all the forms are migrated.
   */
  private async convertJsonToXmlNewGovernment(
    form: Forms,
    formDefinition: FormDefinitionSlovenskoSk,
    formDataJson: Prisma.JsonValue,
    headless: boolean,
  ): Promise<string> {
    // Find a better way how to get the form with files
    const formWithFiles = (await this.prismaService.forms.findUnique({
      where: {
        id: form.id,
      },
      include: {
        files: true,
      },
    })) as FormWithFiles

    return generateSlovenskoSkXml(
      formDefinition,
      formDataJson as GenericObjectType,
      formWithFiles.files,
      headless,
    )
  }

  private async convertJsonToXmlLegacy(
    formDefinition: FormDefinitionSlovenskoSk,
    formDataJson: Prisma.JsonValue,
  ): Promise<string> {
    const xmlTemplate = createXmlTemplate(formDefinition)
    const $ = cheerio.load(xmlTemplate, {
      xmlMode: true,
      decodeEntities: false,
    })
    this.jsonXmlService.buildXmlRecursive(
      ['E-form', 'Body'],
      $,
      formDataJson,
      formDefinition.schemas.schema as JsonSchema,
    )
    return $('E-form').prop('outerHTML') ?? ''
  }

  /**
   * Do not use directly for user facing endpoints as this bypasses the access check in `convertJsonToXmlNewGovernment`.
   *
   * TODO: Pass files to the function instead
   */
  async convertJsonToXmlForForm(
    form: Forms,
    headless: boolean,
    formDataJsonOverride?: Prisma.JsonValue,
  ): Promise<string> {
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

    if (formDefinition.newGovernmentXml) {
      return this.convertJsonToXmlNewGovernment(
        form,
        formDefinition,
        formDataJson,
        headless,
      )
    }

    return this.convertJsonToXmlLegacy(formDefinition, formDataJson)
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

    return this.convertJsonToXmlForForm(form, false, data.jsonData)
  }

  private async convertXmlToJsonLegacy(
    xmlData: string,
    formDefinition: FormDefinitionSlovenskoSk,
  ): Promise<GenericObjectType> {
    // xml2js has issues when top level element isn't a single node
    const wrappedXmlString = `<wrapper>${xmlData}</wrapper>`
    const obj: { wrapper: GenericObjectType } = (await parseStringPromise(
      wrappedXmlString,
      {
        tagNameProcessors: [firstCharLowerCase],
      },
    )) as { wrapper: GenericObjectType }
    const body: RJSFSchema = (
      obj.wrapper['e-form']
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          obj.wrapper['e-form'][0].body[0]
        : obj.wrapper
    ) as RJSFSchema
    this.jsonXmlService.removeNeedlessXmlTransformArraysRecursive(
      body,
      [],
      formDefinition.schemas.schema as JsonSchema,
    )
    return body
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

    if (formDefinition.newGovernmentXml) {
      try {
        const jsonForm = await extractJsonFromSlovenskoSkXml(
          formDefinition,
          data.xmlForm,
        )
        return { jsonForm }
      } catch (error) {
        if (error instanceof ExtractJsonFromSlovenskoSkXmlError) {
          const { error: errorEnum, message: errorMessage } =
            extractJsonErrorMapping[error.type]
          throw this.throwerErrorGuard.BadRequestException(
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

    const jsonForm = await this.convertXmlToJsonLegacy(
      data.xmlForm,
      formDefinition,
    )
    return { jsonForm }
  }

  private async generateTaxPdf(
    formDataJson: Prisma.JsonValue,
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
    jsonForm: Prisma.JsonValue,
    formId: string,
    formDefinition: FormDefinition,
    clientFiles?: ClientFileInfo[],
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

    if (isSlovenskoSkTaxFormDefinition(formDefinition)) {
      return this.generateTaxPdf(jsonForm, formId)
    }

    let pdfBuffer: Buffer
    try {
      pdfBuffer = await renderSummaryPdf({
        jsonSchema: formDefinition.schemas.schema,
        uiSchema: formDefinition.schemas.uiSchema,
        formData: jsonForm as GenericObjectType,
        launchBrowser: () => chromium.launch(),
        clientFiles,
        serverFiles: form.files,
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

  getTaxDebugBucketDirectoryName(jsonData: Prisma.JsonValue): string {
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
