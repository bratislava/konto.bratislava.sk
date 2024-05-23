/* eslint-disable pii/no-phone-number */
/* eslint-disable pii/no-email */
import { getQueueToken } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

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

  describe('formatXmlToOneLine', () => {
    it('should correctly put xml into one line', () => {
      const xml = `
        <root>
          < tag1   attribute="value1"/>
          <   tag2   
            attribute="value2">Content</tag2> 
          <tag3      >Another content    
               </  tag3>     
        </root>`

      const xmlNormal = `
        <root>
          <tag1 attribute="value1"/>
          <tag2 attribute="value2">Content</tag2>
          <tag3>Another content</tag3>
        </root>`
      // eslint-disable-next-line xss/no-mixed-html
      const expected =
        // eslint-disable-next-line no-secrets/no-secrets
        '<root><tag1 attribute="value1"/><tag2 attribute="value2">Content</tag2><tag3>Another content</tag3></root>'

      expect(service['formatXmlToOneLine'](xml)).toBe(expected)
      expect(service['formatXmlToOneLine'](xmlNormal)).toBe(expected)
    })
  })
})
/* eslint-enable pii/no-phone-number */
/* eslint-enable pii/no-email */
