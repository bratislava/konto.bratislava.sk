import { Test, TestingModule } from '@nestjs/testing'
import { createMock } from '@golevelup/ts-jest'
import { UserService } from './user.service'
import { DatabaseSubserviceUser } from './utils/subservice/database.subservice'
import { PrismaService } from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { BloomreachService } from '../bloomreach/bloomreach.service'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { DeliveryMethodEnum } from '@prisma/client'
import prismaMock from '../../test/singleton'

describe('UserService', () => {
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DatabaseSubserviceUser,
          useValue: createMock<DatabaseSubserviceUser>(),
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
      ],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('changedDeliveryMethodAfterDeadline', () => {
    it('should return false when user has no delivery method set at lock data', () => {
      const user = {
        taxDeliveryMethodAtLockDate: null,
        taxDeliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
      }
      const result = service['changedDeliveryMethodAfterDeadline'](user)
      expect(result).toBe(false)
    })

    ;[DeliveryMethodEnum.CITY_ACCOUNT, DeliveryMethodEnum.POSTAL].forEach((deliveryMethod) => {
      it(`should return false when user has the same delivery method set at lock data: ${deliveryMethod}`, () => {
        const user = {
          taxDeliveryMethodAtLockDate: deliveryMethod,
          taxDeliveryMethod: deliveryMethod,
        }
        const result = service['changedDeliveryMethodAfterDeadline'](user)
        expect(result).toBe(false)
      })

      it('should return false when user has EDESK set at lock date and different delivery method', () => {
        const user = {
          taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          taxDeliveryMethod: deliveryMethod,
        }
        const result = service['changedDeliveryMethodAfterDeadline'](user)
        expect(result).toBe(false)
      })
    })

    it('should return true when user has CITY_ACCOUNT set at lock date and different delivery method', () => {
      const user = {
        taxDeliveryMethodAtLockDate: DeliveryMethodEnum.CITY_ACCOUNT,
        taxDeliveryMethod: DeliveryMethodEnum.POSTAL,
      }
      const result = service['changedDeliveryMethodAfterDeadline'](user)
      expect(result).toBe(true)
    })

    it('should return true when user has POSTAL set at lock date and different delivery method', () => {
      const user = {
        taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
        taxDeliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
      }
      const result = service['changedDeliveryMethodAfterDeadline'](user)
      expect(result).toBe(true)
    })

    it('should return false when user has EDESK set at lock date and null delivery method', () => {
      const user = {
        taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
        taxDeliveryMethod: null,
      }
      const result = service['changedDeliveryMethodAfterDeadline'](user)
      expect(result).toBe(false)
    })
  })
})
