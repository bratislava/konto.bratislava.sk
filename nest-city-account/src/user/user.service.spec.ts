import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { ConsentEnum, DeliveryMethodEnum, DeliveryMethodUserPreferenceEnum } from '@prisma/client'

import prismaMock from '../../test/singleton'
import { BloomreachOutboxService } from '../bloomreach/bloomreach-outbox.service'
import { NorisDeliveryMethodService } from '../noris/noris-delivery-method.service'
import { PrismaService } from '../prisma/prisma.service'
import { getTaxDeadlineDate } from '../utils/constants/tax-deadline'
import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { UserService } from './user.service'
import { UserTierService } from './user-tier.service'
import { UserDataSubservice } from './utils/subservice/user-data.subservice'

jest.mock('../utils/constants/tax-deadline')

const buildCognitoUserData = (
  accountType: CognitoUserAccountTypesEnum,
  overrides: Partial<CognitoGetUserData> = {}
): CognitoGetUserData =>
  ({
    sub: 'sub-id',
    idUser: 'sub-id',
    email: 'test@example.com',
    Enabled: true,
    [CognitoUserAttributesEnum.ACCOUNT_TYPE]: accountType,
    ...overrides,
  }) as CognitoGetUserData

describe('UserService', () => {
  let service: UserService
  let userDataSubservice: jest.Mocked<UserDataSubservice>
  let throwerErrorGuard: jest.Mocked<ThrowerErrorGuard>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserTierService,
        {
          provide: UserDataSubservice,
          useValue: createMock<UserDataSubservice>(),
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: ThrowerErrorGuard,
          useValue: createMock<ThrowerErrorGuard>(),
        },
        {
          provide: BloomreachOutboxService,
          useValue: createMock<BloomreachOutboxService>(),
        },
        {
          provide: CognitoSubservice,
          useValue: createMock<CognitoSubservice>(),
        },
        {
          provide: NorisDeliveryMethodService,
          useValue: createMock<NorisDeliveryMethodService>(),
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    userDataSubservice = module.get(UserDataSubservice)
    throwerErrorGuard = module.get(ThrowerErrorGuard)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('hasChangedDeliveryMethodAfterDeadline', () => {
    const mockGetTaxDeadlineDate = getTaxDeadlineDate as jest.MockedFunction<
      typeof getTaxDeadlineDate
    >
    const userId = 'test-user-id'

    beforeEach(() => {
      mockGetTaxDeadlineDate.mockReturnValue(new Date('2026-03-01'))
      jest.useFakeTimers().setSystemTime(new Date('2026-10-01')) // After the tax deadline
    })

    afterEach(() => {
      jest.useRealTimers()
      jest.clearAllMocks()
    })

    it('should return false when now is before the tax deadline', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-01'))
      const result = await service['hasChangedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(false)
      expect(userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates).not.toHaveBeenCalled()
    })

    it('should return true when user has no delivery method set at lock date, but selected CITY_ACCOUNT', async () => {
      userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: { deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT },
        locked: undefined,
      })
      const result = await service['hasChangedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(true)
      expect(userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({
        id: userId,
      })
    })

    it('should return false when user has no delivery method set at lock date, but selected POSTAL', async () => {
      userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: { deliveryMethod: DeliveryMethodEnum.POSTAL },
        locked: undefined,
      })
      const result = await service['hasChangedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(false)
      expect(userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({
        id: userId,
      })
    })
    ;[DeliveryMethodEnum.CITY_ACCOUNT, DeliveryMethodEnum.POSTAL].forEach((deliveryMethod) => {
      it(`should return false when user has the same delivery method set at lock date: ${deliveryMethod}`, async () => {
        userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
          active: { deliveryMethod },
          locked: { deliveryMethod },
        })
        const result = await service['hasChangedDeliveryMethodAfterDeadline'](userId)
        expect(result).toBe(false)
        expect(userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({
          id: userId,
        })
      })

      it(`should return false when user has EDESK as active delivery method and ${deliveryMethod} at lock date`, async () => {
        userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
          active: { deliveryMethod: DeliveryMethodEnum.EDESK },
          locked: { deliveryMethod },
        })
        const result = await service['hasChangedDeliveryMethodAfterDeadline'](userId)
        expect(result).toBe(false)
        expect(userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({
          id: userId,
        })
      })
    })

    it('should return false when user has no active delivery method and no locked delivery method', async () => {
      userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: undefined,
        locked: undefined,
      })
      const result = await service['hasChangedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(false)
      expect(userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({
        id: userId,
      })
    })

    it('should return false when user has EDESK as active delivery method', async () => {
      userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: { deliveryMethod: DeliveryMethodEnum.EDESK },
        locked: undefined,
      })
      const result = await service['hasChangedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(false)
      expect(userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({
        id: userId,
      })
    })

    it('should return true when user has CITY_ACCOUNT set at lock date and different delivery method', async () => {
      userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: { deliveryMethod: DeliveryMethodEnum.POSTAL },
        locked: { deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT },
      })
      const result = await service['hasChangedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(true)
      expect(userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({
        id: userId,
      })
    })

    it('should return true when user has POSTAL set at lock date and different delivery method', async () => {
      userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: { deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT },
        locked: { deliveryMethod: DeliveryMethodEnum.POSTAL },
      })
      const result = await service['hasChangedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(true)
      expect(userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({
        id: userId,
      })
    })
  })

  describe('updateGdprConsent', () => {
    it('should persist a user consent for a physical entity', async () => {
      const cognitoUserData = buildCognitoUserData(CognitoUserAccountTypesEnum.PHYSICAL_ENTITY)
      userDataSubservice.getOrFallbackCreateUser.mockResolvedValue({
        id: 'user-id',
        externalId: 'external-id',
      } as never)

      await service.updateGdprConsent(cognitoUserData, ConsentEnum.MARKETING, true)

      expect(userDataSubservice.getOrFallbackCreateUser).toHaveBeenCalledWith(cognitoUserData)
      expect(userDataSubservice.setUserConsents).toHaveBeenCalledWith('user-id', 'external-id', [
        { consentType: ConsentEnum.MARKETING, isGranted: true },
      ])
      expect(userDataSubservice.getOrFallbackCreateLegalPerson).not.toHaveBeenCalled()
      expect(userDataSubservice.setLegalPersonConsents).not.toHaveBeenCalled()
    })

    it('should persist a revoked consent for a physical entity', async () => {
      const cognitoUserData = buildCognitoUserData(CognitoUserAccountTypesEnum.PHYSICAL_ENTITY)
      userDataSubservice.getOrFallbackCreateUser.mockResolvedValue({
        id: 'user-id',
        externalId: 'external-id',
      } as never)

      await service.updateGdprConsent(cognitoUserData, ConsentEnum.GENERAL, false)

      expect(userDataSubservice.setUserConsents).toHaveBeenCalledWith('user-id', 'external-id', [
        { consentType: ConsentEnum.GENERAL, isGranted: false },
      ])
    })

    it.each([
      CognitoUserAccountTypesEnum.LEGAL_ENTITY,
      CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY,
    ])('should persist a legal person consent for account type %s', async (accountType) => {
      const cognitoUserData = buildCognitoUserData(accountType)
      userDataSubservice.getOrFallbackCreateLegalPerson.mockResolvedValue({
        id: 'legal-person-id',
        externalId: 'external-id',
      } as never)

      await service.updateGdprConsent(cognitoUserData, ConsentEnum.MARKETING, true)

      expect(userDataSubservice.getOrFallbackCreateLegalPerson).toHaveBeenCalledWith(
        cognitoUserData
      )
      expect(userDataSubservice.setLegalPersonConsents).toHaveBeenCalledWith(
        'legal-person-id',
        'external-id',
        [{ consentType: ConsentEnum.MARKETING, isGranted: true }]
      )
      expect(userDataSubservice.getOrFallbackCreateUser).not.toHaveBeenCalled()
      expect(userDataSubservice.setUserConsents).not.toHaveBeenCalled()
    })

    it('should throw for an unknown account type', async () => {
      const cognitoUserData = buildCognitoUserData(
        'unknown' as unknown as CognitoUserAccountTypesEnum
      )
      throwerErrorGuard.UnprocessableEntityException.mockReturnValueOnce(
        new Error('invalid account type') as never
      )

      await expect(
        service.updateGdprConsent(cognitoUserData, ConsentEnum.MARKETING, true)
      ).rejects.toThrow('invalid account type')

      expect(throwerErrorGuard.UnprocessableEntityException).toHaveBeenCalled()
      expect(userDataSubservice.setUserConsents).not.toHaveBeenCalled()
      expect(userDataSubservice.setLegalPersonConsents).not.toHaveBeenCalled()
    })
  })

  describe('setDeliveryMethodPreference', () => {
    it('should delegate to the subservice for a physical entity', async () => {
      const cognitoUserData = buildCognitoUserData(CognitoUserAccountTypesEnum.PHYSICAL_ENTITY, {
        sub: 'cognito-sub-id',
      })

      await service.setDeliveryMethodPreference(
        cognitoUserData,
        DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT
      )

      expect(userDataSubservice.setDeliveryMethodPreference).toHaveBeenCalledWith(
        'cognito-sub-id',
        DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT
      )
    })

    it.each([
      CognitoUserAccountTypesEnum.LEGAL_ENTITY,
      CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY,
      'unknown' as unknown as CognitoUserAccountTypesEnum,
    ])('should reject account type %s', async (accountType) => {
      const cognitoUserData = buildCognitoUserData(accountType)
      throwerErrorGuard.UnprocessableEntityException.mockReturnValueOnce(
        new Error('invalid account type') as never
      )

      await expect(
        service.setDeliveryMethodPreference(
          cognitoUserData,
          DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT
        )
      ).rejects.toThrow('invalid account type')

      expect(userDataSubservice.setDeliveryMethodPreference).not.toHaveBeenCalled()
    })
  })
})
