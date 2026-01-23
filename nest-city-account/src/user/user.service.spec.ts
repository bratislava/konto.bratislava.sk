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
import { getTaxDeadlineDate } from '../utils/constants/tax-deadline'

jest.mock('../utils/constants/tax-deadline')

describe('UserService', () => {
  let service: UserService
  let databaseSubservice: jest.Mocked<DatabaseSubserviceUser>

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
    databaseSubservice = module.get(DatabaseSubserviceUser)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('changedDeliveryMethodAfterDeadline', () => {
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
      const result = await service['changedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(false)
      expect(databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates).not.toHaveBeenCalled()
    })
    
    it('should return true when user has no delivery method set at lock date, but selected different delivery method', async () => {
      databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: { deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT },
        locked: undefined,
      })
      const result = await service['changedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(true)
      expect(databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({ id: userId })
    })

    ;[DeliveryMethodEnum.CITY_ACCOUNT, DeliveryMethodEnum.POSTAL].forEach((deliveryMethod) => {
      it(`should return false when user has the same delivery method set at lock date: ${deliveryMethod}`, async () => {
        databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
          active: { deliveryMethod },
          locked: { deliveryMethod },
        })
        const result = await service['changedDeliveryMethodAfterDeadline'](userId)
        expect(result).toBe(false)
        expect(databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({ id: userId })
      })

      it(`should return false when user has EDESK as active delivery method and ${deliveryMethod} at lock date`, async () => {
        databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
          active: { deliveryMethod: DeliveryMethodEnum.EDESK },
          locked: { deliveryMethod },
        })
        const result = await service['changedDeliveryMethodAfterDeadline'](userId)
        expect(result).toBe(false)
        expect(databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({ id: userId })
      })
    })

    it('should return false when user has no active delivery method and no locked delivery method', async () => {
      databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: undefined,
        locked: undefined,
      })
      const result = await service['changedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(false)
      expect(databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({ id: userId })
    })

    it('should return false when user has EDESK as active delivery method', async () => {
      databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: { deliveryMethod: DeliveryMethodEnum.EDESK },
        locked: undefined,
      })
      const result = await service['changedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(false)
      expect(databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({ id: userId })
    })

    it('should return true when user has CITY_ACCOUNT set at lock date and different delivery method', async () => {
      databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: { deliveryMethod: DeliveryMethodEnum.POSTAL },
        locked: { deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT },
      })
      const result = await service['changedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(true)
      expect(databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({ id: userId })
    })

    it('should return true when user has POSTAL set at lock date and different delivery method', async () => {
      databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: { deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT },
        locked: { deliveryMethod: DeliveryMethodEnum.POSTAL },
      })
      const result = await service['changedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(true)
      expect(databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({ id: userId })
    })

    it('should return true when user has active delivery method but no locked delivery method', async () => {
      databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates.mockResolvedValue({
        active: { deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT },
        locked: undefined,
      })
      const result = await service['changedDeliveryMethodAfterDeadline'](userId)
      expect(result).toBe(true)
      expect(databaseSubservice.getActiveAndLockedDeliveryMethodsWithDates).toHaveBeenCalledWith({ id: userId })
    })
  })
})
