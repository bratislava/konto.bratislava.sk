import { Test, TestingModule } from '@nestjs/testing'
import { createMock } from '@golevelup/ts-jest'
import { UserService } from './user.service'
import { UserDataSubservice } from './utils/subservice/user-data.subservice'
import { PrismaService } from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { BloomreachService } from '../bloomreach/bloomreach.service'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { DeliveryMethodEnum, GDPRCategoryEnum, GDPRSubTypeEnum, GDPRTypeEnum } from '@prisma/client'
import prismaMock from '../../test/singleton'
import { getTaxDeadlineDate } from '../utils/constants/tax-deadline'
import { UserTierService } from './user-tier.service'
import { TaxSubservice } from '../utils/subservices/tax.subservice'
import { GdprDataDto, UserOfficialCorrespondenceChannelEnum } from './dtos/gdpr.user.dto'
import { CognitoGetUserData, CognitoUserAttributesEnum } from '../utils/global-dtos/cognito.dto'
import { User } from '@prisma/client'

jest.mock('../utils/constants/tax-deadline')

describe('UserService', () => {
  let service: UserService
  let userDataSubservice: jest.Mocked<UserDataSubservice>

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
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        {
          provide: CognitoSubservice,
          useValue: createMock<CognitoSubservice>(),
        },
        {
          provide: TaxSubservice,
          useValue: createMock<TaxSubservice>(),
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    userDataSubservice = module.get(UserDataSubservice)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('subUnsubUser', () => {
    const mockCognitoUserData = {
      [CognitoUserAttributesEnum.ACCOUNT_TYPE]: 'PHYSICAL_ENTITY',
      idUser: 'cognito-ext-123',
      email: 'test@bratislava.sk',
      UserCreateDate: new Date('2024-01-01'),
    } as unknown as CognitoGetUserData

    const gdprDataTaxFormalCommunication: GdprDataDto[] = [
      {
        category: GDPRCategoryEnum.TAXES,
        type: GDPRTypeEnum.FORMAL_COMMUNICATION,
      },
    ]

    it.each([
      [UserOfficialCorrespondenceChannelEnum.EMAIL, GDPRSubTypeEnum.subscribe],
      [UserOfficialCorrespondenceChannelEnum.POSTAL, GDPRSubTypeEnum.unsubscribe],
    ] as const)(
      'should return officialCorrespondenceChannel %s when called with GDPRSubTypeEnum.%s',
      async (expectedChannel, gdprSubType) => {
        const mockUser = {
          id: 'user-1',
          externalId: 'cognito-ext-123',
          email: 'test@bratislava.sk',
          birthNumber: '9909090000',
          isDeceased: false,
          taxDeliveryMethodAtLockDate: null,
          taxDeliveryMethodCityAccountLockDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        userDataSubservice.getOrCreateUser.mockResolvedValue(mockUser as User)
        userDataSubservice.getOfficialCorrespondenceChannel.mockResolvedValue(expectedChannel)
        userDataSubservice.getShowEmailCommunicationBanner.mockResolvedValue(false)
        userDataSubservice.getUserGdprData.mockResolvedValue([])

        const result = await service.subUnsubUser(
          mockCognitoUserData,
          gdprSubType,
          gdprDataTaxFormalCommunication
        )

        expect(userDataSubservice.getOfficialCorrespondenceChannel).toHaveBeenCalledWith(
          mockUser.id
        )
        expect(result.officialCorrespondenceChannel).toBe(expectedChannel)
        expect(userDataSubservice.changeUserGdprData).toHaveBeenCalledWith(
          mockUser.id,
          expect.arrayContaining([
            expect.objectContaining({
              category: GDPRCategoryEnum.TAXES,
              type: GDPRTypeEnum.FORMAL_COMMUNICATION,
              subType: gdprSubType,
            }),
          ])
        )
      }
    )
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
})
