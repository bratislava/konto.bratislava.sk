import { Test, TestingModule } from '@nestjs/testing'
import { createMock } from '@golevelup/ts-jest'
import { UserDataSubservice } from './user-data.subservice'
import { PrismaService } from '../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { GDPRCategoryEnum, GDPRSubTypeEnum, GDPRTypeEnum, User, UserGdprData } from '@prisma/client'
import { UserOfficialCorrespondenceChannelEnum } from '../../dtos/gdpr.user.dto'
import prismaMock from '../../../../test/singleton'

describe('UserDataSubservice', () => {
  let userDataSubservice: UserDataSubservice
  let bloomreachSubservice: BloomreachService
  let prisma: typeof prismaMock

  const userId = 'user-123'
  const userExternalId = 'ext-123'
  const gdprParams = {
    category: GDPRCategoryEnum.TAXES,
    type: GDPRTypeEnum.FORMAL_COMMUNICATION,
  }

  const mockUser = {
    id: userId,
    physicalEntity: { activeEdesk: false },
    taxDeliveryMethodAtLockDate: null,
    taxDeliveryMethodCityAccountLockDate: null,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDataSubservice,
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
      ],
    }).compile()

    userDataSubservice = module.get<UserDataSubservice>(UserDataSubservice)
    bloomreachSubservice = module.get<BloomreachService>(BloomreachService)
    prisma = module.get(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getOfficialCorrespondenceChannel', () => {
    it.each([
      [UserOfficialCorrespondenceChannelEnum.EMAIL, GDPRSubTypeEnum.subscribe],
      [UserOfficialCorrespondenceChannelEnum.POSTAL, GDPRSubTypeEnum.unsubscribe],
    ] as const)(
      'should return %s when subtype is %s (with gdprData category TAXES, type FORMAL_COMMUNICATION)',
      async (expectedChannel, subtype) => {
        prisma.user.findUnique.mockResolvedValue(mockUser as unknown as User)
        prisma.userGdprData.findFirst.mockResolvedValue({
          userId,
          ...gdprParams,
          subType: subtype,
          createdAt: new Date(),
        } as unknown as UserGdprData)

        const result = await userDataSubservice.getOfficialCorrespondenceChannel(userId)

        expect(result).toBe(expectedChannel)
      }
    )
    it('should return EDESK when user has activeEdesk = true', async () => {
      const userWithEdesk = {
        id: userId,
        physicalEntity: { activeEdesk: true },
        taxDeliveryMethodAtLockDate: null,
        taxDeliveryMethodCityAccountLockDate: null,
      }
      prisma.user.findUnique.mockResolvedValue(userWithEdesk as unknown as User)

      const result = await userDataSubservice.getOfficialCorrespondenceChannel(userId)

      expect(result).toBe(UserOfficialCorrespondenceChannelEnum.EDESK)
    })
  })

  describe('changeUserGdprData', () => {
    it('should call enqueueTrackCustomerToBloomreachOutbox when gdprData contains tax delivery data (category TAXES, type FORMAL_COMMUNICATION)', async () => {
      const gdprData = [
        {
          ...gdprParams,
          subType: GDPRSubTypeEnum.subscribe,
        },
      ]
      prisma.user.findUnique.mockResolvedValue({
        id: userId,
        externalId: userExternalId,
      } as unknown as User)
      prisma.userGdprData.createMany.mockResolvedValue({ count: 1 })

      const processDeliverySpy = jest.spyOn(
        bloomreachSubservice,
        'enqueueTrackCustomerToBloomreachOutbox'
      )

      await userDataSubservice.changeUserGdprData(userId, gdprData)

      expect(processDeliverySpy).toHaveBeenCalledWith(userExternalId)
    })
  })
})
