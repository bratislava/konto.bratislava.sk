import { PassThrough, Readable } from 'node:stream'

import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, StreamableFile } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@prisma/client'
import { GenericObjectType, RJSFSchema } from '@rjsf/utils'
import * as cheerio from 'cheerio'
import { Response } from 'express'
import {
  FormDefinition,
  isSlovenskoSkFormDefinition,
  isSlovenskoSkTaxFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import * as jwt from 'jsonwebtoken'
import puppeteer from 'puppeteer'
import { v4 as uuidv4 } from 'uuid'
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
import { JsonSchema, PdfPreviewJwtPayload } from '../utils/types/global'
import {
  ConvertToPdfV2RequestDto,
  JsonToXmlV2RequestDto,
  PdfPreviewDataResponseDto,
  XmlToJsonResponseDto,
} from './dtos/form.dto'
import {
  ConvertErrorsEnum,
  ConvertErrorsResponseEnum,
} from './errors/convert.errors.enum'
import createXmlTemplate from './utils-services/createXmlTemplate'
import JsonXmlConvertService from './utils-services/json-xml.convert.service'

@Injectable()
export default class ConvertService {
  private readonly jwtSecret: string

  constructor(
    private readonly jsonXmlService: JsonXmlConvertService,
    private readonly taxService: TaxService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly configService: ConfigService,
    private readonly formsService: FormsService,
    private readonly prismaService: PrismaService,
    private readonly minioClientSubservice: MinioClientSubservice,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.jwtSecret = this.configService.get('JWT_SECRET') ?? ''
  }

  async convertJsonToXmlV2(
    data: JsonToXmlV2RequestDto,
    ico: string | null,
    user?: CognitoGetUserData,
  ): Promise<string> {
    const formDefinition = getFormDefinitionBySlug(data.slug)
    if (formDefinition === null) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${data.slug}`,
      )
    }
    if (!isSlovenskoSkFormDefinition(formDefinition)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        `convertJsonToXmlv2: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE}: ${formDefinition.type}, slug: ${data.slug}`,
      )
    }

    let jsonFormData = data.jsonData
    if (jsonFormData === undefined) {
      if (data.formId === undefined) {
        throw this.throwerErrorGuard.BadRequestException(
          ConvertErrorsEnum.FORM_ID_MISSING,
          ConvertErrorsResponseEnum.FORM_ID_MISSING,
        )
      }

      const form = await this.formsService.getFormWithAccessCheck(
        data.formId,
        user?.sub ?? null,
        ico,
      )
      jsonFormData = form.formDataJson
    }

    const xmlTemplate = createXmlTemplate(formDefinition)
    const $ = cheerio.load(xmlTemplate, {
      xmlMode: true,
      decodeEntities: false,
    })
    this.jsonXmlService.buildXmlRecursive(
      ['E-form', 'Body'],
      $,
      jsonFormData,
      formDefinition.schemas.schema as JsonSchema,
    )
    return $('E-form').prop('outerHTML') ?? ''
  }

  async convertXmlToJson(
    xmlData: string,
    formDefinitionSlug: string,
  ): Promise<XmlToJsonResponseDto> {
    const formDefinition = getFormDefinitionBySlug(formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${formDefinitionSlug}`,
      )
    }

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
    return {
      jsonForm: body,
    }
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

  private async generatePuppeteerPdf(jwtToken: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: 'new',
      // Using no sandbox is a minor security issue, but OK if we trust the content we are rendering.
      // https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
      // TODO: Must be fixed in Dockerfile to run as a non-root user.
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const frontendUrl = (this.configService.get('FRONTEND_URL') as string) ?? ''
    // In development Next.js, the server renders the page using JavaScript. For production, to speed things up, we
    // disable the JavaScript execution (when it is on, it also displays cookie consent banner).
    const isLocalhost = frontendUrl.includes('localhost')

    try {
      const page = await browser.newPage()
      if (!isLocalhost) {
        await page.setJavaScriptEnabled(false)
      }

      const response = await page.goto(
        `${frontendUrl}/pdf-preview?jwtToken=${jwtToken}`,
      )

      if (!response || response.status() !== 200) {
        throw this.throwerErrorGuard.BadRequestException(
          ConvertErrorsEnum.PUPPETEER_PAGE_FAILED_LOAD,
          ConvertErrorsResponseEnum.PUPPETEER_PAGE_FAILED_LOAD,
        )
      }

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          bottom: '1cm',
          left: '1cm',
          right: '1cm',
        },
      })

      await browser.close()
      return pdfBuffer
    } catch (error) {
      await browser.close()
      throw error
    }
  }

  async getPdfPreviewData(
    jwtToken: string,
  ): Promise<PdfPreviewDataResponseDto> {
    const decoded = jwt.verify(jwtToken, this.jwtSecret)
    if (
      typeof decoded !== 'object' ||
      !(decoded as PdfPreviewJwtPayload).uuid
    ) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ConvertErrorsEnum.INVALID_JWT_TOKEN,
        ConvertErrorsResponseEnum.INVALID_JWT_TOKEN,
      )
    }

    const data = await this.cacheManager.get(
      (decoded as PdfPreviewJwtPayload).uuid,
    )
    if (!data) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ConvertErrorsEnum.INVALID_UUID,
        ConvertErrorsResponseEnum.INVALID_UUID,
      )
    }

    return data as PdfPreviewDataResponseDto
  }

  /**
   * Ordinary (non-tax) PDF is generated by visiting "/pdf-preview" page in Next.js app and converting it to PDF using
   * Puppeteer. It is not possible to pass large data directly in the page request, so it is done in the following way:
   * 1. This function receives the payload.
   * 2. It generates a UUID and stores the payload in the cache.
   * 3. As it contains sensitive data, the UUID is signed using JWT.
   * 4. In `generatePuppeteerPdf`, Puppeteer visits the page and passes the JWT token as a query parameter.
   * 5. The page fetches the data using `getPdfPreviewData` (which verifies the token and retrieves the data from the
   * cache) and renders it.
   * 6. Puppeteer converts the page to PDF and returns it.
   *
   * The cache/JWT token is short-lived because it is set and retrieved in the same request.
   */
  public async generatePdfV2(
    jsonForm: Prisma.JsonValue,
    formId: string,
    formDefinition: FormDefinition,
    additionalMetadata?: Prisma.JsonObject,
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

    const pdfData: PdfPreviewDataResponseDto = {
      formDefinitionSlug: formDefinition.slug,
      jsonForm,
      serverFiles: form.files,
      additionalMetadata,
    }

    const generatedUuid = uuidv4()
    await this.cacheManager.set(generatedUuid, pdfData, 30_000)

    const jwtToken = jwt.sign(
      { uuid: generatedUuid } satisfies PdfPreviewJwtPayload,
      this.jwtSecret,
      {
        expiresIn: '30s',
      },
    )

    const pdfBuffer = await this.generatePuppeteerPdf(jwtToken)
    return Readable.from(pdfBuffer)
  }

  async convertToPdfV2(
    data: ConvertToPdfV2RequestDto,
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

    let formJsonData = data.jsonData
    if (formJsonData === undefined) {
      formJsonData = form.formDataJson
    }

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

    const file = await this.generatePdfV2(
      formJsonData,
      data.formId,
      formDefinition,
      data.additionalMetadata,
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
