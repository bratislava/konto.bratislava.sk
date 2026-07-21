import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../../test/singleton'
import { configFactory } from '../../../__tests__/factories/config.factory'
import { deliveryMethodPreferenceHistoryFactory } from '../../../__tests__/factories/deliveryMethodPreferenceHistory.factory'
import { physicalEntityFactory } from '../../../__tests__/factories/physicalEntity.factory'
import { userWithRelationsFactory } from '../../../__tests__/factories/userWithRelations.factory'
import {
  expectAny,
  expectArrayContaining,
  expectDefined,
  expectObjectContaining,
} from '../../../__tests__/jest-matchers'
import getBaConfigInstance from '../../../config/ba-config.instance'
import {
  DeliveryMethodEnum,
  DeliveryMethodUserPreferenceEnum,
  Prisma,
  User,
} from '../../../generated/prisma/client'
import { MailgunService } from '../../../mailgun/mailgun.service'
import { NorisDeliveryMethodService } from '../../../noris/services/noris-delivery-method.service'
import { DeliveryMethod } from '../../../noris/types/noris.enums'
import { PdfGeneratorService } from '../../../pdf-generator/pdf-generator.service'
import { PrismaService } from '../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { TaxDeliveryMethodsTasksSubservice } from '../tax-delivery-methods-tasks.subservice'

jest.mock('../../../config/ba-config.instance')

const mockEmail = 'test@example.com'

