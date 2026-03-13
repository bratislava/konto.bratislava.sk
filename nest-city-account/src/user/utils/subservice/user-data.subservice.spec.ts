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
  let subservice: UserDataSubservice
  let prisma: typeof prismaMock

  const userId = 'user-123'
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

    subservice = module.get<UserDataSubservice>(UserDataSubservice)
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
      'should return %s when subtype is %s (as in subUnsubUser with gdprData category TAXES, type FORMAL_COMMUNICATION)',
      async (expectedChannel, subtype) => {
        prisma.user.findUnique.mockResolvedValue(mockUser as unknown as User)
        prisma.userGdprData.findFirst.mockResolvedValue({
          userId,
          ...gdprParams,
          subType: subtype,
          createdAt: new Date(),
        } as unknown as UserGdprData)

        const result = await subservice.getOfficialCorrespondenceChannel(userId)

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

      const result = await subservice.getOfficialCorrespondenceChannel(userId)

      expect(result).toBe(UserOfficialCorrespondenceChannelEnum.EDESK)
    })
  })
})
