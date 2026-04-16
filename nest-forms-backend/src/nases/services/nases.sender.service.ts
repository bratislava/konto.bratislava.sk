
import { Stream } from 'node:stream'

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Forms } from '@prisma/client'
import { isAxiosError } from 'axios'
import {
  FormDefinitionSlovenskoSk,
  isSlovenskoSkFormDefinition,
  isSlovenskoSkTaxFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { extractFormSubjectTechnical } from 'forms-shared/form-utils/formDataExtractors'
import { buildSlovenskoSkXml } from 'forms-shared/slovensko-sk/xmlBuilder'
import jwt from 'jsonwebtoken'
import mime from 'mime-types'
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid'

import ClientsService from '../../clients/clients.service'
import ConvertService from '../../convert/convert.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import TaxService from '../../tax/tax.service'
import { ErrorsEnum } from '../../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import MinioClientSubservice from '../../utils/subservices/minio-client.subservice'
import { NasesSendResponse } from '../dtos/responses.dto'
import { NasesAttachmentXmlObject } from '../dtos/xml.dto'
import {
  NasesErrorCodesEnum,
  NasesErrorCodesResponseEnum,
  NasesErrorsResponseEnum,
} from '../nases.errors.enum'

@Injectable()
export default class NasesSenderService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly convertService: ConvertService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private prismaService: PrismaService,
    private minioClientSubservice: MinioClientSubservice,
    private taxService: TaxService,
    private configService: ConfigService,
    private readonly clientsService: ClientsService,
  ) {
    this.logger = new LineLoggerSubservice('NasesSenderService')
  }

  private async stream2buffer(stream: Stream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const _buf = new Array<any>()

      stream.on('data', (chunk) => _buf.push(chunk))
      stream.on('end', () => {
        resolve(Buffer.concat(_buf))
      })

      stream.on('error', (err) => {
        reject(new Error(`error converting stream - ${err}`))
      })
    })
  }

  // TODO error handling of this function
  private async createAttachmentsIfExists(
    form: Forms,
    formDefinition: FormDefinitionSlovenskoSk,
  ): Promise<NasesAttachmentXmlObject[]> {
    if (form.formDataJson == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_DATA,
        FormsErrorsResponseEnum.EMPTY_FORM_DATA,
      )
    }

    const result: NasesAttachmentXmlObject[] = []
    const files = await this.prismaService.files.findMany({
      where: {
        formId: form.id,
      },
    })

    for (const file of files) {
      const mimeType = mime.lookup(file.fileName) || 'application/pdf'
      const fileStream = await this.minioClientSubservice.loadFileStream(
        this.configService.getOrThrow<string>('MINIO_SAFE_BUCKET'),
        `${file.pospId}/${form.id}/${file.minioFileName}`,
      )

      const fileBuffer = await this.stream2buffer(fileStream)
      const fileBase64 = fileBuffer.toString('base64')
      result.push({
        $: {
          Id: file.id,
          IsSigned: 'false',
          Name: file.fileName,
          Description: 'ATTACHMENT',
          Class: 'ATTACHMENT',
          MimeType: mimeType,
          Encoding: 'Base64',
        },
        _: fileBase64,
      })
    }
    if (isSlovenskoSkTaxFormDefinition(formDefinition)) {
      try {
        const formPdfBase64 = await this.taxService.getFilledInPdfBase64(
          form.formDataJson,
          form.id,
        )
        result.push({
          $: {
            Id: uuidv1(),
            IsSigned: 'false',
            Name: 'printed-form.pdf',
            Description: 'ATTACHMENT',
            Class: 'ATTACHMENT',
            MimeType: 'application/pdf',
            Encoding: 'Base64',
          },
          _: formPdfBase64,
        })
      } catch (error) {
        console.error(
          `ERROR - Printing form to attachment to Nases and Noris error for form id ${form.id}`,
          error,
        )
      }
      try {
        const summaryPdfReadable = await this.convertService.generatePdf(
          form.formDataJson,
          form.id,
          formDefinition,
          undefined,
          true,
        )
        const summaryPdfBuffer = await this.stream2buffer(summaryPdfReadable)
        const summaryPdfBase64 = summaryPdfBuffer.toString('base64')

        result.push({
          $: {
            Id: uuidv1(),
            IsSigned: 'false',
            Name: 'summary-form.pdf',
            Description: 'ATTACHMENT',
            Class: 'ATTACHMENT',
            MimeType: 'application/pdf',
            Encoding: 'Base64',
          },
          _: summaryPdfBase64,
        })
      } catch (error) {
        console.error(
          `ERROR - Printing summary to attachment to Nases and Noris error for form id ${form.id}`,
          error,
        )
      }
    }
    return result
  }

  createUserJwtToken(oboToken: string): string {
    const payload = {
      jti: uuidv1(),
      obo: oboToken,
    }
    const options: jwt.SignOptions = {
      algorithm: 'RS256',
      expiresIn: '5m', // 5 minutes
      header: {
        alg: 'RS256',
        cty: 'JWT',
      },
    }

    return jwt.sign(
      payload,
      this.configService.getOrThrow<string>('API_TOKEN_PRIVATE'),
      options,
    )
  }

  createTechnicalAccountJwtToken(): string {
    const payload = {
      sub: this.configService.getOrThrow<string>('SUB_NASES_TECHNICAL_ACCOUNT'),
      jti: uuidv1(),
      obo: null,
    }

    const options: jwt.SignOptions = {
      algorithm: 'RS256',
      expiresIn: '5m', // 5 minutes
    }

    return jwt.sign(
      payload,
      this.configService.getOrThrow<string>('API_TOKEN_PRIVATE'),
      options,
    )
  }

  createAdministrationJwtToken(): string {
    const payload = {
      jti: uuidv1(),
    }

    const options: jwt.SignOptions = {
      algorithm: 'RS256',
      expiresIn: '5m', // 5 minutes
    }

    return jwt.sign(
      payload,
      this.configService.getOrThrow<string>('API_TOKEN_PRIVATE'),
      options,
    )
  }

  private async getFormMessage(
    formDefinition: FormDefinitionSlovenskoSk,
    form: Forms,
    isSigned: boolean,
  ): Promise<string | object> {
    let message: string | object | null = null

    if (formDefinition.isSigned && form.formSignature?.signatureBase64) {
      // Remove any whitespace characters - data saved from signer software may contain those & slovensko.sk can't handle them
      message = form.formSignature.signatureBase64.replaceAll(/\s/g, '')
    }

    if (!isSigned) {
      try {
        message = await this.convertService.convertJsonToXmlObjectForForm(form)
      } catch (error) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'There was an error during converting json form data to xml.',
          undefined,
          error,
        )
      }
    }

    if (!message) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ErrorsEnum.UNPROCESSABLE_ENTITY_ERROR,
        'Message of body is not defined. There is no base64 nor schema',
      )
    }

    return message
  }

  /**
   * Dynamically creates a subject of the submission. If there is not a subject format in the form definition,
   * it uses default from the form definition.
   *
   * It replaces an occurrence of "{path}" with a value from data.formDataJson, at the given path. There are three possibilities:
   * - If there is a string, it just prints the string
   * - If there is an array of strings, it prints them separated by a comma
   * - Otherwise prints empty string ""
   *
   * For example if the format is "Format {name}, children: {data.children}, missing: {missing}" and the formDataJson is
   * {name: "Example", data: {children: ["child1", "child2"]}}, the result is "Format Example, children: child1, child2, missing: ???"
   *
   * @param data Form instance
   * @returns message subject generated for the given form
   */
  private async createEnvelopeSendMessage(
    form: Forms,
    senderUri: string,
  ): Promise<string> {
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
        `createEnvelopeSendMessage: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE}`,
        { formDefinitionType: formDefinition.type, formId: form.id },
      )
    }
    const { isSigned, pospID, pospVersion, title } = formDefinition

    const message = await this.getFormMessage(formDefinition, form, isSigned)

    if (form.formDataJson == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_DATA,
        `createEnvelopeSendMessage: ${FormsErrorsResponseEnum.EMPTY_FORM_DATA}`,
      )
    }
    const subject = extractFormSubjectTechnical(
      formDefinition,
      form.formDataJson,
    )
    const correlationId = uuidv4()
    const mimeType = isSigned
      ? 'application/vnd.etsi.asic-e+zip'
      : 'application/x-eform-xml'
    const encoding = isSigned ? 'Base64' : 'XML'
    let attachments: NasesAttachmentXmlObject[] = []

    if (isSlovenskoSkTaxFormDefinition(formDefinition)) {
      attachments = await this.createAttachmentsIfExists(form, formDefinition)
    }

    const attachmentBase = {
      $: {
        Id: form.id,
        IsSigned: isSigned ? 'true' : 'false',
        Name: title,
        Description: '',
        Class: 'FORM',
        MimeType: mimeType,
        Encoding: encoding,
      },
    }

    if (typeof message === 'string') {
      attachments.push({
        ...attachmentBase,
        _: message,
      })
    } else if (typeof message === 'object') {
      attachments.push({
        ...attachmentBase,
        ...message,
      })
    }

    const template = {
      SKTalkMessage: {
        $: {
          // eslint-disable-next-line sonarjs/no-clear-text-protocols
          xmlns: 'http://gov.sk/SKTalkMessage',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
        },
        EnvelopeVersion: '3.0',
        Header: {
          MessageInfo: {
            Class: 'EGOV_APPLICATION',
            PospID: pospID,
            PospVersion: pospVersion,
            MessageID: form.id,
            CorrelationID: correlationId,
          },
        },
        Body: {
          MessageContainer: {
            $: {
              // eslint-disable-next-line sonarjs/no-clear-text-protocols
              xmlns: 'http://schemas.gov.sk/core/MessageContainer/1.0',
            },
            MessageId: form.id,
            SenderId: senderUri,
            RecipientId: this.configService.getOrThrow<string>(
              'NASES_RECIPIENT_URI',
            ),
            MessageType: pospID,
            MessageSubject: subject,
            Object: attachments,
          },
        },
      },
    }

    return buildSlovenskoSkXml(template, { headless: false, pretty: false })
  }

  private getNasesError(code: number | null): string {
    const codeString = code ? `0${code.toString()}` : null
    if (
      codeString == null ||
      !Object.keys(NasesErrorCodesEnum).includes(codeString)
    ) {
      return `${NasesErrorsResponseEnum.SEND_TO_NASES_ERROR} Code: ${code} (unknown code)`
    }

    return `${
      NasesErrorsResponseEnum.SEND_TO_NASES_ERROR
    } Code: ${code}, Text: ${
      NasesErrorCodesEnum[codeString as keyof typeof NasesErrorCodesEnum]
    } - ${
      NasesErrorCodesResponseEnum[
        codeString as keyof typeof NasesErrorCodesResponseEnum
      ]
    }`
  }

  // TODO nicer error handling, for now it is assumed this function never throws and a lot of code relies on that
  async send(
    jwtToken: string,
    data: Forms,
    senderUri: string,
  ): Promise<NasesSendResponse> {
    let message
    try {
      message = await this.createEnvelopeSendMessage(data, senderUri)
    } catch (error) {
      return {
        status: 500,
        data: {
          message: `Failed to create envelope for nases message: ${(error as Error).message || 'Unknown error'}. Details: ${JSON.stringify(error)}`,
        },
      }
    }
    try {
      const response =
        await this.clientsService.slovenskoSkApi.apiSktalkReceiveAndSaveToOutboxPost(
          {
            message,
          },
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          },
        )

      if (!response.data) {
        // TODO temp SEND_TO_NASES_ERROR log, remove
        console.log(
          `SEND_TO_NASES_ERROR: ${NasesErrorsResponseEnum.SEND_TO_NASES_ERROR} additional info - formId: ${data.id}, response.data: EMPTY, message: ${message}`,
        )

        return {
          status: 422,
          data: {
            message:
              'Server error in response data, please contact administrator',
          },
        }
      }

      if (response.data.receive_result !== 0) {
        // TODO temp SEND_TO_NASES_ERROR log, remove
        console.log(
          `SEND_TO_NASES_ERROR: ${NasesErrorsResponseEnum.SEND_TO_NASES_ERROR} additional info - formId: ${data.id}, response.data: ${JSON.stringify(
            response.data,
          )}, message: ${message}`,
        )

        return {
          status: 422,
          data: {
            message: this.getNasesError(response.data.receive_result),
          },
        }
      }

      return { status: 200, data: response.data }
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        return { status: error.response.status, data: error.response.data }
      }
      // TODO temp SEND_TO_NASES_ERROR log, remove
      console.log(
        `SEND_TO_NASES_ERROR: ${NasesErrorsResponseEnum.SEND_TO_NASES_ERROR} additional info - formId: ${data.id}, message: ${message}`,
      )
      return {
        status: 400,
        data: {
          message: 'Other server error, please contact administrator',
        },
      }
    }
  }
}
