/* eslint-disable no-await-in-loop */
/* eslint-disable no-secrets/no-secrets */
import * as crypto from 'node:crypto'
import { Stream } from 'node:stream'

import { Injectable, Logger } from '@nestjs/common'
import axios, { AxiosResponse } from 'axios'
import mime from 'mime-types'
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid'

import { CognitoGetUserData } from '../../auth/dtos/cognito.dto'
import ConvertService from '../../convert/convert.service'
import PrismaService from '../../prisma/prisma.service'
import TaxService from '../../tax/tax.service'
import { ErrorsEnum } from '../../utils/global-enums/errors.enum'
import { JsonSchema } from '../../utils/global-forms'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import alertError from '../../utils/logging'
import MinioClientSubservice from '../../utils/subservices/minio-client.subservice'
import { FormWithSchemaAndVersion } from '../../utils/types/prisma'
import {
  NasesIsMessageDeliveredDto,
  NasesSendFormDataDto,
  NasesSendResponse,
  ResponseGdprDataDto,
} from '../dtos/responses.dto'
import {
  NasesErrorCodesEnum,
  NasesErrorCodesResponseEnum,
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../nases.errors.enum'

@Injectable()
export default class NasesUtilsService {
  private readonly logger: Logger

  constructor(
    private readonly convertService: ConvertService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private prismaService: PrismaService,
    private minioClientSubervice: MinioClientSubservice,
    private taxService: TaxService,
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
    const publicKey = process.env.OBO_TOKEN_PUBLIC ?? ''
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
    form: FormWithSchemaAndVersion,
  ): Promise<string> {
    let result = ''
    const files = await this.prismaService.files.findMany({
      where: {
        formId: form.id,
      },
    })
    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      const mimeType = mime.lookup(file.fileName) || 'application/pdf'
      const fileStream = await this.minioClientSubervice.loadFileStream(
        process.env.MINIO_SAFE_BUCKET!,
        `${file.pospId}/${form.id}/${file.minioFileName}`,
      )
      // eslint-disable-next-line no-restricted-syntax
      const fileBuffer = await this.stream2buffer(fileStream)
      const fileBase64 = fileBuffer.toString('base64')
      result += `<Object Id="${file.id}" IsSigned="false" Name="${file.fileName}" Description="ATTACHMENT" Class="ATTACHMENT" MimeType="${mimeType}" Encoding="Base64">${fileBase64}</Object>`
    }
    if (form.schemaVersion?.pospID === process.env.TAX_FORM_POSP_ID) {
      try {
        const base64FormPdf = await this.taxService.getFilledInPdfBase64(
          form.formDataJson,
          form.id,
        )
        result += `<Object Id="${uuidv1()}" IsSigned="false" Name="printed-form.pdf" Description="ATTACHMENT" Class="ATTACHMENT" MimeType="application/pdf" Encoding="Base64">${base64FormPdf}</Object>`
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
    const privateKey = process.env.API_TOKEN_PRIVATE ?? ''
    const header = {
      alg: 'RS256',
      cty: 'JWT',
    }
    const exp = Math.floor(new Date(Date.now() + 5 * 60_000).getTime() / 1000)
    const jti = uuidv1()
    const payload = {
      exp,
      jti,
      obo: oboToken,
    }
    const headerEncode = Buffer.from(JSON.stringify(header)).toString(
      'base64url',
    )
    const payloadEncode = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    )
    const buffer = Buffer.from(`${headerEncode}.${payloadEncode}`)
    const singature = crypto
      .sign('sha256', buffer, { key: privateKey })
      .toString('base64url')
    return `${headerEncode}.${payloadEncode}.${singature}`
  }

  createTechnicalAccountJwtToken(): string {
    const privateKey = process.env.API_TOKEN_PRIVATE ?? ''
    const header = {
      alg: 'RS256',
    }
    const jti = uuidv1()
    const exp = Math.floor(new Date(Date.now() + 5 * 60_000).getTime() / 1000)
    const payload = {
      sub: process.env.SUB_NASES_TECHNICAL_ACCOUNT,
      exp,
      jti,
      obo: null,
    }
    const headerEncode = Buffer.from(JSON.stringify(header)).toString(
      'base64url',
    )
    const payloadEncode = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    )
    const buffer = Buffer.from(`${headerEncode}.${payloadEncode}`)
    const singature = crypto
      .sign('sha256', buffer, { key: privateKey })
      .toString('base64url')
    return `${headerEncode}.${payloadEncode}.${singature}`
  }

  createAdministrationJwtToken(): string {
    const privateKey = process.env.API_TOKEN_PRIVATE ?? ''
    const header = {
      alg: 'RS256',
    }
    const jti = uuidv1()
    const exp = Math.floor(new Date(Date.now() + 5 * 60_000).getTime() / 1000)
    const payload = {
      exp,
      jti,
    }
    const headerEncode = Buffer.from(JSON.stringify(header)).toString(
      'base64url',
    )
    const payloadEncode = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    )
    const buffer = Buffer.from(`${headerEncode}.${payloadEncode}`)
    const singature = crypto
      .sign('sha256', buffer, { key: privateKey })
      .toString('base64url')
    return `${headerEncode}.${payloadEncode}.${singature}`
  }

  async getUserInfo(bearerToken: string): Promise<ResponseGdprDataDto> {
    return axios
      .post(
        `${process.env.USER_ACCOUNT_API ?? ''}/user/get-or-create`,
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
          process.env.SLOVENSKO_SK_CONTAINER_URI ?? ''
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

  private formatXmlToOneLine(xml: string): string {
    const result = xml
      .replaceAll(/\s+/g, ' ') // replace all multiple whitespaces with just one space
      .replaceAll(/>\s+</g, '><') // delete all whitespaces between tags
      .replaceAll(/\s*<\s*/g, '<') // delete all whitespaces (spaces) around tag marks
      .replaceAll(/\s*>\s*/g, '>')
      .replaceAll(/\s*\/>/g, '/>')
      .replaceAll(/<\/\s*/g, '</')
      .trim()

    return result
  }

  /**
   * Dynamically creates a subject of the submission. If there is not a subject format in the schema version,
   * it uses default from the schema.
   *
   * It replaces an occurence of "{path}" with a value from data.formDataJson, at the given path. There are three possibilities:
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
    data: FormWithSchemaAndVersion,
    senderUri?: string,
  ): Promise<string> {
    const { xmlTemplate, jsonSchema, isSigned } = data.schemaVersion

    if (jsonSchema === null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ErrorsEnum.UNPROCESSABLE_ENTITY_ERROR,
        `Json schema for schema version with id ${data.schemaVersionId} is null.`,
      )
    }

    let message: string | null = null

    if (data.formDataBase64) {
      message = data.formDataBase64
    }
    if (!isSigned) {
      try {
        message = this.convertService.convertJsonToXml(
          data.formDataJson,
          xmlTemplate,
          jsonSchema as JsonSchema,
        ).xmlForm
      } catch (error) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `There was an error during converting json form data to xml: ${<
            string
          >error}`,
        )
      }
    }

    if (!message) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ErrorsEnum.UNPROCESSABLE_ENTITY_ERROR,
        `Message of body is not defined. There is no base64 nor schema`,
      )
    }
    // message = Buffer.from(message, 'binary').toString('base64');
    let envelope: string
    // envelope = `
    // <?xml version="1.0" encoding="utf-8"?>
    // <SKTalkMessage xmlns="http://gov.sk/SKTalkMessage" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    //   <EnvelopeVersion>3.0</EnvelopeVersion>
    //   <Header>
    //     <MessageInfo>
    //       <Class>EGOV_APPLICATION</Class>
    //       <PospID>App.GeneralAgenda</PospID>
    //       <PospVersion>1.9</PospVersion>
    //       <MessageID>0d83aadc-edba-4d1d-9a2f-d62eae985c51</MessageID>
    //       <CorrelationID>0d83aadc-edba-4d1d-9a2f-d62eae985c51</CorrelationID>

    //     </MessageInfo>
    //   </Header>
    //   <Body>
    //     <MessageContainer xmlns="http://schemas.gov.sk/core/MessageContainer/1.0">
    //       <MessageId>0d83aadc-edba-4d1d-9a2f-d62eae985c51</MessageId>
    //       <SenderId>e264cea1-acdc-4db0-8901-275d15b1f48a</SenderId>
    //       <RecipientId>e264cea1-acdc-4db0-8901-275d15b1f48a</RecipientId>
    //       <MessageType>App.GeneralAgenda</MessageType>
    //       <MessageSubject>Podanie</MessageSubject>
    //       <Object Id="0d83aadc-edba-4d1d-9a2f-d62eae985c51" IsSigned="false" Name="Všeobecná agenda" Description="Všeobecná agenda" Class="FORM" MimeType="application/x-eform-xml" Encoding="XML">
    //         <GeneralAgenda xmlns="http://schemas.gov.sk/form/App.GeneralAgenda/1.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    //   <subject>predmet</subject>
    //   <text>popis</text>
    // </GeneralAgenda>
    //       </Object>
    //     </MessageContainer>
    //   </Body>
    // </SKTalkMessage>
    // `
    const { pospID, pospVersion, schema, formDescription } = data.schemaVersion
    const senderId = senderUri ?? process.env.NASES_SENDER_URI ?? ''
    const correlationId = uuidv4()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const objectId = uuidv4()
    let subject: string = data.id
    let mimeType = 'application/x-eform-xml'
    let encoding = 'XML'
    let attachments = ''

    if (isSigned) {
      subject = 'Podávanie daňového priznanie k dani z nehnuteľností' // TODO fix in schema, quickfix here data?.schemaVersion.schema.messageSubject
      mimeType = 'application/vnd.etsi.asic-e+zip'
      encoding = 'Base64'
      attachments = await this.createAttachmentsIfExists(data)
    }
    envelope = `
            <?xml version="1.0" encoding="utf-8"?>
            <SKTalkMessage xmlns="http://gov.sk/SKTalkMessage" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
              <EnvelopeVersion>3.0</EnvelopeVersion>
              <Header>
                <MessageInfo>
                  <Class>EGOV_APPLICATION</Class>
                  <PospID>${pospID}</PospID>
                  <PospVersion>${pospVersion}</PospVersion>
                  <MessageID>${data.id}</MessageID>
                  <CorrelationID>${correlationId}</CorrelationID>
                </MessageInfo>
              </Header>
              <Body>
                <MessageContainer xmlns="http://schemas.gov.sk/core/MessageContainer/1.0">
                  <MessageId>${data.id}</MessageId>
                  <SenderId>${senderId}</SenderId>
                  <RecipientId>${
                    process.env.NASES_RECIPIENT_URI ?? ''
                  }</RecipientId>
                  <MessageType>${pospID}</MessageType>
                  <MessageSubject>${subject}</MessageSubject>
                  <Object Id="${data.id}" IsSigned="${
                    isSigned ? 'true' : 'false'
                  }" Name="${schema.formName}" Description="${
                    formDescription ?? ''
                  }" Class="FORM" MimeType="${mimeType}" Encoding="${encoding}">${message}</Object>
    ${attachments}
                </MessageContainer>
              </Body>
            </SKTalkMessage>
      `
    // <Object Id="${data.id}" IsSigned="${String(data.isSigned)}" Name="${data.formName}" Description="${data.fromDescription}" Class="FORM" MimeType="application/vnd.etsi.asic-e+zip" Encoding="Base64">
    // <Object Id="${data.id}" IsSigned="${String(data.isSigned)}" Name="${data.formName}" Description="${data.fromDescription}" Class="FORM" MimeType="application/x-eform-xml" Encoding="XML">
    envelope = this.formatXmlToOneLine(envelope)
    return envelope
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

  async sendMessageNases(
    jwt: string,
    data: FormWithSchemaAndVersion,
    senderUri?: string,
  ): Promise<NasesSendResponse> {
    const message = await this.createEnvelopeSendMessage(data, senderUri)
    const result = await axios
      .post(
        `${
          process.env.SLOVENSKO_SK_CONTAINER_URI ?? ''
        }/api/sktalk/receive_and_save_to_outbox`,
        {
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      )
      .then((response: AxiosResponse<NasesSendFormDataDto>) => {
        if (response.data) {
          if (response.data.receive_result !== 0) {
            return {
              status: 422,
              data: {
                message: this.getNasesError(response.data.receive_result),
              },
            }
          }
          return { status: 200, data: response.data }
        }
        return {
          status: 422,
          data: {
            message:
              'Server error in response data, please contact administrator',
          },
        }
      })
      .catch((error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error.response && error.response.data) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          return { status: error.response.status, data: error.response.data }
        }
        return {
          status: 400,
          data: {
            message: 'Other server error, please contact administrator',
          },
        }
      })
    return result
  }

  async isNasesMessageDelivered(formId: string): Promise<boolean> {
    const jwt = this.createTechnicalAccountJwtToken()
    const result = await axios
      .get(
        `${
          process.env.SLOVENSKO_SK_CONTAINER_URI ?? ''
        }/api/edesk/messages/search?correlation_id=${formId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
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
