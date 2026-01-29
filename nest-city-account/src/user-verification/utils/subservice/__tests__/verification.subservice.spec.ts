import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { MagproxyService } from '../../../../magproxy/magproxy.service'
import { PhysicalEntityService } from '../../../../physical-entity/physical-entity.service'
import { RfoIdentityListElement } from '../../../../rfo-by-birthnumber/dtos/rfoSchema'
import ThrowerErrorGuard from '../../../../utils/guards/errors.guard'
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
        expect.objectContaining({
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
        expect.objectContaining({
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
        expect.objectContaining({
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
        expect.objectContaining({
          success: false,
          reason: VerificationErrorsEnum.DEAD_PERSON,
        })
      )
    })
  })

  describe('validatePersonName', () => {
    it('should return false when firstName or lastName is missing', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Ján' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, undefined, 'Novák')).toBe(false)
      expect(service['validatePersonName'](rfoData, 'Ján', undefined)).toBe(false)
      expect(service['validatePersonName'](rfoData, '', 'Novák')).toBe(false)
      expect(service['validatePersonName'](rfoData, 'Ján', '')).toBe(false)
    })

    it('should match names case-insensitively, ignoring diacritics and surrounding whitespace', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Ján' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, '  jan  ', '  NOVAK  ')).toBe(true)
    })

    it('should support multiple first names and multiple last names (all parts must match)', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Ján' }, { meno: 'Peter' }],
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: 'Horváth' }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, 'Ján Peter', 'Novák Horváth')).toBe(true)
      expect(service['validatePersonName'](rfoData, '  jan   PETER  ', '  NOVAK   horvath  ')).toBe(
        true
      )
    })

    it('should return false if any provided name part is missing in RFO (multi-name input)', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Ján' }], // Peter missing
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: 'Horváth' }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, 'Ján Peter', 'Novák')).toBe(false)
      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák Horváth Svoboda')).toBe(false)
    })

    it('should return false when RFO does not contain first/last names', () => {
      const rfoData = {
        menaOsoby: [],
        priezviskaOsoby: [],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák')).toBe(false)
    })

    it('should return false when the provided names do not match RFO', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Ján' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, 'Peter', 'Novák')).toBe(false)
      expect(service['validatePersonName'](rfoData, 'Ján', 'Horváth')).toBe(false)
    })

    it('should not depend on the order of names in RFO lists (order-insensitive)', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Ján' }, { meno: 'Peter' }],
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: 'Horváth' }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, 'peter jan', 'horvath novak')).toBe(true)
      expect(service['validatePersonName'](rfoData, 'jan peter', 'novak horvath')).toBe(true)
    })

    it('should treat tabs/newlines as whitespace between multiple names', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Ján' }, { meno: 'Peter' }],
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: 'Horváth' }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, 'Ján\tPeter', 'Novák\nHorváth')).toBe(true)
    })

    it('should return false when RFO name arrays are missing/undefined', () => {
      const rfoData = {} as unknown as RfoIdentityListElement
      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák')).toBe(false)
    })

    it('should ignore empty/non-string entries in RFO name arrays', () => {
      const rfoData = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        menaOsoby: [{ meno: '' }, { meno: '   ' }, { meno: 'Ján' }, { meno: undefined as any }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: null as any }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák')).toBe(true)
    })

    it('should allow duplicate tokens in input (same name repeated)', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Ján' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, 'Ján Ján', 'Novák Novák')).toBe(true)
    })

    it('should NOT match when RFO stores a compound name as a single entry (document current behavior)', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Maria Anna' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      } as unknown as RfoIdentityListElement

      // Input splits to ["maria","anna"], but RFO normalizes to ["maria anna"] => currently false.
      expect(service['validatePersonName'](rfoData, 'Maria Anna', 'Novák')).toBe(false)
    })
    it('should return false if the user did not provide all first names that exist in RFO', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Ján' }, { meno: 'Peter' }],
        priezviskaOsoby: [{ meno: 'Novák' }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák')).toBe(false)
    })

    it('should return false if the user did not provide all last names that exist in RFO', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Ján' }],
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: 'Horváth' }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák')).toBe(false)
    })

    it('should return false if any provided name part is missing in RFO (multi-name input)', () => {
      const rfoData = {
        menaOsoby: [{ meno: 'Ján' }], // Peter missing
        priezviskaOsoby: [{ meno: 'Novák' }, { meno: 'Horváth' }],
      } as unknown as RfoIdentityListElement

      expect(service['validatePersonName'](rfoData, 'Ján Peter', 'Novák')).toBe(false)
      expect(service['validatePersonName'](rfoData, 'Ján', 'Novák Horváth Svoboda')).toBe(false)
    })
  })
})
