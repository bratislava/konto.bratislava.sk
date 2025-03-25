/* eslint-disable pii/no-phone-number */
/* eslint-disable pii/no-email */
import { Readable } from 'node:stream'

import { getQueueToken } from '@nestjs/bull'
import { Test, TestingModule } from '@nestjs/testing'
import { FileStatus } from '@prisma/client'
import { v1, v4 } from 'uuid'
import { Builder, Parser } from 'xml2js'

import createBaConfigMock from '../../../test/baConfigMock'
import prismaMock from '../../../test/singleton'
import { CognitoGetUserData } from '../../auth/dtos/cognito.dto'
import BaConfigService from '../../config/ba-config.service'
import ConvertService from '../../convert/convert.service'
import PrismaService from '../../prisma/prisma.service'
import TaxService from '../../tax/tax.service'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../../utils/subservices/minio-client.subservice'
import { NasesErrorsResponseEnum } from '../nases.errors.enum'
import NasesUtilsService from './tokens.nases.service'

jest.mock('axios')
jest.mock('../../utils/subservices/minio-client.subservice')
jest.mock('../../convert/convert.service')
jest.mock('uuid', () => ({
  v4: jest.fn(),
  v1: jest.fn(),
}))

const createMockReadableStream = (content: string): Readable => {
  const readableStream = new Readable()
  // eslint-disable-next-line no-underscore-dangle
  readableStream._read = () => {}
  readableStream.push(content)
  // eslint-disable-next-line unicorn/no-array-push-push
  readableStream.push(null)
  return readableStream
}

