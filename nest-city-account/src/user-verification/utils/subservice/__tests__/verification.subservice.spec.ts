import { createMock } from '@golevelup/ts-jest'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { MagproxyService } from '../../../../magproxy/magproxy.service'
import { PhysicalEntityService } from '../../../../physical-entity/physical-entity.service'
import { RfoIdentityListElement } from '../../../../rfo-by-birthnumber/dtos/rfoSchema'
import ThrowerErrorGuard, {
  ErrorMessengerGuard,
} from '../../../../utils/guards/errors.guard'
import { VerificationErrorsEnum } from '../../../verification.errors.enum'
import { DatabaseSubserviceUser } from '../database.subservice'
import { VerificationSubservice } from '../verification.subservice'

const IDENTITY_CARD = 'Občiansky preukaz'

describe('VerificationSubservice', () => {
  let service: VerificationSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationSubservice,
        ErrorMessengerGuard,
        ThrowerErrorGuard,
        { provide: MagproxyService, useValue: createMock<MagproxyService>() },
        {
          provide: DatabaseSubserviceUser,
          useValue: createMock<DatabaseSubserviceUser>(),
        },
        {
          provide: PhysicalEntityService,
          useValue: createMock<PhysicalEntityService>(),
        },
      ],
    }).compile()

    service = module.get<VerificationSubservice>(VerificationSubservice)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('checkIdentityCard', () => {
    it('should return ok if identity card is in RFO', () => {
      const identityCard = '1234567890'
      const rfoData: RfoIdentityListElement = {
        doklady: [
          {
            druhDokladuKod: 111,
            druhDokladu: IDENTITY_CARD,
            jednoznacnyIdentifikator: 'INVALID',
            udrzitela: true,
          },
          {
            druhDokladuKod: 111,
            druhDokladu: IDENTITY_CARD,
            jednoznacnyIdentifikator: '1234567890',
            udrzitela: true,
          },
        ],
      }
      const result = service['checkIdentityCard'](rfoData, identityCard)
      expect(result).toEqual({
        statusCode: 200,
        status: 'OK',
        message: { message: 'ok' },
      })
    })

    it('should return error if identity card is not in RFO', () => {
      const identityCard = '1234567890'
      const rfoData: RfoIdentityListElement = {
        doklady: [
          {
            druhDokladuKod: 111,
            druhDokladu: IDENTITY_CARD,
            jednoznacnyIdentifikator: 'INVALID',
            udrzitela: true,
          },
          {
            druhDokladuKod: 111,
            druhDokladu: IDENTITY_CARD,
            jednoznacnyIdentifikator: 'INVALID',
            udrzitela: true,
          },
        ],
      }
      const result = service['checkIdentityCard'](rfoData, identityCard)
      expect(result).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          status: 'CustomError',
          errorName:
            VerificationErrorsEnum.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY,
        }),
      )
    })

    it('should return error if RFO returned empty object for identity cards', () => {
      const identityCard = '1234567890'
      const rfoData: RfoIdentityListElement = {
        doklady: {},
      } as RfoIdentityListElement // This can happen, sometimes it returns empty object instead of empty array
      const result = service['checkIdentityCard'](rfoData, identityCard)
      expect(result).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          status: 'CustomError',
          errorName:
            VerificationErrorsEnum.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY,
        }),
      )
    })

    it('should return error if RFO returned empty array for identity cards', () => {
      const identityCard = '1234567890'
      const rfoData: RfoIdentityListElement = { doklady: [] }
      const result = service['checkIdentityCard'](rfoData, identityCard)
      expect(result).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          status: 'CustomError',
          errorName:
            VerificationErrorsEnum.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY,
        }),
      )
    })

    it('should return error if the person died', () => {
      const identityCard = '1234567890'
      const rfoData: RfoIdentityListElement = {
        doklady: [
          {
            druhDokladuKod: 111,
            druhDokladu: IDENTITY_CARD,
            jednoznacnyIdentifikator: '1234567890',
            udrzitela: true,
          },
          {
            druhDokladuKod: 111,
            druhDokladu: IDENTITY_CARD,
            jednoznacnyIdentifikator: 'INVALID',
            udrzitela: true,
          },
        ],
        datumUmrtia: '2021-01-01',
      }
      const result = service['checkIdentityCard'](rfoData, identityCard)
      expect(result).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          status: 'CustomError',
          errorName: VerificationErrorsEnum.DEAD_PERSON,
        }),
      )
    })
  })
})
