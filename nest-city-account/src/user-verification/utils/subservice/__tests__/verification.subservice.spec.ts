import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'
import type { Mocked } from 'vitest'

import { cognitoUserDataFactory } from '../../../../__tests__/factories/cognitoUserData.factory'
import { userFactory } from '../../../../__tests__/factories/user.factory'
import { expectObjectContaining } from '../../../../__tests__/matchers'
import { MagproxyService } from '../../../../magproxy/magproxy.service'
import { PhysicalEntityService } from '../../../../physical-entity/physical-entity.service'
import { RfoIdentityListElement } from '../../../../rfo-by-birthnumber/dtos/rfoSchema'
import { CognitoUserAccountTypesEnum } from '../../../../utils/global-dtos/cognito.dto'
import { IdentityCardVerificationRequest } from '../../../dtos/identity-card-verification-queue.dto'
import { VerificationErrorsEnum } from '../../../verification.errors.enum'
import { VerificationSubservice } from '../verification.subservice'
import { VerificationDataSubservice } from '../verification-data.subservice'

const IDENTITY_CARD = 'Občiansky preukaz'

describe('VerificationSubservice', () => {
  let service: VerificationSubservice
  let magproxyService: Mocked<MagproxyService>
  let verificationDataSubservice: Mocked<VerificationDataSubservice>
  let physicalEntityService: Mocked<PhysicalEntityService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineLoggerService,
        VerificationSubservice,
        ErrorFactoryService,
        { provide: MagproxyService, useValue: createMock<MagproxyService>() },
        {
          provide: VerificationDataSubservice,
          useValue: createMock<VerificationDataSubservice>(),
        },
        {
          provide: PhysicalEntityService,
          useValue: createMock<PhysicalEntityService>(),
        },
      ],
    }).compile()

    service = module.get<VerificationSubservice>(VerificationSubservice)
    magproxyService = module.get(MagproxyService)
    verificationDataSubservice = module.get(VerificationDataSubservice)
    physicalEntityService = module.get(PhysicalEntityService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('checkIdentityCard', () => {
    it('should return ok if identity card is in RFO', () => {
      const identityCard = 'AB123456'
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
            jednoznacnyIdentifikator: 'AB123456',
            udrzitela: true,
          },
        ],
      }
      const result = service['checkIdentityCard'](rfoData, identityCard)
      expect(result).toEqual({
        success: true,
      })
    })

    it('should return ok if identity card is in RFO in another format', () => {
      const identityCard = 'AB123456'
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
            jednoznacnyIdentifikator: '123456 AB',
            udrzitela: true,
          },
        ],
      }
      const result = service['checkIdentityCard'](rfoData, identityCard)
      expect(result).toEqual({
        success: true,
      })
    })

    it('should return error if identity card is not in RFO', () => {
      const identityCard = 'AB123456'
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
        expectObjectContaining({
          success: false,
          reason: VerificationErrorsEnum.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY,
        })
      )
    })

    it('should return error if RFO returned empty object for identity cards', () => {
      const identityCard = 'AB123456'
      const rfoData: RfoIdentityListElement = {
        doklady: {},
      } as RfoIdentityListElement // This can happen, sometimes it returns empty object instead of empty array
      const result = service['checkIdentityCard'](rfoData, identityCard)
      expect(result).toEqual(
        expectObjectContaining({
          success: false,
          reason: VerificationErrorsEnum.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY,
        })
      )
    })

    it('should return error if RFO returned empty array for identity cards', () => {
      const identityCard = 'AB123456'
      const rfoData: RfoIdentityListElement = { doklady: [] }
      const result = service['checkIdentityCard'](rfoData, identityCard)
      expect(result).toEqual(
        expectObjectContaining({
          success: false,
          reason: VerificationErrorsEnum.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY,
        })
      )
    })

    it('should return error if the person is dead', () => {
      const identityCard = 'AB123456'
      const rfoData: RfoIdentityListElement = {
        doklady: [
          {
            druhDokladuKod: 111,
            druhDokladu: IDENTITY_CARD,
            jednoznacnyIdentifikator: 'AB123456',
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
        expectObjectContaining({
          success: false,
          reason: VerificationErrorsEnum.DEAD_PERSON,
        })
      )
    })
  })

  describe('validatePersonName', () => {
    it('should return false when firstName or lastName is missing', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Ján' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      }

      expect(service['validatePersonName'](rfoData, undefined, 'Novák')).toBe(false)
      expect(service['validatePersonName'](rfoData, 'Ján', undefined)).toBe(false)
      expect(service['validatePersonName'](rfoData, '', 'Novák')).toBe(false)
      expect(service['validatePersonName'](rfoData, 'Ján', '')).toBe(false)
    })

    it('should ignore surrounding whitespace', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Ján' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      }

      expect(service['validatePersonName'](rfoData, '  Ján  ', '  Novák  ')).toBe(true)
    })

    it.each([
      { scenario: 'letter case differs in the first name', firstName: 'ján', lastName: 'Novák' },
      { scenario: 'letter case differs in the last name', firstName: 'Ján', lastName: 'NOVÁK' },
      { scenario: 'letter case differs in both names', firstName: 'JÁN', lastName: 'nOvÁk' },
    ])('should match when $scenario', ({ firstName, lastName }) => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Ján' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      }

      expect(service['validatePersonName'](rfoData, firstName, lastName)).toBe(true)
    })

    it('should ignore letter case in RFO data', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'JÁN' }, { meno: 'peter' }],
        priezviskaOsoby: [{ meno: 'NOVÁK' }],
      }

      expect(service['validatePersonName'](rfoData, 'Ján Peter', 'Novák')).toBe(true)
    })

    it.each([
      { scenario: 'diacritics differ in the first name', firstName: 'Jan', lastName: 'Novák' },
      { scenario: 'diacritics differ in the last name', firstName: 'Ján', lastName: 'Novak' },
      { scenario: 'the first name does not match', firstName: 'Peter', lastName: 'Novák' },
      { scenario: 'the last name does not match', firstName: 'Ján', lastName: 'Horváth' },
    ])('should not match when $scenario', ({ firstName, lastName }) => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Ján' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      }

      expect(service['validatePersonName'](rfoData, firstName, lastName)).toBe(false)
    })

    it('should support multiple first names and multiple last names (all parts must match)', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Ján' }, { meno: 'Peter' }],
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: 'Horváth' }],
      }

      expect(service['validatePersonName'](rfoData, 'Ján Peter', 'Novák Horváth')).toBe(true)
      expect(service['validatePersonName'](rfoData, '  Ján   Peter  ', '  Novák   Horváth  ')).toBe(
        true
      )
    })

    it('should return false if any provided name part is missing in RFO (multi-name input)', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Ján' }], // Peter missing
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: 'Horváth' }],
      }

      expect(service['validatePersonName'](rfoData, 'Ján Peter', 'Novák')).toBe(false)
      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák Horváth Svoboda')).toBe(false)
    })

    it('should return false when RFO does not contain first/last names', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [],
        priezviskaOsoby: [],
      }

      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák')).toBe(false)
    })

    it('should not depend on the order of names in RFO lists (order-insensitive)', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Ján' }, { meno: 'Peter' }],
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: 'Horváth' }],
      }

      expect(service['validatePersonName'](rfoData, 'Peter Ján', 'Horváth Novák')).toBe(true)
      expect(service['validatePersonName'](rfoData, 'Ján Peter', 'Novák Horváth')).toBe(true)
    })

    it('should treat tabs/newlines as whitespace between multiple names', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Ján' }, { meno: 'Peter' }],
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: 'Horváth' }],
      }

      expect(service['validatePersonName'](rfoData, 'Ján\tPeter', 'Novák\nHorváth')).toBe(true)
    })

    it('should return false when RFO name arrays are missing/undefined', () => {
      const rfoData: RfoIdentityListElement = {}
      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák')).toBe(false)
    })

    it('should ignore empty/non-string entries in RFO name arrays', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: '' }, { meno: '   ' }, { meno: 'Ján' }, { meno: undefined }],

        priezviskaOsoby: [{ meno: 'Novák' }, { meno: null }],
      }

      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák')).toBe(true)
    })

    it('should allow duplicate tokens in input (same name repeated)', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Ján' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      }

      expect(service['validatePersonName'](rfoData, 'Ján Ján', 'Novák Novák')).toBe(true)
    })

    it('should NOT match when RFO stores a compound name as a single entry (document current behavior)', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Maria Anna' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      }

      // Input splits to ["Maria","Anna"], but the RFO entry stays one token "Maria Anna" => currently false.
      expect(service['validatePersonName'](rfoData, 'Maria Anna', 'Novák')).toBe(false)
    })
    it('should return false if the user did not provide all first names that exist in RFO', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Ján' }, { meno: 'Peter' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      }

      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák')).toBe(false)
    })

    it('should return false if the user did not provide all last names that exist in RFO', () => {
      const rfoData: RfoIdentityListElement = {
        menaOsoby: [{ meno: 'Ján' }],
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: 'Horváth' }],
      }

      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák')).toBe(false)
    })
  })

  describe('verifyIdentityCard', () => {
    const IDENTITY_CARD_NUMBER = 'AB123456'
    const BIRTH_NUMBER = '8808080006'
    const dbUser = userFactory()

    const request: IdentityCardVerificationRequest = {
      user: cognitoUserDataFactory({ given_name: 'Ján', family_name: 'Novák' }),
      data: { birthNumber: BIRTH_NUMBER, identityCard: IDENTITY_CARD_NUMBER, turnstileToken: '' },
      type: CognitoUserAccountTypesEnum.PHYSICAL_ENTITY,
    }

    const matchingRfo: RfoIdentityListElement = {
      rodneCislo: '880808/0006',
      ifo: 'ifo-id',
      menaOsoby: [{ meno: 'Ján' }],
      priezviskaOsoby: [{ meno: 'Novák' }],
      doklady: [
        {
          druhDokladuKod: 111,
          druhDokladu: IDENTITY_CARD,
          jednoznacnyIdentifikator: IDENTITY_CARD_NUMBER,
          udrzitela: true,
        },
      ],
    }

    beforeEach(() => {
      verificationDataSubservice.checkAndCreateUserIfoAndBirthNumber.mockResolvedValue({
        success: true,
      })
      verificationDataSubservice.findUserByEmailOrExternalId.mockResolvedValue(dbUser)
    })

    it('should save the user and link the physical entity when matched in the RFO list', async () => {
      magproxyService.rfoBirthNumberList.mockResolvedValue({ success: true, data: [matchingRfo] })

      const result = await service.verifyIdentityCard(request)

      expect(result).toEqual({ success: true })
      expect(magproxyService.rfoBirthNumberDcom).not.toHaveBeenCalled()
      expect(verificationDataSubservice.checkAndCreateUserIfoAndBirthNumber).toHaveBeenCalledWith(
        request.user,
        'ifo-id',
        BIRTH_NUMBER,
        0
      )
      expect(physicalEntityService.linkToUserIdByBirthnumber).toHaveBeenCalledWith(
        dbUser.id,
        BIRTH_NUMBER
      )
    })

    it('should save the user and link the physical entity when matched via DCOM', async () => {
      // The RFO list knows the birth number but not the identity card, so DCOM is used.
      magproxyService.rfoBirthNumberList.mockResolvedValue({
        success: true,
        data: [{ ...matchingRfo, doklady: [] }],
      })
      magproxyService.rfoBirthNumberDcom.mockResolvedValue({ success: true, data: matchingRfo })

      const result = await service.verifyIdentityCard(request)

      expect(result).toEqual({ success: true })
      expect(magproxyService.rfoBirthNumberDcom).toHaveBeenCalled()
      expect(verificationDataSubservice.checkAndCreateUserIfoAndBirthNumber).toHaveBeenCalledWith(
        request.user,
        'ifo-id',
        BIRTH_NUMBER,
        1
      )
      expect(physicalEntityService.linkToUserIdByBirthnumber).toHaveBeenCalledWith(
        dbUser.id,
        BIRTH_NUMBER
      )
    })

    it('should not link the physical entity when saving the user fails', async () => {
      magproxyService.rfoBirthNumberList.mockResolvedValue({ success: true, data: [matchingRfo] })
      verificationDataSubservice.checkAndCreateUserIfoAndBirthNumber.mockResolvedValue({
        success: false,
        reason: VerificationErrorsEnum.BIRTHNUMBER_IFO_DUPLICITY,
      })

      const result = await service.verifyIdentityCard(request)

      expect(result).toEqual({
        success: false,
        reason: VerificationErrorsEnum.BIRTHNUMBER_IFO_DUPLICITY,
      })
      expect(physicalEntityService.linkToUserIdByBirthnumber).not.toHaveBeenCalled()
    })
  })
})
