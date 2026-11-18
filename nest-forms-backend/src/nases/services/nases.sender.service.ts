import { Stream } from 'node:stream'

import {
  ErrorEnum,
  ErrorFactoryService,
  LineLoggerService,
} from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import { AxiosResponse, isAxiosError } from 'axios'
import {
  FormDefinitionSlovenskoSk,
  isSlovenskoSkFormDefinition,
  isSlovenskoSkTaxFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { extractFormSubjectTechnical } from 'forms-shared/form-utils/formDataExtractors'
import { buildSlovenskoSkXml } from 'forms-shared/slovensko-sk/xmlBuilder'
import mime from 'mime-types'
import { SktalkReceiveAndSaveToOutboxResult } from 'openapi-clients/slovensko-sk'
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid'

import ClientsService from '../../clients/clients.service'
import BaConfigService from '../../config/ba-config.service'
import ConvertService from '../../convert/convert.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import { Forms } from '../../generated/prisma/client'
import { MinioStorageService } from '../../minio-storage/minio-storage.service'
import PrismaService from '../../prisma/prisma.service'
import TaxService from '../../tax/tax.service'
import {
  NasesErrorCodesEnum,
  NasesErrorCodesResponseEnum,
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../nases.errors.enum'
import { NasesAttachmentXmlObject } from '../types/xml.types'

@Injectable()
export default class NasesSenderService {
  constructor(
    private readonly convertService: ConvertService,
    private readonly errorFactoryService: ErrorFactoryService,
    private prismaService: PrismaService,
    private minioStorageService: MinioStorageService,
    private taxService: TaxService,
    private readonly baConfigService: BaConfigService,
    private readonly clientsService: ClientsService,
    private readonly logger: LineLoggerService,
  ) {}

  private async stream2buffer(stream: Stream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const _buf: Buffer[] = []

      stream.on('data', (chunk: Buffer) => _buf.push(chunk))
      stream.on('end', () => {
        resolve(Buffer.concat(_buf))
      })

      stream.on('error', (error) => {
        reject(new Error(`error converting stream - ${error}`))
      })
    })
  }

  // TODO error handling of this function
  private async createAttachmentsIfExists(
    form: Forms,
    formDefinition: FormDefinitionSlovenskoSk,
  ): Promise<NasesAttachmentXmlObject[]> {
    if (form.formDataJson == null) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: FormsErrorsEnum.EMPTY_FORM_DATA,
        message: FormsErrorsResponseEnum.EMPTY_FORM_DATA,
      })
    }

    const result: NasesAttachmentXmlObject[] = []
    const files = await this.prismaService.files.findMany({
      where: {
        formId: form.id,
      },
    })

    const fileAttachments = await Promise.all(
      files.map(async (file) => {
        const mimeType = mime.lookup(file.fileName) || 'application/pdf'
        const fileStream = await this.minioStorageService.loadFileStream(
          this.baConfigService.minio.buckets.safe,
          `${file.pospId}/${form.id}/${file.minioFileName}`,
        )
        const fileBuffer = await this.stream2buffer(fileStream)
        const fileBase64 = fileBuffer.toString('base64')
        return {
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
        }
      }),
    )
    result.push(...fileAttachments)
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
        this.logger.error(
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
        this.logger.error(
          `ERROR - Printing summary to attachment to Nases and Noris error for form id ${form.id}`,
          error,
        )
      }
    }
    return result
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
        throw this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message:
            'There was an error during converting json form data to xml.',
          error,
        })
      }
    }

    if (!message) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: ErrorEnum.UNPROCESSABLE_ENTITY_ERROR,
        message:
          'Message of body is not defined. There is no base64 nor schema',
      })
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
      throw this.errorFactoryService.NotFoundException({
        errorEnum: FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        message: `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      })
    }
    if (!isSlovenskoSkFormDefinition(formDefinition)) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        message: `createEnvelopeSendMessage: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE}`,
        console: { formDefinitionType: formDefinition.type, formId: form.id },
      })
    }
    const { isSigned, pospID, pospVersion, title } = formDefinition

    const message = await this.getFormMessage(formDefinition, form, isSigned)

    if (form.formDataJson == null) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: FormsErrorsEnum.EMPTY_FORM_DATA,
        message: `createEnvelopeSendMessage: ${FormsErrorsResponseEnum.EMPTY_FORM_DATA}`,
      })
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
          // eslint-disable-next-line sonarjs/no-clear-text-protocols -- XML namespace URIs are fixed identifiers defined by the SKTalk protocol; they are not network endpoints
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
              // eslint-disable-next-line sonarjs/no-clear-text-protocols -- XML namespace URI fixed by the SKTalk MessageContainer schema; not a network endpoint
              xmlns: 'http://schemas.gov.sk/core/MessageContainer/1.0',
            },
            MessageId: form.id,
            SenderId: senderUri,
            RecipientId: this.baConfigService.slovenskoSk.nasesRecipientUri,
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
    } Code: ${code}, Text: ${NasesErrorCodesEnum[codeString]} - ${
      NasesErrorCodesResponseEnum[codeString]
    }`
  }

  async send(
    jwtToken: string,
    data: Forms,
    senderUri: string,
  ): Promise<SktalkReceiveAndSaveToOutboxResult> {
    let message: string
    try {
      message = await this.createEnvelopeSendMessage(data, senderUri)
    } catch (error) {
      throw this.errorFactoryService.InternalServerErrorException({
        errorEnum: NasesErrorsEnum.CREATE_ENVELOPE_ERROR,
        message: NasesErrorsResponseEnum.CREATE_ENVELOPE_ERROR,
        console: { formId: data.id },
        error,
      })
    }

    let response: AxiosResponse<SktalkReceiveAndSaveToOutboxResult>
    try {
      response =
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
    } catch (error) {
      if (isAxiosError(error)) {
        throw this.errorFactoryService.fromAxiosError(error, {
          message: NasesErrorsResponseEnum.SEND_TO_NASES_ERROR,
          console: { formId: data.id },
        })
      }

      throw this.errorFactoryService.InternalServerErrorException({
        errorEnum: NasesErrorsEnum.SEND_TO_NASES_ERROR,
        message: NasesErrorsResponseEnum.SEND_TO_NASES_ERROR,
        console: { formId: data.id },
        error,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive guard; typed as non-null but real API responses can omit the body
    if (!response.data) {
      throw this.errorFactoryService.BadGatewayException({
        errorEnum: NasesErrorsEnum.SEND_TO_NASES_ERROR,
        message: `${NasesErrorsResponseEnum.SEND_TO_NASES_ERROR} Empty response body.`,
        console: { formId: data.id },
      })
    }

    if (response.data.receive_result !== 0) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: NasesErrorsEnum.SEND_TO_NASES_ERROR,
        message: this.getNasesError(response.data.receive_result),
        console: { formId: data.id, responseData: response.data },
      })
    }

    return response.data
  }
}
