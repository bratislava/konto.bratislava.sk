/* eslint-disable pii/no-phone-number */
/* eslint-disable pii/no-email */
import { getQueueToken } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { v4 } from 'uuid'

import prismaMock from '../../../test/singleton'
import { CognitoGetUserData } from '../../auth/dtos/cognito.dto'
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
}))

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
        ConfigService,
        TaxService,
        {
          provide: getQueueToken('tax'),
          useValue: {},
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
      const xml = `
        <root>
          < tag1   attribute="value1"/>
          <   tag2   
            attribute="value2">Content</tag2> 
          <tag3      >Another content    
               </  tag3>     
        </root>`
      ;(v4 as jest.Mock).mockReturnValue('12345678-1234-1234-1234-123456789012')
      // eslint-disable-next-line xss/no-mixed-html
      service['convertService'].convertJsonToXmlV2 = jest
        .fn()
        .mockResolvedValue(xml)

      const returnXmlString = await service['createEnvelopeSendMessage']({
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
        formDataJson: null,
        formDataGinis: null,
        // eslint-disable-next-line xss/no-mixed-html
        formDataBase64: 'L:UHIOQWALIUil<tag>uh<\tag>liaUWHDL====',
        ginisDocumentId: null,
        senderId: null,
        recipientId: null,
        archived: false,
        ginisState: 'CREATED',
      })

      // eslint-disable-next-line xss/no-mixed-html
      expect(returnXmlString).toBe(
        // eslint-disable-next-line no-secrets/no-secrets
        '<?xml version="1.0" encoding="utf-8"?><SKTalkMessage xmlns="http://gov.sk/SKTalkMessage" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><EnvelopeVersion>3.0</EnvelopeVersion><Header><MessageInfo><Class>EGOV_APPLICATION</Class><PospID>00603481.stanoviskoKInvesticnemuZameru</PospID><PospVersion>0.8</PospVersion><MessageID>123456678901234567890</MessageID><CorrelationID>12345678-1234-1234-1234-123456789012</CorrelationID></MessageInfo></Header><Body><MessageContainer xmlns="http://schemas.gov.sk/core/MessageContainer/1.0"><MessageId>123456678901234567890</MessageId><SenderId>banana</SenderId><RecipientId>banana</RecipientId><MessageType>00603481.stanoviskoKInvesticnemuZameru</MessageType><MessageSubject>123456678901234567890</MessageSubject><Object Id="123456678901234567890" IsSigned="false" Name="Žiadosť o stanovisko k investičnému zámeru" Description="" Class="FORM" MimeType="application/x-eform-xml" Encoding="XML"><root><tag1 attribute="value1"/><tag2 attribute="value2">Content</tag2><tag3>Another content</tag3></root></Object></MessageContainer></Body></SKTalkMessage>',
      )
    })
  })
})
/* eslint-enable pii/no-phone-number */
/* eslint-enable pii/no-email */