describe('TaxDeliveryMethodsTasksSubservice', () => {
  let service: TaxDeliveryMethodsTasksSubservice
  let throwerErrorGuard: ThrowerErrorGuard

  const mockGetBaConfigInstance = getBaConfigInstance as jest.MockedFunction<
    typeof getBaConfigInstance
  >

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })
    jest.setSystemTime(new Date('2024-02-15T12:00:00.000Z'))
    mockGetBaConfigInstance.mockReturnValue({ taxDeadline: { month: 2, day: 1 } } as ReturnType<
      typeof getBaConfigInstance
    >)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxDeliveryMethodsTasksSubservice,
        { provide: PrismaService, useValue: prismaMock },
        { provide: NorisDeliveryMethodService, useValue: createMock<NorisDeliveryMethodService>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
        { provide: MailgunService, useValue: createMock<MailgunService>() },
        {
          provide: PdfGeneratorService,
          useValue: createMock<PdfGeneratorService>({
            withSharedBrowser: jest.fn(async (fn: () => Promise<unknown>) => fn()),
          }),
        },
      ],
    }).compile()

    service = module.get<TaxDeliveryMethodsTasksSubservice>(TaxDeliveryMethodsTasksSubservice)
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)

    // Make $transaction execute its callback so the advisory-lock path is exercised in tests.
    prismaMock.$transaction.mockImplementation(async (fn) => {
      if (typeof fn === 'function') {
        return fn(prismaMock)
      }
      return Promise.all(fn)
    })
    // $executeRaw is used for pg_advisory_xact_lock — no-op in tests.
    prismaMock.$executeRaw.mockResolvedValue(0)
  })

  describe('updateDeliveryMethods', () => {
    it('should call the endpoint with the correct data, and update only users who are really updated in Noris', async () => {
      const updateDeliveryMethodsSpy = jest
        .spyOn(service['norisDeliveryMethodService'], 'updateDeliveryMethods')
        .mockResolvedValue({
          birthNumbers: ['123456/2020', '123456/4848', '123456/4649', '123456/4521'],
        })
      const internalErrorSpy = jest.spyOn(throwerErrorGuard, 'InternalServerErrorException')

      prismaMock.user.updateMany.mockResolvedValue({ count: 1 })
      const prismaUserUpdateSpy = jest.spyOn(prismaMock.user, 'updateMany')

      prismaMock.user.findMany
        // Initial batch
        .mockResolvedValueOnce([
          userWithRelationsFactory({
            birthNumber: '1234562020',
            id: '1',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          }),
          userWithRelationsFactory({
            birthNumber: '1234564848',
            id: '2',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
          }),
          userWithRelationsFactory({
            birthNumber: '1234561234',
            id: '3',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.CITY_ACCOUNT,
            taxDeliveryMethodCityAccountLockDate: new Date('2023-08-03'),
          }),
          userWithRelationsFactory({
            birthNumber: '1234569999',
            id: '4',
          }),
          userWithRelationsFactory({
            birthNumber: '1234567777',
            id: '5',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          }),
          userWithRelationsFactory({
            birthNumber: '1234564646',
            id: '6',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
          }),
          userWithRelationsFactory({
            birthNumber: '1234564649',
            id: '7',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.CITY_ACCOUNT,
            taxDeliveryMethodCityAccountLockDate: new Date('2020-01-03'),
          }),
          userWithRelationsFactory({
            birthNumber: '1234564521',
            id: '8',
          }),
        ])
        // Re-check inside advisory-lock transaction: all users still active
        .mockResolvedValueOnce([
          userWithRelationsFactory({ birthNumber: '1234562020' }),
          userWithRelationsFactory({ birthNumber: '1234564848' }),
          userWithRelationsFactory({ birthNumber: '1234561234' }),
          userWithRelationsFactory({ birthNumber: '1234569999' }),
          userWithRelationsFactory({ birthNumber: '1234567777' }),
          userWithRelationsFactory({ birthNumber: '1234564646' }),
          userWithRelationsFactory({ birthNumber: '1234564649' }),
          userWithRelationsFactory({ birthNumber: '1234564521' }),
        ])

      await service.updateDeliveryMethodsInNoris()

      expect(internalErrorSpy).not.toHaveBeenCalled()
      expect(updateDeliveryMethodsSpy).toHaveBeenCalledTimes(1)
      expect(updateDeliveryMethodsSpy).toHaveBeenCalledWith({
        data: {
          '1234562020': {
            deliveryMethod: DeliveryMethod.EDESK,
          },
          '1234564848': {
            deliveryMethod: DeliveryMethod.POSTAL,
          },
          '1234561234': {
            deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
            date: '2023-08-03',
          },
          '1234569999': {
            deliveryMethod: DeliveryMethod.POSTAL,
          },
          '1234567777': {
            deliveryMethod: DeliveryMethod.EDESK,
          },
          '1234564646': {
            deliveryMethod: DeliveryMethod.POSTAL,
          },
          '1234564649': {
            deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
            date: '2020-01-03',
          },
          '1234564521': {
            deliveryMethod: DeliveryMethod.POSTAL,
          },
        },
      })

      expect(prismaUserUpdateSpy).toHaveBeenCalledWith({
        where: { birthNumber: { in: ['1234562020', '1234564848', '1234564649', '1234564521'] } },
        data: { lastTaxDeliveryMethodsUpdateYear: new Date().getFullYear() },
      })
      expect(prismaUserUpdateSpy).toHaveBeenCalledWith(
        expectObjectContaining({
          where: { id: { in: ['1', '2', '3', '4', '5', '6', '7', '8'] } },
          data: { lastTaxDeliveryMethodsUpdateTry: expectAny<Date>(Date) },
        })
      )
    })

    it('should not call the endpoint if there are no users', async () => {
      const updateDeliveryMethodsSpy = jest.spyOn(
        service['norisDeliveryMethodService'],
        'updateDeliveryMethods'
      )
      const prismaUserUpdateSpy = jest.spyOn(prismaMock.user, 'updateMany')

      prismaMock.user.findMany.mockResolvedValue([])

      await service.updateDeliveryMethodsInNoris()

      expect(updateDeliveryMethodsSpy).not.toHaveBeenCalled()
      expect(prismaUserUpdateSpy).not.toHaveBeenCalled()
    })

    it('should skip deactivated users detected during the lock re-check and not call Noris for them', async () => {
      const updateDeliveryMethodsSpy = jest.spyOn(
        service['norisDeliveryMethodService'],
        'updateDeliveryMethods'
      )
      const internalErrorSpy = jest.spyOn(throwerErrorGuard, 'InternalServerErrorException')
      const prismaUserUpdateSpy = jest
        .spyOn(prismaMock.user, 'updateMany')
        .mockResolvedValue({ count: 1 })

      prismaMock.user.findMany
        // Initial batch: one user
        .mockResolvedValueOnce([
          userWithRelationsFactory({
            birthNumber: '1234562020',
            id: '1',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          }),
        ])
        // Re-check inside the transaction: user was deactivated (birthNumber now null) → empty
        .mockResolvedValueOnce([])

      await service.updateDeliveryMethodsInNoris()

      expect(internalErrorSpy).not.toHaveBeenCalled()
      // The user was filtered out by the re-check, so Noris should not be called at all.
      expect(updateDeliveryMethodsSpy).not.toHaveBeenCalled()
      // lastTaxDeliveryMethodsUpdateTry is still stamped for the batch.
      expect(prismaUserUpdateSpy).toHaveBeenCalledWith(
        expectObjectContaining({
          where: { id: { in: ['1'] } },
          data: { lastTaxDeliveryMethodsUpdateTry: expectAny<Date>(Date) },
        })
      )
    })

    it('should call Noris only with users still active after the re-check when some are deactivated mid-flight', async () => {
      const updateDeliveryMethodsSpy = jest
        .spyOn(service['norisDeliveryMethodService'], 'updateDeliveryMethods')
        .mockResolvedValue({ birthNumbers: ['123456/2020'] })
      const prismaUserUpdateSpy = jest
        .spyOn(prismaMock.user, 'updateMany')
        .mockResolvedValue({ count: 1 })

      prismaMock.user.findMany
        // Initial batch: two users
        .mockResolvedValueOnce([
          userWithRelationsFactory({
            birthNumber: '1234562020',
            id: '1',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          }),
          userWithRelationsFactory({
            birthNumber: '1234564848',
            id: '2',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
          }),
        ])
        // Re-check: only user1 is still active (user2 was deactivated between the initial query and the lock)
        .mockResolvedValueOnce([userWithRelationsFactory({ birthNumber: '1234562020' })])

      await service.updateDeliveryMethodsInNoris()

      // Noris is called with only the still-active user's data.
      expect(updateDeliveryMethodsSpy).toHaveBeenCalledTimes(1)
      expect(updateDeliveryMethodsSpy).toHaveBeenCalledWith({
        data: { '1234562020': { deliveryMethod: DeliveryMethod.EDESK } },
      })

      // lastTaxDeliveryMethodsUpdateTry is stamped for the entire batch, including the deactivated user.
      expect(prismaUserUpdateSpy).toHaveBeenCalledWith(
        expectObjectContaining({
          where: { id: { in: ['1', '2'] } },
          data: { lastTaxDeliveryMethodsUpdateTry: expectAny<Date>(Date) },
        })
      )

      // lastTaxDeliveryMethodsUpdateYear is stamped only for the birth number Noris confirmed.
      expect(prismaUserUpdateSpy).toHaveBeenCalledWith({
        where: { birthNumber: { in: ['1234562020'] } },
        data: { lastTaxDeliveryMethodsUpdateYear: new Date().getFullYear() },
      })
    })
  })

  describe('lockDeliveryMethods', () => {
    it('should set EDESK delivery method when physicalEntity.activeEdesk is true', async () => {
      const jobStartTime = new Date()
      const updateManySpy = jest
        .spyOn(prismaMock.user, 'updateMany')
        .mockResolvedValue({ count: 1 })

      prismaMock.user.findMany.mockResolvedValueOnce([
        userWithRelationsFactory({
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: null,
          deliveryMethodUserHistory: [],
          physicalEntity: physicalEntityFactory({
            activeEdesk: true,
          }),
        }),
      ])

      prismaMock.user.findMany.mockResolvedValueOnce([])

      await service.lockDeliveryMethods()

      expect(updateManySpy).toHaveBeenCalledWith({
        where: { birthNumber: { in: ['1234567890'] } },
        data: {
          taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          taxDeliveryMethodCityAccountLockDate: null,
        },
      })
    })

    it('should set CITY_ACCOUNT delivery method when taxDeliveryMethod is CITY_ACCOUNT and no active eDesk', async () => {
      const jobStartTime = new Date()
      const cityAccountDate = new Date('2024-01-15')
      const updateSpy = jest.spyOn(prismaMock.user, 'update').mockResolvedValue({} as User)

      prismaMock.user.findMany.mockResolvedValueOnce([
        userWithRelationsFactory({
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
          deliveryMethodUserHistory: [
            deliveryMethodPreferenceHistoryFactory({ createdAt: cityAccountDate }),
          ],
          physicalEntity: physicalEntityFactory({
            activeEdesk: false,
          }),
        }),
      ])

      prismaMock.user.findMany.mockResolvedValueOnce([])

      await service.lockDeliveryMethods()

      expect(updateSpy).toHaveBeenCalledWith({
        where: { birthNumber: '1234567890' },
        data: {
          taxDeliveryMethodAtLockDate: DeliveryMethodEnum.CITY_ACCOUNT,
          taxDeliveryMethodCityAccountLockDate: cityAccountDate,
        },
      })
    })

    it('should set taxDeliveryMethodCityAccountLockDate to latest CITY_ACCOUNT history date', async () => {
      const jobStartTime = new Date()
      const cityAccountDate = new Date('2024-01-15T10:30:00Z')
      const updateSpy = jest.spyOn(prismaMock.user, 'update').mockResolvedValue({} as User)

      prismaMock.user.findMany.mockResolvedValueOnce([
        userWithRelationsFactory({
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
          deliveryMethodUserHistory: [
            deliveryMethodPreferenceHistoryFactory({ createdAt: cityAccountDate }),
          ],
          physicalEntity: physicalEntityFactory({
            activeEdesk: null,
          }),
        }),
      ])

      prismaMock.user.findMany.mockResolvedValueOnce([])

      await service.lockDeliveryMethods()

      expect(updateSpy).toHaveBeenCalledWith({
        where: { birthNumber: '1234567890' },
        data: {
          taxDeliveryMethodAtLockDate: DeliveryMethodEnum.CITY_ACCOUNT,
          taxDeliveryMethodCityAccountLockDate: cityAccountDate,
        },
      })
    })

    it('should set POSTAL delivery method when taxDeliveryMethod is not CITY_ACCOUNT and no active eDesk', async () => {
      const jobStartTime = new Date()
      const updateManySpy = jest
        .spyOn(prismaMock.user, 'updateMany')
        .mockResolvedValue({ count: 1 })

      prismaMock.user.findMany.mockResolvedValueOnce([
        userWithRelationsFactory({
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.POSTAL,
          deliveryMethodUserHistory: [],
          physicalEntity: physicalEntityFactory({
            activeEdesk: false,
          }),
        }),
      ])

      prismaMock.user.findMany.mockResolvedValueOnce([])

      await service.lockDeliveryMethods()

      expect(updateManySpy).toHaveBeenCalledWith({
        where: { birthNumber: { in: ['1234567890'] } },
        data: {
          taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
          taxDeliveryMethodCityAccountLockDate: null,
        },
      })
    })

    it('should clear taxDeliveryMethodCityAccountLockDate for EDESK users', async () => {
      const jobStartTime = new Date()
      const updateManySpy = jest
        .spyOn(prismaMock.user, 'updateMany')
        .mockResolvedValue({ count: 1 })

      prismaMock.user.findMany.mockResolvedValueOnce([
        userWithRelationsFactory({
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
          deliveryMethodUserHistory: [
            deliveryMethodPreferenceHistoryFactory({ createdAt: new Date('2024-01-15') }),
          ],
          physicalEntity: physicalEntityFactory({
            activeEdesk: true,
          }),
        }),
      ])

      prismaMock.user.findMany.mockResolvedValueOnce([])

      await service.lockDeliveryMethods()

      expect(updateManySpy).toHaveBeenCalledWith({
        where: { birthNumber: { in: ['1234567890'] } },
        data: {
          taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          taxDeliveryMethodCityAccountLockDate: null,
        },
      })
    })

    it('should clear taxDeliveryMethodCityAccountLockDate for POSTAL users', async () => {
      const jobStartTime = new Date()
      const updateManySpy = jest
        .spyOn(prismaMock.user, 'updateMany')
        .mockResolvedValue({ count: 1 })

      prismaMock.user.findMany.mockResolvedValueOnce([
        userWithRelationsFactory({
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.POSTAL,
          deliveryMethodUserHistory: [],
          physicalEntity: physicalEntityFactory({
            activeEdesk: null,
          }),
        }),
      ])

      prismaMock.user.findMany.mockResolvedValueOnce([])

      await service.lockDeliveryMethods()

      expect(updateManySpy).toHaveBeenCalledWith({
        where: { birthNumber: { in: ['1234567890'] } },
        data: {
          taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
          taxDeliveryMethodCityAccountLockDate: null,
        },
      })
    })

    it('should prioritize activeEdesk over CITY_ACCOUNT preference', async () => {
      const jobStartTime = new Date()
      const cityAccountDate = new Date('2024-01-15')
      const updateManySpy = jest
        .spyOn(prismaMock.user, 'updateMany')
        .mockResolvedValue({ count: 1 })

      prismaMock.user.findMany.mockResolvedValueOnce([
        userWithRelationsFactory({
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
          deliveryMethodUserHistory: [
            deliveryMethodPreferenceHistoryFactory({ createdAt: cityAccountDate }),
          ],
          physicalEntity: physicalEntityFactory({
            activeEdesk: true, // EDESK should take priority
          }),
        }),
      ])

      prismaMock.user.findMany.mockResolvedValueOnce([])

      await service.lockDeliveryMethods()

      // Should set EDESK, not CITY_ACCOUNT, even though user preference is CITY_ACCOUNT
      expect(updateManySpy).toHaveBeenCalledWith({
        where: { birthNumber: { in: ['1234567890'] } },
        data: {
          taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          taxDeliveryMethodCityAccountLockDate: null,
        },
      })
    })
  })

  describe('sendDailyDeliveryMethodSummaries', () => {
    let mailgunService: MailgunService
    let yesterday: Date

    beforeEach(() => {
      mailgunService = service['mailgunService']
      // Reset all mocks before each test
      jest.clearAllMocks()

      // Calculate yesterday based on fake timer
      yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(12, 0, 0, 0)
    })

    it('should not send emails when SEND_DAILY_DELIVERY_METHOD_SUMMARIES config is disabled', async () => {
      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          key: 'SEND_DAILY_DELIVERY_METHOD_SUMMARIES',
          value: { active: false },
        })
      )

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
      // Should not query for changes if disabled
      expect(prismaMock.deliveryMethodPreferenceHistory.findMany).not.toHaveBeenCalled()
      expect(prismaMock.physicalEntity.findMany).not.toHaveBeenCalled()
    })

    it('should skip users without email, externalId, or birthNumber', async () => {
      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      // Mock initial query for users with changes
      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([
          deliveryMethodPreferenceHistoryFactory({ userId: 'user1' }),
          deliveryMethodPreferenceHistoryFactory({ userId: 'user2' }),
          deliveryMethodPreferenceHistoryFactory({ userId: 'user3' }),
        ])
        .mockResolvedValueOnce([]) // Latest delivery method
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      // Mock batch fetch returning users with missing data
      prismaMock.user.findMany.mockResolvedValue([
        userWithRelationsFactory({
          id: 'user1',
          email: null, // Missing email
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: null,
        }),
        userWithRelationsFactory({
          id: 'user2',
          email: mockEmail,
          externalId: undefined, // Missing externalId
          birthNumber: '1234567890',
          physicalEntity: null,
        }),
        userWithRelationsFactory({
          id: 'user3',
          email: mockEmail,
          externalId: 'ext-456',
          birthNumber: null, // Missing birthNumber
          physicalEntity: null,
        }),
      ])

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should send eDesk activation email when eDesk was activated yesterday', async () => {
      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      // Mock initial query for users with eDesk changes
      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([]) // Initial query - no delivery method changes
        .mockResolvedValueOnce([]) // Latest delivery method
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([
        physicalEntityFactory({
          userId: 'user1',
          activeEdesk: true,
          edeskStatusChangedAt: yesterday,
        }),
      ])

      // Mock batch fetch
      prismaMock.user.findMany.mockResolvedValue([
        userWithRelationsFactory({
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: physicalEntityFactory({
            activeEdesk: true,
            edeskStatusChangedAt: yesterday,
          }),
        }),
      ])

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-from-user-data', {
        userEmail: mockEmail,
        externalId: 'ext-123',
        deliveryMethod: 'edesk',
      })
    })

    it('should send postal email when eDesk was deactivated yesterday (no CITY_ACCOUNT preference)', async () => {
      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([]) // Initial query - no delivery method changes
        .mockResolvedValueOnce([]) // Latest delivery method - none
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([
        physicalEntityFactory({
          userId: 'user1',
          activeEdesk: false,
          edeskStatusChangedAt: yesterday,
        }),
      ])

      prismaMock.user.findMany.mockResolvedValue([
        userWithRelationsFactory({
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: physicalEntityFactory({
            activeEdesk: false,
            edeskStatusChangedAt: yesterday,
          }),
        }),
      ])

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-from-user-data', {
        userEmail: mockEmail,
        externalId: 'ext-123',
        deliveryMethod: 'postal',
      })
    })

    it('should send City Account email when eDesk was deactivated yesterday and user has CITY_ACCOUNT preference', async () => {
      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([]) // Initial query - no delivery method changes
        .mockResolvedValueOnce([
          // Latest delivery method - user prefers CITY_ACCOUNT
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: new Date(yesterday.getTime() - 86400000), // Day before yesterday
          }),
        ])
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([
        physicalEntityFactory({
          userId: 'user1',
          activeEdesk: false,
          edeskStatusChangedAt: yesterday,
        }),
      ])

      prismaMock.user.findMany.mockResolvedValue([
        userWithRelationsFactory({
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: physicalEntityFactory({
            activeEdesk: false,
            edeskStatusChangedAt: yesterday,
          }),
        }),
      ])

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-from-user-data', {
        userEmail: mockEmail,
        externalId: 'ext-123',
        deliveryMethod: 'email',
        birthNumber: '1234567890',
      })
    })

    it('should send City Account email when delivery method changed to CITY_ACCOUNT yesterday', async () => {
      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([deliveryMethodPreferenceHistoryFactory({ userId: 'user1' })]) // Initial query - user has delivery method change
        .mockResolvedValueOnce([
          // Latest delivery method
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          }),
        ])
        .mockResolvedValueOnce([]) // Previous delivery method - no previous state
        .mockResolvedValueOnce([
          // Yesterday delivery method change
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          }),
        ])

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findMany.mockResolvedValue([
        userWithRelationsFactory({
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: physicalEntityFactory({
            activeEdesk: false,
            edeskStatusChangedAt: null,
          }),
        }),
      ])

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-from-user-data', {
        userEmail: mockEmail,
        externalId: 'ext-123',
        birthNumber: '1234567890',
        deliveryMethod: 'email',
      })
    })

    it('should send postal email when delivery method changed to POSTAL yesterday', async () => {
      const twoDaysAgo = new Date(yesterday.getTime() - 86400000)

      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([deliveryMethodPreferenceHistoryFactory({ userId: 'user1' })]) // Initial query
        .mockResolvedValueOnce([
          // Latest delivery method
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.POSTAL,
            createdAt: yesterday,
          }),
        ])
        .mockResolvedValueOnce([
          // Previous delivery method
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: twoDaysAgo,
          }),
        ])
        .mockResolvedValueOnce([
          // Yesterday delivery method change
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.POSTAL,
            createdAt: yesterday,
          }),
        ])

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findMany.mockResolvedValue([
        userWithRelationsFactory({
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: physicalEntityFactory({
            activeEdesk: false,
            edeskStatusChangedAt: null,
          }),
        }),
      ])

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-from-user-data', {
        userEmail: mockEmail,
        externalId: 'ext-123',
        deliveryMethod: 'postal',
      })
    })

    it('should skip users with active eDesk who had delivery method changes but no eDesk status change', async () => {
      const twoDaysAgo = new Date(yesterday.getTime() - 86400000)

      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([deliveryMethodPreferenceHistoryFactory({ userId: 'user1' })]) // Initial query - delivery method change
        .mockResolvedValueOnce([
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          }),
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findMany.mockResolvedValue([
        userWithRelationsFactory({
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: physicalEntityFactory({
            activeEdesk: true,
            edeskStatusChangedAt: twoDaysAgo, // Changed 2 days ago, not yesterday
          }),
        }),
      ])

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should skip users when delivery method did not change from previous state', async () => {
      const twoDaysAgo = new Date(yesterday.getTime() - 86400000)

      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([deliveryMethodPreferenceHistoryFactory({ userId: 'user1' })]) // Initial query
        .mockResolvedValueOnce([
          // Latest delivery method - CITY_ACCOUNT
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          }),
        ])
        .mockResolvedValueOnce([
          // Previous delivery method - also CITY_ACCOUNT (no change)
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: twoDaysAgo,
          }),
        ])
        .mockResolvedValueOnce([
          // Yesterday delivery method change
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          }),
        ])

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findMany.mockResolvedValue([
        userWithRelationsFactory({
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: physicalEntityFactory({
            activeEdesk: false,
            edeskStatusChangedAt: null,
          }),
        }),
      ])

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should combine both delivery method and eDesk changes and deduplicate by userId', async () => {
      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      // User1 and User2 have delivery method changes, User1 and User3 have eDesk changes
      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([
          deliveryMethodPreferenceHistoryFactory({ userId: 'user1' }),
          deliveryMethodPreferenceHistoryFactory({ userId: 'user2' }),
        ])
        .mockResolvedValueOnce([]) // Latest delivery method
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([
        physicalEntityFactory({
          userId: 'user1', // Duplicate - should be deduplicated
          activeEdesk: true,
          edeskStatusChangedAt: yesterday,
        }),
        physicalEntityFactory({
          userId: 'user3',
          activeEdesk: true,
          edeskStatusChangedAt: yesterday,
        }),
      ])

      // Mock batch fetch - should fetch all 3 unique users
      prismaMock.user.findMany.mockResolvedValue([
        userWithRelationsFactory({
          id: 'user1',
          email: null, // Will be skipped
          externalId: 'ext-1',
          birthNumber: '1234567890',
          physicalEntity: null,
        }),
        userWithRelationsFactory({
          id: 'user2',
          email: null, // Will be skipped
          externalId: 'ext-2',
          birthNumber: '1234567890',
          physicalEntity: null,
        }),
        userWithRelationsFactory({
          id: 'user3',
          email: null, // Will be skipped
          externalId: 'ext-3',
          birthNumber: '1234567890',
          physicalEntity: null,
        }),
      ])

      await service.sendDailyDeliveryMethodSummaries()

      // Verify batch fetch was called with deduplicated user IDs
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expectObjectContaining({
          where: { id: { in: expectArrayContaining(['user1', 'user2', 'user3']) } },
        })
      )
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expectObjectContaining({
          where: { id: { in: expectAny<string[]>(Array) } },
        })
      )
      const [calledWith] = expectDefined(prismaMock.user.findMany.mock.lastCall) as [
        Prisma.UserFindManyArgs,
      ]
      const whereId = calledWith.where?.id
      expect(whereId && typeof whereId === 'object' ? whereId.in : undefined).toHaveLength(3) // Deduplicated
    })

    it('should only process users with changes between yesterday start (00:00:00) and end (23:59:59)', async () => {
      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([]) // Initial query
        .mockResolvedValueOnce([]) // Latest delivery method
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change
      prismaMock.physicalEntity.findMany.mockResolvedValue([])
      prismaMock.user.findMany.mockResolvedValue([])

      await service.sendDailyDeliveryMethodSummaries()

      // Verify delivery-method initial query uses correct date range
      const initialCall = prismaMock.deliveryMethodPreferenceHistory.findMany.mock
        .calls[0][0] as Prisma.DeliveryMethodPreferenceHistoryFindManyArgs
      const createdAtFilter = initialCall.where
        ?.createdAt as Prisma.DateTimeFilter<'DeliveryMethodPreferenceHistory'>
      const rangeStart = createdAtFilter.gte as Date
      const rangeEnd = createdAtFilter.lte as Date

      expect(rangeStart.getHours()).toBe(0)
      expect(rangeStart.getMinutes()).toBe(0)
      expect(rangeStart.getSeconds()).toBe(0)
      expect(rangeStart.getMilliseconds()).toBe(0)

      expect(rangeEnd.getHours()).toBe(23)
      expect(rangeEnd.getMinutes()).toBe(59)
      expect(rangeEnd.getSeconds()).toBe(59)
      expect(rangeEnd.getMilliseconds()).toBe(999)

      // Verify eDesk query uses same date range
      expect(prismaMock.physicalEntity.findMany).toHaveBeenCalledWith(
        expectObjectContaining({
          where: expectObjectContaining<Prisma.PhysicalEntityWhereInput>({
            edeskStatusChangedAt: {
              gte: expectAny<Date>(Date),
              lte: expectAny<Date>(Date),
            },
          }),
        })
      )
    })

    it('should prioritize eDesk status over delivery method changes when eDesk is active', async () => {
      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([deliveryMethodPreferenceHistoryFactory({ userId: 'user1' })]) // Initial query - delivery method change
        .mockResolvedValueOnce([
          // Latest delivery method
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          }),
        ])
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      // User has active eDesk (changed yesterday) AND delivery method change yesterday
      prismaMock.user.findMany.mockResolvedValue([
        userWithRelationsFactory({
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: physicalEntityFactory({
            activeEdesk: true,
            edeskStatusChangedAt: yesterday,
          }),
        }),
      ])

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      // Should send eDesk email (prioritizes eDesk over GDPR changes)
      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-from-user-data', {
        userEmail: mockEmail,
        externalId: 'ext-123',
        deliveryMethod: 'edesk',
      })
    })

    it('should process multiple users in batch with different delivery method changes', async () => {
      prismaMock.config.findFirst.mockResolvedValue(
        configFactory({
          value: { active: true },
        })
      )

      const twoDaysAgo = new Date(yesterday.getTime() - 86400000)

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([
          deliveryMethodPreferenceHistoryFactory({ userId: 'user1' }),
          deliveryMethodPreferenceHistoryFactory({ userId: 'user2' }),
        ]) // Initial query
        .mockResolvedValueOnce([
          // Latest delivery method
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          }),
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user2',
            method: DeliveryMethodUserPreferenceEnum.POSTAL,
            createdAt: yesterday,
          }),
        ])
        .mockResolvedValueOnce([
          // Previous delivery method
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user2',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: twoDaysAgo,
          }),
        ])
        .mockResolvedValueOnce([
          // Yesterday delivery method change
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          }),
          deliveryMethodPreferenceHistoryFactory({
            userId: 'user2',
            method: DeliveryMethodUserPreferenceEnum.POSTAL,
            createdAt: yesterday,
          }),
        ])

      prismaMock.physicalEntity.findMany.mockResolvedValue([
        physicalEntityFactory({
          userId: 'user3',
          activeEdesk: true,
          edeskStatusChangedAt: yesterday,
        }),
      ])

      prismaMock.user.findMany.mockResolvedValue([
        userWithRelationsFactory({
          id: 'user1',
          email: 'user1@example.com',
          externalId: 'ext-1',
          birthNumber: '1111111111',
          physicalEntity: physicalEntityFactory({
            activeEdesk: false,
            edeskStatusChangedAt: null,
          }),
        }),
        userWithRelationsFactory({
          id: 'user2',
          email: 'user2@example.com',
          externalId: 'ext-2',
          birthNumber: '2222222222',
          physicalEntity: physicalEntityFactory({
            activeEdesk: false,
            edeskStatusChangedAt: null,
          }),
        }),
        userWithRelationsFactory({
          id: 'user3',
          email: 'user3@example.com',
          externalId: 'ext-3',
          birthNumber: '3333333333',
          physicalEntity: physicalEntityFactory({
            activeEdesk: true,
            edeskStatusChangedAt: yesterday,
          }),
        }),
      ])

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).toHaveBeenCalledTimes(3)

      // User1: switched to CITY_ACCOUNT (new)
      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-from-user-data', {
        userEmail: 'user1@example.com',
        externalId: 'ext-1',
        birthNumber: '1111111111',
        deliveryMethod: 'email',
      })

      // User2: switched to POSTAL (changed from CITY_ACCOUNT)
      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-from-user-data', {
        userEmail: 'user2@example.com',
        externalId: 'ext-2',
        deliveryMethod: 'postal',
      })

      // User3: eDesk activated
      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-from-user-data', {
        userEmail: 'user3@example.com',
        externalId: 'ext-3',
        deliveryMethod: 'edesk',
      })
    })
  })
})
