/* eslint-disable no-await-in-loop */
/* eslint-disable no-secrets/no-secrets */
import * as crypto from 'node:crypto'
import { Stream } from 'node:stream'

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Forms } from '@prisma/client'
import axios, { AxiosResponse } from 'axios'
import {
  FormDefinitionSlovenskoSk,
  isSlovenskoSkFormDefinition,
  isSlovenskoSkTaxFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { buildSlovenskoSkXml } from 'forms-shared/slovensko-sk/xmlBuilder'
import jwt from 'jsonwebtoken'
import mime from 'mime-types'
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid'

import { CognitoGetUserData } from '../../auth/dtos/cognito.dto'
import ConvertService from '../../convert/convert.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import TaxService from '../../tax/tax.service'
import { ErrorsEnum } from '../../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import alertError from '../../utils/logging'
import MinioClientSubservice from '../../utils/subservices/minio-client.subservice'
import {
  NasesIsMessageDeliveredDto,
  NasesSendFormDataDto,
  NasesSendResponse,
  ResponseGdprDataDto,
} from '../dtos/responses.dto'
import { NasesAttachmentXmlObject } from '../dtos/xml.dto'
import {
  NasesErrorCodesEnum,
  NasesErrorCodesResponseEnum,
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../nases.errors.enum'
import { AxiosError } from 'axios'

@Injectable()
export default class NasesUtilsService {
  private readonly logger: Logger

  constructor(
    private readonly convertService: ConvertService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private prismaService: PrismaService,
    private minioClientSubservice: MinioClientSubservice,
    private taxService: TaxService,
    private configService: ConfigService,
  ) {
    this.logger = new Logger('NasesUtilsService')
  }

  private tokenValidation(
    rawHead: string,
    rawBody: string,
    signature:
      | WithImplicitCoercion<string>
      | {
          [Symbol.toPrimitive](hint: 'string'): string
        },
  ): boolean {
    const publicKey = this.configService.getOrThrow<string>('OBO_TOKEN_PUBLIC')
    const verifyObject = crypto.createVerify('RSA-SHA256')
    verifyObject.write(`${rawHead}.${rawBody}`)
    verifyObject.end()
    const base64Signature = Buffer.from(signature, 'base64').toString('base64')
    const signatureIsValid = verifyObject.verify(
      publicKey,
      base64Signature,
      'base64',
    )
    return signatureIsValid
  }

  private async stream2buffer(stream: Stream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      // eslint-disable-next-line no-underscore-dangle
      const _buf = new Array<any>()

      stream.on('data', (chunk) => _buf.push(chunk))
      stream.on('end', () => resolve(Buffer.concat(_buf)))
      // eslint-disable-next-line prefer-promise-reject-errors, @typescript-eslint/restrict-template-expressions
      stream.on('error', (err) => reject(`error converting stream - ${err}`))
    })
  }

  // TODO error handling of this function
  private async createAttachmentsIfExists(
    form: Forms,
    formDefinition: FormDefinitionSlovenskoSk,
  ): Promise<NasesAttachmentXmlObject[]> {
    const result: NasesAttachmentXmlObject[] = []
    const files = await this.prismaService.files.findMany({
      where: {
        formId: form.id,
      },
    })

    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      const mimeType = mime.lookup(file.fileName) || 'application/pdf'
      const fileStream = await this.minioClientSubservice.loadFileStream(
        this.configService.getOrThrow<string>('MINIO_SAFE_BUCKET'),
        `${file.pospId}/${form.id}/${file.minioFileName}`,
      )
      // eslint-disable-next-line no-restricted-syntax
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
        const base64FormPdf = await this.taxService.getFilledInPdfBase64(
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
          _: base64FormPdf,
        })
      } catch (error) {
        console.error(
          `ERROR - Printing form to attachment to Nases and Noris error for form id ${form.id}`,
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

  async getUserInfo(bearerToken: string): Promise<ResponseGdprDataDto> {
    return axios
      .post(
        `${this.configService.getOrThrow<string>('USER_ACCOUNT_API')}/user/get-or-create`,
        undefined,
        {
          headers: {
            Authorization: bearerToken,
          },
        },
      )
      .then((response: AxiosResponse<ResponseGdprDataDto>) => response.data)
      .catch((error) => {
        throw this.throwerErrorGuard.NotFoundException(
          NasesErrorsEnum.CITY_ACCOUNT_USER_GET_ERROR,
          `${NasesErrorsResponseEnum.CITY_ACCOUNT_USER_GET_ERROR} error: ${<
            string
          >error}`,
        )
      })
  }

  async getUri(
    bearerToken?: string,
    userData?: CognitoGetUserData,
  ): Promise<string | null> {
    if (bearerToken === undefined) return null

    if (!userData || !userData.family_name || !userData.given_name) {
      return null
    }

    let birthNumber: string
    try {
      const userInfo = await this.getUserInfo(bearerToken)
      if (userInfo.birthNumber === null) {
        return null
      }
      birthNumber = userInfo.birthNumber
    } catch (error) {
      alertError('Error when retrieving user info', this.logger, <string>error)
      return null
    }

    // TODO remove when slovensko.sk uri will be retrievable.
    return `rc://sk/${birthNumber}_${userData.family_name.toLowerCase()}_${userData.given_name.toLowerCase()}`

    // TODO And put back this
    /* const result = await axios
      .post(
        `${
          this.configService.getOrThrow<string>('SLOVENSKO_SK_CONTAINER_URI')
        }/api/iam/identities/search`,
        {
          uris: [
            `rc://sk/${birthNumber}_${userData.family_name.toLowerCase()}_${userData.given_name.toLowerCase()}`,
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.createTechnicalAccountJwtToken()}`,
          },
        },
      )
      .then((response: AxiosResponse) => {
        if (response.data && Array.isArray(response.data)) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return response.data[0].uri as string;
          } catch (error) {
            return null;
          }
        }
        return null;
      })
      .catch((error) => {
        alertError(
          'There was an error when retrieving uri from slovensko.sk',
          this.logger,
          <string>error
        )
        return null;
      });

    return result; */
  }

  private async getFormMessage(
    form: Forms,
    isSigned: boolean,
  ): Promise<string | object> {
    let message: string | object | null = null

    if (form.formDataBase64) {
      // Remove any whitespace characters - data saved from signer software may contain those & slovensko.sk can't handle them
      message = form.formDataBase64.replaceAll(/\s/g, '')
    }

    if (!isSigned) {
      try {
        message = await this.convertService.convertJsonToXmlObjectForForm(form)
      } catch (error) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `There was an error during converting json form data to xml: ${<string>error}`,
        )
      }
    }

    if (!message) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ErrorsEnum.UNPROCESSABLE_ENTITY_ERROR,
        `Message of body is not defined. There is no base64 nor schema`,
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
    senderUri?: string,
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
        `createEnvelopeSendMessage: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE}: ${formDefinition.type}, form id: ${form.id}`,
      )
    }
    const { isSigned, pospID, pospVersion, title } = formDefinition

    const message = await this.getFormMessage(form, isSigned)

    const senderId =
      senderUri ?? this.configService.get<string>('NASES_SENDER_URI') ?? ''
    const correlationId = uuidv4()
    let subject: string = form.id
    let mimeType = 'application/x-eform-xml'
    let encoding = 'XML'
    let attachments: NasesAttachmentXmlObject[] = []

    if (isSlovenskoSkTaxFormDefinition(formDefinition)) {
      subject = 'Podávanie daňového priznanie k dani z nehnuteľností' // TODO fix in formDefinition, quickfix here formDefinition.messageSubjectDefault
      mimeType = 'application/vnd.etsi.asic-e+zip'
      encoding = 'Base64'
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
              xmlns: 'http://schemas.gov.sk/core/MessageContainer/1.0',
            },
            MessageId: form.id,
            SenderId: senderId,
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

  private getNasesError(code: number): string {
    const codeString = `0${code.toString()}`
    if (!Object.keys(NasesErrorCodesEnum).includes(codeString)) {
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
  async sendMessageNases(
    jwtToken: string,
    data: Forms,
    senderUri?: string,
  ): Promise<NasesSendResponse> {
    let message
    try {
      message = await this.createEnvelopeSendMessage(data, senderUri)
    } catch (error) {
      return {
        status: 500,
        data: {
          message: `Failed to create envelope for nases message: ${(error as Error)?.message || 'Unknown error'}. Details: ${JSON.stringify(error)}`,
        },
      }
    }
    try {
      const response = await axios.post(
        `${this.configService.getOrThrow<string>(
          'SLOVENSKO_SK_CONTAINER_URI',
        )}/api/sktalk/receive_and_save_to_outbox`,
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
        return {
          status: 422,
          data: {
            message:
              'Server error in response data, please contact administrator',
          },
        }
      }

      if (response.data.receive_result !== 0) {
        return {
          status: 422,
          data: {
            message: this.getNasesError(response.data.receive_result),
          },
        }
      }

      return { status: 200, data: response.data }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        return { status: error.response.status, data: error.response.data }
      }
      return {
        status: 400,
        data: {
          message: 'Other server error, please contact administrator',
        },
      }
    }
  }

  async isNasesMessageDelivered(formId: string): Promise<boolean> {
    const jwtToken = this.createTechnicalAccountJwtToken()
    const result = await axios
      .get(
        `${this.configService.getOrThrow<string>(
          'SLOVENSKO_SK_CONTAINER_URI',
        )}/api/edesk/messages/search?correlation_id=${formId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      )
      .then(
        (response: AxiosResponse<NasesIsMessageDeliveredDto[]>) =>
          response.data.length > 0,
      )
      .catch((error) => {
        alertError(
          'Error when checking if message is in eDesk',
          this.logger,
          <string>error,
        )
        return false
      })

    return result
  }
}
/* eslint-enable no-secrets/no-secrets */
/* eslint-enable no-await-in-loop */
