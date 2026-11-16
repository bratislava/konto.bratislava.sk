import { Readable } from 'node:stream'

import {
  ErrorEnum,
  ErrorFactoryService,
  LineLoggerService,
} from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError, AxiosResponse } from 'axios'
import { v1, v4 } from 'uuid'
import type { Mock, MockedFunction } from 'vitest'
import { Builder, Parser } from 'xml2js'

import prismaMock from '../../../../test/singleton'
import { createTestForm } from '../../../__tests__/factories/form.factory'
import ClientsService from '../../../clients/clients.service'
import BaConfigService from '../../../config/ba-config.service'
import ConvertService from '../../../convert/convert.service'
import { FileStatus } from '../../../generated/prisma/client'
import { MinioStorageService } from '../../../minio-storage/minio-storage.service'
import PrismaService from '../../../prisma/prisma.service'
import TaxService from '../../../tax/tax.service'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../../nases.errors.enum'
import NasesSenderService from '../nases.sender.service'

vi.mock('../../../minio-storage/minio-storage.service')
vi.mock('../../../convert/convert.service')
vi.mock('uuid', () => ({
  v4: vi.fn(),
  v1: vi.fn(),
}))

const createMockReadableStream = (content: string): Readable => {
  const readableStream = new Readable()

  readableStream._read = vi.fn()
  readableStream.push(content)
  readableStream.push(null)
  return readableStream
}

