import { Readable } from 'node:stream'

import { createMock } from '@golevelup/ts-jest'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { FileStatus } from '@prisma/client'
import {
  UpvsCorporateBody,
  UpvsNaturalPerson,
} from 'openapi-clients/slovensko-sk'
import { v1, v4 } from 'uuid'
import { Builder, Parser } from 'xml2js'

import prismaMock from '../../../../test/singleton'
import ClientsService from '../../../clients/clients.service'
import ConvertService from '../../../convert/convert.service'
import PrismaService from '../../../prisma/prisma.service'
import TaxService from '../../../tax/tax.service'
import ThrowerErrorGuard from '../../../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../../../utils/subservices/minio-client.subservice'
import { NasesErrorsResponseEnum } from '../../nases.errors.enum'
import { SendMessageNasesSenderType } from '../../types/send-message-nases-sender.type'
import NasesUtilsService, {
  isUpvsCorporateBody,
  isUpvsNaturalPerson,
} from '../tokens.nases.service'

jest.mock('axios')
jest.mock('../../../utils/subservices/minio-client.subservice')
jest.mock('../../../convert/convert.service')
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
      imports: [
        ConfigModule.forFeature(async () => ({
          NASES_SENDER_URI: 'example_sender',
          NASES_RECIPIENT_URI: 'example_recipient',
          MINIO_SAFE_BUCKET: '',
        })),
      ],
      providers: [
        NasesUtilsService,
        ConvertService,
        ThrowerErrorGuard,
        { provide: PrismaService, useValue: prismaMock },
        MinioClientSubservice,
        { provide: TaxService, useValue: createMock<TaxService>() },
        { provide: ClientsService, useValue: createMock<ClientsService>() },
      ],
    }).compile()

    service = app.get<NasesUtilsService>(NasesUtilsService)

    // Suppress console output from logger
    Object.defineProperty(service, 'logger', {
      value: { error: jest.fn(), debug: jest.fn(), log: jest.fn() },
    })
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
          formSentAt: new Date(),
        },
        { type: SendMessageNasesSenderType.Self },
      )

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
      /* eslint-enable no-secrets/no-secrets */

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
        { type: SendMessageNasesSenderType.Self },
      )

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
            `          <PospVersion>1.3</PospVersion>\n` +
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
      /* eslint-enable no-secrets/no-secrets */

      expect(returnXmlString).toBe(xmlExample)
    })
  })

  describe('isUpvsNaturalPerson', () => {
    it('should return true when type is natural_person AND natural_person property exists', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        natural_person: {
          given_names: ['John'],
        },
      }

      expect(isUpvsNaturalPerson(contact)).toBe(true)
    })

    it('should return false when only type is natural_person but no natural_person property', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        uri: 'uri://test',
      }

      expect(isUpvsNaturalPerson(contact)).toBe(false)
    })

    it('should return false when only natural_person property exists but type is wrong', () => {
      const contact = {
        type: 'legal_entity',
        natural_person: {
          given_names: ['John'],
        },
      } as unknown as UpvsNaturalPerson

      expect(isUpvsNaturalPerson(contact)).toBe(false)
    })

    it('should return false for corporate body', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        corporate_body: {
          name: 'Test Company',
        },
      }

      expect(isUpvsNaturalPerson(contact)).toBe(false)
    })
  })

  describe('isUpvsCorporateBody', () => {
    it('should return true when type is legal_entity AND corporate_body property exists', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        corporate_body: {
          name: 'Test Company',
        },
      }

      expect(isUpvsCorporateBody(contact)).toBe(true)
    })

    it('should return false when only type is legal_entity but no corporate_body property', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
      }

      expect(isUpvsCorporateBody(contact)).toBe(false)
    })

    it('should return false when only corporate_body property exists but type is wrong', () => {
      const contact = {
        type: 'natural_person',
        corporate_body: {
          name: 'Test Company',
        },
      } as unknown as UpvsCorporateBody

      expect(isUpvsCorporateBody(contact)).toBe(false)
    })

    it('should return false for natural person', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        natural_person: {
          given_names: ['John'],
        },
      }

      expect(isUpvsCorporateBody(contact)).toBe(false)
    })
  })

  describe('extractNaturalPersonData', () => {
    it('should extract first names and last names from natural person', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        natural_person: {
          given_names: ['John', 'Michael'],
          family_names: [
            { value: 'Doe', primary: true },
            { value: 'Smith', primary: false },
          ],
        },
      }

      const result = service.extractNaturalPersonData(contact)

      expect(result.firstNames).toEqual(['John', 'Michael'])
      expect(result.lastNames).toEqual(['Doe', 'Smith'])
    })

    it('should sort family names by primary first', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        natural_person: {
          given_names: ['John'],
          family_names: [
            { value: 'Smith', primary: false },
            { value: 'Doe', primary: true },
            { value: 'Johnson', primary: false },
          ],
        },
      }

      const result = service.extractNaturalPersonData(contact)

      expect(result.lastNames).toEqual(['Doe', 'Smith', 'Johnson'])
    })

    it('should return empty arrays when natural_person is null', () => {
      const contact = {
        type: 'natural_person',
        natural_person: null,
      } as unknown as UpvsNaturalPerson

      const result = service.extractNaturalPersonData(contact)

      expect(result.firstNames).toEqual([])
      expect(result.lastNames).toEqual([])
    })

    it('should return empty arrays when natural_person is undefined', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
      }

      const result = service.extractNaturalPersonData(contact)

      expect(result.firstNames).toEqual([])
      expect(result.lastNames).toEqual([])
    })

    it('should filter out undefined family name values', () => {
      const contact: UpvsNaturalPerson = {
        type: 'natural_person',
        natural_person: {
          given_names: ['John'],
          family_names: [
            { value: 'Doe', primary: true },
            { value: undefined, primary: false },
            { value: 'Smith', primary: false },
          ],
        },
      }

      const result = service.extractNaturalPersonData(contact)

      expect(result.lastNames).toEqual(['Doe', 'Smith'])
    })
  })

  describe('extractCorporateBodyData', () => {
    it('should extract name and ico from corporate_body', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
          cin: '12345678',
        },
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBe('Test Company')
      expect(result.ico).toBe('12345678')
    })

    it('should extract ico from various_ids if not in corporate_body', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
        },
        various_ids: [
          {
            type: {
              id: '7',
              name: 'IČO (Identifikačné číslo organizácie)',
              description: undefined,
            },
            value: '87654321',
            specified: true,
          },
        ],
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBe('Test Company')
      expect(result.ico).toBe('87654321')
    })

    it('should extract ico from various_ids with short IČO name', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
        },
        various_ids: [
          {
            type: { name: 'IČO' },
            value: '11112222',
          },
        ],
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.ico).toBe('11112222')
    })

    it('should extract ico from various_ids with alternative name', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
        },
        various_ids: [
          {
            type: {
              name: 'Identifikačné číslo organizácie',
            },
            value: '11223344',
          },
        ],
      }

      const result = service.extractCorporateBodyData(contact)

      expect(result.ico).toBe('11223344')
    })

    it('should return empty object when corporate_body is null', () => {
      const contact = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: null,
      } as unknown as UpvsCorporateBody

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBeUndefined()
      expect(result.ico).toBeUndefined()
    })

    it('should return empty object when corporate_body is undefined', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
      } as UpvsCorporateBody

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBeUndefined()
      expect(result.ico).toBeUndefined()
    })

    it('should prefer ico from corporate_body over various_ids', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
          cin: '12345678',
        },
        various_ids: [
          {
            type: { name: 'IČO' },
            value: '87654321',
          },
        ],
      } as UpvsCorporateBody

      const result = service.extractCorporateBodyData(contact)

      expect(result.ico).toBe('12345678')
    })

    it('should log error when ico not found in corporate_body but found in various_ids', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
        },
        various_ids: [
          {
            type: { name: 'IČO' },
            value: '87654321',
          },
        ],
      } as UpvsCorporateBody

      const loggerSpy = jest.spyOn(service['logger'], 'error')

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBe('Test Company')
      expect(result.ico).toBe('87654321')
      expect(loggerSpy).toHaveBeenCalled()
    })

    it('should log error when ico not found in corporate_body or various_ids', () => {
      const contact: UpvsCorporateBody = {
        type: 'legal_entity',
        uri: 'uri://test',
        corporate_body: {
          name: 'Test Company',
        },
        various_ids: [
          {
            type: { name: 'Other ID' },
            value: 'some-value',
          },
        ],
      } as UpvsCorporateBody

      const loggerSpy = jest.spyOn(service['logger'], 'error')

      const result = service.extractCorporateBodyData(contact)

      expect(result.name).toBe('Test Company')
      expect(result.ico).toBeUndefined()
      expect(loggerSpy).toHaveBeenCalled()
    })
  })
})