describe('NasesUtilsService', () => {
  let service: NasesUtilsService

  beforeEach(async () => {
    jest.resetAllMocks()
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        NasesUtilsService,
        ConvertService,
        ThrowerErrorGuard,
        { provide: PrismaService, useValue: prismaMock },
        MinioClientSubservice,
        TaxService,
        {
          provide: getQueueToken('tax'),
          useValue: {},
        },
        {
          provide: BaConfigService,
          useValue: createBaConfigMock({
            slovenskoSk: {
              url: '',
              apiKey: '',
              apiTokenPrivate: '',
              oboTokenPublic: '',
              subNasesTechnicalAccount: '',
              nasesSenderUri: 'example_sender',
              nasesRecipientUri: 'example_recipient',
            },
            minio: {
              buckets: {
                safe: '',
                unscanned: '',
                infected: '',
              },
            },
          }),
        },
      ],
    }).compile()

    service = app.get<NasesUtilsService>(NasesUtilsService)
  })

  describe('should be defined', () => {
    it('should be defined', () => {
      expect(service).toBeDefined()
    })
  })

  describe('getUri', () => {
    it('should return null for unprovided bearer token', async () => {
      expect(
        await service.getUri(undefined, {} as CognitoGetUserData),
      ).toBeNull()
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
          status: FileStatus.ACCEPTED,
          ginisOrder: null,
          ginisUploaded: true,
          ginisUploadedError: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      ;(v4 as jest.Mock).mockReturnValue('12345678-1234-1234-1234-123456789012')
      ;(v1 as jest.Mock)
        .mockReturnValueOnce('12345678-1234-1234-1234-123456789012')
        .mockReturnValueOnce('98765432-9876-9876-9876-987654321098')

      service['convertService'].convertJsonToXmlObjectForForm = jest
        .fn()
        .mockResolvedValue({
          eform: {
            tag1: [{ $: { attribute: 'value1' } }],
            tag2: [{ $: { attribute: 'value2' }, _: 'Content' }],
            tag3: ['Another content\n'],
          },
        })

      prismaMock.files.findMany.mockResolvedValue(mockFiles)

      service['minioClientSubservice'].loadFileStream = jest
        .fn()
        .mockImplementation(async (_: string, filename: string) =>
          createMockReadableStream(`test string for input: ${filename}`),
        )

      service['taxService'].getFilledInPdfBase64 = jest
        .fn()
        .mockResolvedValue('AWUKDHLAIUWDHU=====')

      service['convertService'].generatePdf = jest
        .fn()
        .mockImplementation(async () =>
          createMockReadableStream('Summary PDF content with form details'),
        )

      let returnXmlString = await service['createEnvelopeSendMessage']({
        id: '123456678901234567890',
        formDefinitionSlug: 'priznanie-k-dani-z-nehnutelnosti',
        createdAt: new Date(),
        updatedAt: new Date(),
        externalId: null,
        userExternalId: null,
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
          // eslint-disable-next-line xss/no-mixed-html
          signatureBase64: String.raw`L:UHIOQWALIUil<tag>uh<\tag>liaUWHDL====`,
          formDataHash: '',
        },
        formSummary: null,
        ginisDocumentId: null,
        senderId: null,
        recipientId: null,
        archived: false,
        ginisState: 'CREATED',
      })

      const parser = new Parser()
      const builder = new Builder({
        // eslint-disable-next-line unicorn/text-encoding-identifier-case
        xmldec: { version: '1.0', encoding: 'UTF-8' },
        renderOpts: {
          pretty: false,
        },
      })

      /* eslint-disable no-secrets/no-secrets */
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
            `          <SenderId>example_sender</SenderId>\n` +
            `          <RecipientId>example_recipient</RecipientId>\n` +
            `          <MessageType>esmao.eforms.bratislava.obec_024</MessageType>\n` +
            `          <MessageSubject>Podávanie daňového priznanie k dani z nehnuteľností</MessageSubject>\n` +
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
      /* eslint-enable no-secrets/no-secrets */

      expect(returnXmlString).toBe(xmlExample)

      returnXmlString = await service['createEnvelopeSendMessage']({
        id: '123456678901234567890',
        formDefinitionSlug: 'stanovisko-k-investicnemu-zameru',
        createdAt: new Date(),
        updatedAt: new Date(),
        externalId: null,
        userExternalId: null,
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
        formSignature: null,
        formSummary: null,
        ginisDocumentId: null,
        senderId: null,
        recipientId: null,
        archived: false,
        ginisState: 'CREATED',
      })

      /* eslint-disable no-secrets/no-secrets */
      xmlExample = builder.buildObject(
        // eslint-disable-next-line xss/no-mixed-html
        await parser.parseStringPromise(
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `    <SKTalkMessage xmlns="http://gov.sk/SKTalkMessage" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n` +
            `      <EnvelopeVersion>3.0</EnvelopeVersion>\n` +
            `      <Header>\n` +
            `        <MessageInfo>\n` +
            `          <Class>EGOV_APPLICATION</Class>\n` +
            `          <PospID>00603481.stanoviskoKInvesticnemuZameru</PospID>\n` +
            `          <PospVersion>0.9</PospVersion>\n` +
            `          <MessageID>123456678901234567890</MessageID>\n` +
            `          <CorrelationID>12345678-1234-1234-1234-123456789012</CorrelationID>\n` +
            `        </MessageInfo>\n` +
            `      </Header>\n` +
            `      <Body>\n` +
            `        <MessageContainer xmlns="http://schemas.gov.sk/core/MessageContainer/1.0">\n` +
            `          <MessageId>123456678901234567890</MessageId>\n` +
            `          <SenderId>example_sender</SenderId>\n` +
            `          <RecipientId>example_recipient</RecipientId>\n` +
            `          <MessageType>00603481.stanoviskoKInvesticnemuZameru</MessageType>\n` +
            `          <MessageSubject>123456678901234567890</MessageSubject>\n` +
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
      /* eslint-enable no-secrets/no-secrets */

      expect(returnXmlString).toBe(xmlExample)
    })
  })
})
/* eslint-enable pii/no-phone-number */
/* eslint-enable pii/no-email */