describe('NasesSenderService', () => {
  let service: NasesSenderService
  let clientsService: ClientsService

  beforeEach(async () => {
    vi.resetAllMocks()
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LineLoggerService,
          useValue: createMock<LineLoggerService>(),
        },
        NasesSenderService,
        ConvertService,
        ErrorFactoryService,
        { provide: PrismaService, useValue: prismaMock },
        MinioStorageService,
        { provide: TaxService, useValue: createMock<TaxService>() },
        { provide: ClientsService, useValue: createMock<ClientsService>() },
        {
          provide: BaConfigService,
          useValue: {
            minio: { buckets: { safe: '' } },
            slovenskoSk: { nasesRecipientUri: 'example_recipient' },
          },
        },
      ],
    }).compile()

    service = app.get<NasesSenderService>(NasesSenderService)
    clientsService = app.get(ClientsService)
  })

  describe('should be defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })
  })

  describe('getNasesError', () => {
    it('should return unknown error if code is not in enum', () => {
      const error = service['getNasesError'](1234)
      expect(error).toBe(
        `${NasesErrorsResponseEnum.SEND_TO_NASES_ERROR} Code: 1234 (unknown code)`,
      )
    })

    it('should return known error if code is in enum', () => {
      const error = service['getNasesError'](3_100_001)
      expect(error).toBe(
        `${NasesErrorsResponseEnum.SEND_TO_NASES_ERROR} Code: 3100001, Text: Chyba vstupných údajov - Vstupný parameter message je nevyplnený`,
      )
    })
  })

  describe('createEnvelopeSendMessage', () => {
    it('should create XML', async () => {
      const mockFiles = [
        {
          id: 'id-file0001',
          pospId: 'posp0001',
          formId: 'form0001',
          scannerId: 'scanner0001',
          minioFileName: 'miniofile0001',
          fileName: 'file0001.pdf',
          fileSize: 512,
          slotId: null,
          status: FileStatus.ACCEPTED,
          ginisOrder: 1,
          ginisUploaded: false,
          ginisUploadedError: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'id-file0002',
          pospId: 'posp0002',
          formId: 'form0002',
          scannerId: null,
          minioFileName: 'miniofile0002',
          fileName: 'file0002.pdf',
          fileSize: 512,
          slotId: null,
          status: FileStatus.ACCEPTED,
          ginisOrder: null,
          ginisUploaded: true,
          ginisUploadedError: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(v4 as Mock).mockReturnValue('12345678-1234-1234-1234-123456789012')
      ;(v1 as Mock)
        .mockReturnValueOnce('12345678-1234-1234-1234-123456789012')
        .mockReturnValueOnce('98765432-9876-9876-9876-987654321098')

      service['convertService'].convertJsonToXmlObjectForForm = vi
        .fn()
        .mockResolvedValue({
          eform: {
            tag1: [{ $: { attribute: 'value1' } }],
            tag2: [{ $: { attribute: 'value2' }, _: 'Content' }],
            tag3: ['Another content\n'],
          },
        })

      prismaMock.files.findMany.mockResolvedValue(mockFiles)

      service['minioStorageService'].loadFileStream = vi
        .fn()
        .mockImplementation((_: string, filename: string) =>
          createMockReadableStream(`test string for input: ${filename}`),
        )

      service['taxService'].getFilledInPdfBase64 = vi
        .fn()
        .mockResolvedValue('AWUKDHLAIUWDHU=====')

      service['convertService'].generatePdf = vi
        .fn()
        .mockImplementation(() =>
          createMockReadableStream('Summary PDF content with form details'),
        )

      let returnXmlString = await service['createEnvelopeSendMessage'](
        {
          id: '123456678901234567890',
          formDefinitionSlug: 'priznanie-k-dani-z-nehnutelnosti',
          createdAt: new Date(),
          updatedAt: new Date(),
          externalId: null,
          userExternalId: null,
          cognitoGuestIdentityId: null,
          email: null,
          finishSubmission: new Date(),
          mainUri: null,
          actorUri: null,
          ownerType: 'FO',
          ico: '12345678',
          state: 'QUEUED',
          error: 'NONE',
          jsonVersion: '1.0',
          formDataJson: {},
          formDataGinis: null,
          formSignature: {
            pospID: 'esmao.eforms.bratislava.obec_024',
            pospVersion: '1.0',
            jsonVersion: '1.0',
            signatureBase64: String.raw`L:UHIOQWALIUil<tag>uh<\tag>liaUWHDL====`,
            formDataHash: '',
          },
          formSummary: null,
          ginisDocumentId: null,
          senderId: null,
          recipientId: null,
          archived: false,
          ginisState: 'CREATED',
          formSentAt: new Date(),
        },
        'test-uri',
      )

      const parser = new Parser()
      const builder = new Builder({
        xmldec: { version: '1.0', encoding: 'UTF-8' },
        renderOpts: {
          pretty: false,
        },
      })

      let xmlExample = builder.buildObject(
        await parser.parseStringPromise(
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `    <SKTalkMessage xmlns="http://gov.sk/SKTalkMessage" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n` +
            `      <EnvelopeVersion>3.0</EnvelopeVersion>\n` +
            `      <Header>\n` +
            `        <MessageInfo>\n` +
            `          <Class>EGOV_APPLICATION</Class>\n` +
            `          <PospID>esmao.eforms.bratislava.obec_024</PospID>\n` +
            `          <PospVersion>201501.2</PospVersion>\n` +
            `          <MessageID>123456678901234567890</MessageID>\n` +
            `          <CorrelationID>12345678-1234-1234-1234-123456789012</CorrelationID>\n` +
            `        </MessageInfo>\n` +
            `      </Header>\n` +
            `      <Body>\n` +
            `        <MessageContainer xmlns="http://schemas.gov.sk/core/MessageContainer/1.0">\n` +
            `          <MessageId>123456678901234567890</MessageId>\n` +
            `          <SenderId>test-uri</SenderId>\n` +
            `          <RecipientId>example_recipient</RecipientId>\n` +
            `          <MessageType>esmao.eforms.bratislava.obec_024</MessageType>\n` +
            `          <MessageSubject>Podávanie daňového priznania k dani z nehnuteľností</MessageSubject>\n` +
            `          <Object Id="id-file0001" IsSigned="false" Name="file0001.pdf" Description="ATTACHMENT" Class="ATTACHMENT" MimeType="application/pdf" Encoding="Base64">dGVzdCBzdHJpbmcgZm9yIGlucHV0OiBwb3NwMDAwMS8xMjM0NTY2Nzg5MDEyMzQ1Njc4OTAvbWluaW9maWxlMDAwMQ==</Object>\n` +
            `          <Object Id="id-file0002" IsSigned="false" Name="file0002.pdf" Description="ATTACHMENT" Class="ATTACHMENT" MimeType="application/pdf" Encoding="Base64">dGVzdCBzdHJpbmcgZm9yIGlucHV0OiBwb3NwMDAwMi8xMjM0NTY2Nzg5MDEyMzQ1Njc4OTAvbWluaW9maWxlMDAwMg==</Object>\n` +
            `          <Object Id="12345678-1234-1234-1234-123456789012" IsSigned="false" Name="printed-form.pdf" Description="ATTACHMENT" Class="ATTACHMENT" MimeType="application/pdf" Encoding="Base64">AWUKDHLAIUWDHU=====</Object>\n` +
            `          <Object Id="98765432-9876-9876-9876-987654321098" IsSigned="false" Name="summary-form.pdf" Description="ATTACHMENT" Class="ATTACHMENT" MimeType="application/pdf" Encoding="Base64">U3VtbWFyeSBQREYgY29udGVudCB3aXRoIGZvcm0gZGV0YWlscw==</Object>\n` +
            `          <Object Id="123456678901234567890" IsSigned="true" Name="Priznanie k dani z nehnuteľností" Description="" Class="FORM" MimeType="application/vnd.etsi.asic-e+zip" Encoding="Base64">L:UHIOQWALIUil&lt;tag&gt;uh&lt;\\tag&gt;liaUWHDL====</Object>\n` +
            `        </MessageContainer>\n` +
            `      </Body>\n` +
            `    </SKTalkMessage>`,
        ),
      )

      expect(returnXmlString).toBe(xmlExample)

      returnXmlString = await service['createEnvelopeSendMessage'](
        {
          id: '123456678901234567890',
          formDefinitionSlug: 'stanovisko-k-investicnemu-zameru',
          createdAt: new Date(),
          updatedAt: new Date(),
          externalId: null,
          userExternalId: null,
          cognitoGuestIdentityId: null,
          email: null,
          finishSubmission: new Date(),
          mainUri: null,
          actorUri: null,
          ownerType: 'FO',
          ico: '12345678',
          state: 'QUEUED',
          error: 'NONE',
          jsonVersion: '1.0',
          formDataJson: {
            stavba: {
              ulica: 'Ulica1',
              nazov: 'StavbaA',
              parcelneCisla: '1234/56',
              katastralneUzemia: ['805556', '805343'], // Ružinov, Trnávka
            },
          },
          formDataGinis: null,
          formSignature: null,
          formSummary: null,
          ginisDocumentId: null,
          senderId: null,
          recipientId: null,
          archived: false,
          ginisState: 'CREATED',
          formSentAt: new Date(),
        },
        'test-uri',
      )

      xmlExample = builder.buildObject(
        await parser.parseStringPromise(
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `    <SKTalkMessage xmlns="http://gov.sk/SKTalkMessage" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n` +
            `      <EnvelopeVersion>3.0</EnvelopeVersion>\n` +
            `      <Header>\n` +
            `        <MessageInfo>\n` +
            `          <Class>EGOV_APPLICATION</Class>\n` +
            `          <PospID>00603481.stanoviskoKInvesticnemuZameru</PospID>\n` +
            `          <PospVersion>1.3</PospVersion>\n` +
            `          <MessageID>123456678901234567890</MessageID>\n` +
            `          <CorrelationID>12345678-1234-1234-1234-123456789012</CorrelationID>\n` +
            `        </MessageInfo>\n` +
            `      </Header>\n` +
            `      <Body>\n` +
            `        <MessageContainer xmlns="http://schemas.gov.sk/core/MessageContainer/1.0">\n` +
            `          <MessageId>123456678901234567890</MessageId>\n` +
            `          <SenderId>test-uri</SenderId>\n` +
            `          <RecipientId>example_recipient</RecipientId>\n` +
            `          <MessageType>00603481.stanoviskoKInvesticnemuZameru</MessageType>\n` +
            `          <MessageSubject>e-SIZ ž. Ulica1 StavbaA, p.č. 1234/56, kú RZ, TR</MessageSubject>\n` +
            `          <Object Id="123456678901234567890" IsSigned="false" Name="Žiadosť o stanovisko k investičnému zámeru" Description="" Class="FORM" MimeType="application/x-eform-xml" Encoding="XML">\n` +
            `            <eform>\n` +
            `              <tag1 attribute="value1"/>\n` +
            `              <tag2 attribute="value2">Content</tag2>\n` +
            `              <tag3>Another content\n` +
            `</tag3>\n` +
            `            </eform>\n` +
            `          </Object>\n` +
            `        </MessageContainer>\n` +
            `      </Body>\n` +
            `    </SKTalkMessage>`,
        ),
      )

      expect(returnXmlString).toBe(xmlExample)
    })
  })

  describe('send', () => {
    const jwt = 'jwt'
    const senderUri = 'sender-uri'
    const envelope = '<SKTalkMessage />'

    let outboxPostMock: MockedFunction<
      ClientsService['slovenskoSkApi']['apiSktalkReceiveAndSaveToOutboxPost']
    >

    beforeEach(() => {
      service['createEnvelopeSendMessage'] = vi.fn().mockResolvedValue(envelope)
      outboxPostMock = vi.mocked(
        clientsService.slovenskoSkApi.apiSktalkReceiveAndSaveToOutboxPost,
      )
    })

    it('should return the response data when slovensko.sk accepts the message', async () => {
      const responseData = {
        receive_result: 0,
        receive_timeout: false,
        save_to_outbox_result: 0,
        save_to_outbox_timeout: false,
      }
      outboxPostMock.mockResolvedValue(
        createMock<AxiosResponse>({ data: responseData }),
      )
      const form = createTestForm()

      const result = await service.send(jwt, form, senderUri)

      expect(result).toEqual(responseData)
      expect(outboxPostMock).toHaveBeenCalledWith(
        { message: envelope },
        { headers: { Authorization: `Bearer ${jwt}` } },
      )
    })

    it('should throw and not call slovensko.sk when envelope creation fails', async () => {
      const envelopeError = new Error('Envelope failure.')
      service['createEnvelopeSendMessage'] = vi
        .fn()
        .mockRejectedValue(envelopeError)
      const form = createTestForm()

      await expect(
        service.send(jwt, form, senderUri),
      ).rejects.toThrowEqualLogNestError({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorEnum: NasesErrorsEnum.CREATE_ENVELOPE_ERROR,
        message: NasesErrorsResponseEnum.CREATE_ENVELOPE_ERROR,
        console: { formId: form.id },
        error: envelopeError,
      })
      expect(outboxPostMock).not.toHaveBeenCalled()
    })

    it('should throw a bad gateway error when slovensko.sk responds with an error status', async () => {
      const axiosError = new AxiosError('Request failed')
      axiosError.response = createMock<AxiosResponse>({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: { message: 'Upstream failure.' },
      })
      outboxPostMock.mockRejectedValue(axiosError)
      const form = createTestForm()

      await expect(
        service.send(jwt, form, senderUri),
      ).rejects.toThrowEqualLogNestError({
        status: HttpStatus.BAD_GATEWAY,
        errorEnum: ErrorEnum.BAD_GATEWAY_ERROR,
        message: NasesErrorsResponseEnum.SEND_TO_NASES_ERROR,
        console: { formId: form.id },
        error: axiosError,
      })
    })

    it('should throw an internal server error when the request fails with a non-axios error', async () => {
      const requestError = new Error('Unexpected failure.')
      outboxPostMock.mockRejectedValue(requestError)
      const form = createTestForm()

      await expect(
        service.send(jwt, form, senderUri),
      ).rejects.toThrowEqualLogNestError({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorEnum: NasesErrorsEnum.SEND_TO_NASES_ERROR,
        message: NasesErrorsResponseEnum.SEND_TO_NASES_ERROR,
        console: { formId: form.id },
        error: requestError,
      })
    })

    it('should throw a bad gateway error when slovensko.sk responds with an empty body', async () => {
      outboxPostMock.mockResolvedValue(
        createMock<AxiosResponse>({ data: undefined }),
      )
      const form = createTestForm()

      await expect(
        service.send(jwt, form, senderUri),
      ).rejects.toThrowEqualLogNestError({
        status: HttpStatus.BAD_GATEWAY,
        errorEnum: NasesErrorsEnum.SEND_TO_NASES_ERROR,
        message: `${NasesErrorsResponseEnum.SEND_TO_NASES_ERROR} Empty response body.`,
        console: { formId: form.id },
      })
    })

    it('should throw with the mapped NASES error when slovensko.sk does not accept the message', async () => {
      const responseData = {
        receive_result: 3_100_001,
        receive_timeout: false,
        save_to_outbox_result: null,
        save_to_outbox_timeout: null,
      }
      outboxPostMock.mockResolvedValue(
        createMock<AxiosResponse>({ data: responseData }),
      )
      const form = createTestForm()

      await expect(
        service.send(jwt, form, senderUri),
      ).rejects.toThrowEqualLogNestError({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errorEnum: NasesErrorsEnum.SEND_TO_NASES_ERROR,
        message: `${NasesErrorsResponseEnum.SEND_TO_NASES_ERROR} Code: 3100001, Text: Chyba vstupných údajov - Vstupný parameter message je nevyplnený`,
        console: { formId: form.id, responseData },
      })
    })
  })
})
