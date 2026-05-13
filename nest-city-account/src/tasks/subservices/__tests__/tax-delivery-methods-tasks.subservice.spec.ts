import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { DeliveryMethodEnum, DeliveryMethodUserPreferenceEnum, Prisma, User } from '@prisma/client'
import { AxiosResponse } from 'axios'
import { UpdateDeliveryMethodsInNorisResponseDto } from 'openapi-clients/tax'

import prismaMock from '../../../../test/singleton'
import { MailgunService } from '../../../mailgun/mailgun.service'
import { PrismaService } from '../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { TaxSubservice } from '../../../utils/subservices/tax.subservice'
import { DeliveryMethodNoris } from '../../../utils/types/tax.types'
import { TaxDeliveryMethodsTasksSubservice } from '../tax-delivery-methods-tasks.subservice'

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    physicalEntity: true
    deliveryMethodUserHistory: true
  }
}>

const mockEmail = 'test@example.com'

describe('TaxDeliveryMethodsTasksSubservice', () => {
  let service: TaxDeliveryMethodsTasksSubservice
  let throwerErrorGuard: ThrowerErrorGuard

  beforeAll(() => {
    process.env = {
      ...process.env,
      MUNICIPAL_TAX_LOCK_MONTH: '02',
      MUNICIPAL_TAX_LOCK_DAY: '01',
    }
    jest.spyOn(console, 'log').mockImplementation(() => {})
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxDeliveryMethodsTasksSubservice,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TaxSubservice, useValue: createMock<TaxSubservice>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
        { provide: MailgunService, useValue: createMock<MailgunService>() },
      ],
    }).compile()

    service = module.get<TaxDeliveryMethodsTasksSubservice>(TaxDeliveryMethodsTasksSubservice)
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)

    // Make $transaction execute its callback so the advisory-lock path is exercised in tests.
    ;(prismaMock.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      if (typeof fn === 'function') return fn(prismaMock)
      return Promise.all(fn)
    })
    // $executeRaw is used for pg_advisory_xact_lock — no-op in tests.
    ;(prismaMock.$executeRaw as jest.Mock).mockResolvedValue(0)
  })

  describe('updateDeliveryMethodsInNoris', () => {
    it('should call the endpoint with the correct data, and update only users who are really updated in Noris', async () => {
      const adminApiUpdateSpy = jest
        .spyOn(service['taxSubservice'], 'updateDeliveryMethodsInNoris')
        .mockResolvedValue({
          data: {
            birthNumbers: ['123456/2020', '123456/4848', '123456/4649', '123456/4521'],
          },
        } as AxiosResponse<UpdateDeliveryMethodsInNorisResponseDto>)
      const internalErrorSpy = jest.spyOn(throwerErrorGuard, 'InternalServerErrorException')

      prismaMock.user.updateMany.mockResolvedValue({ count: 1 })
      const prismaUserUpdateSpy = jest.spyOn(prismaMock.user, 'updateMany')

      prismaMock.user.findMany
        // Initial batch
        .mockResolvedValueOnce([
          {
            birthNumber: '1234562020',
            id: '1',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          },
          {
            birthNumber: '1234564848',
            id: '2',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
          },
          {
            birthNumber: '1234561234',
            id: '3',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.CITY_ACCOUNT,
            taxDeliveryMethodCityAccountLockDate: new Date('2023-08-03'),
          },
          {
            birthNumber: '1234569999',
            id: '4',
          },
          {
            birthNumber: '1234567777',
            id: '5',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          },
          {
            birthNumber: '1234564646',
            id: '6',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
          },
          {
            birthNumber: '1234564649',
            id: '7',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.CITY_ACCOUNT,
            taxDeliveryMethodCityAccountLockDate: new Date('2020-01-03'),
          },
          {
            birthNumber: '1234564521',
            id: '8',
          },
        ] as unknown as UserWithRelations[])
        // Re-check inside advisory-lock transaction: all users still active
        .mockResolvedValueOnce([
          { birthNumber: '1234562020' },
          { birthNumber: '1234564848' },
          { birthNumber: '1234561234' },
          { birthNumber: '1234569999' },
          { birthNumber: '1234567777' },
          { birthNumber: '1234564646' },
          { birthNumber: '1234564649' },
          { birthNumber: '1234564521' },
        ] as unknown as UserWithRelations[])

      await service.updateDeliveryMethodsInNoris()

      expect(internalErrorSpy).not.toHaveBeenCalled()
      expect(adminApiUpdateSpy).toHaveBeenCalledTimes(1)
      expect(adminApiUpdateSpy).toHaveBeenCalledWith({
        data: {
          '1234562020': {
            deliveryMethod: DeliveryMethodNoris.EDESK,
          },
          '1234564848': {
            deliveryMethod: DeliveryMethodNoris.POSTAL,
          },
          '1234561234': {
            deliveryMethod: DeliveryMethodNoris.CITY_ACCOUNT,
            date: '2023-08-03',
          },
          '1234569999': {
            deliveryMethod: DeliveryMethodNoris.POSTAL,
          },
          '1234567777': {
            deliveryMethod: DeliveryMethodNoris.EDESK,
          },
          '1234564646': {
            deliveryMethod: DeliveryMethodNoris.POSTAL,
          },
          '1234564649': {
            deliveryMethod: DeliveryMethodNoris.CITY_ACCOUNT,
            date: '2020-01-03',
          },
          '1234564521': {
            deliveryMethod: DeliveryMethodNoris.POSTAL,
          },
        },
      })

      expect(prismaUserUpdateSpy).toHaveBeenCalledWith({
        where: { birthNumber: { in: ['1234562020', '1234564848', '1234564649', '1234564521'] } },
        data: { lastTaxDeliveryMethodsUpdateYear: new Date().getFullYear() },
      })
      expect(prismaUserUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['1', '2', '3', '4', '5', '6', '7', '8'] } },
          data: { lastTaxDeliveryMethodsUpdateTry: expect.any(Date) },
        })
      )
    })

    it('should not call the endpoint if there are no users', async () => {
      const adminApiUpdateSpy = jest.spyOn(service['taxSubservice'], 'updateDeliveryMethodsInNoris')
      const prismaUserUpdateSpy = jest.spyOn(prismaMock.user, 'updateMany')

      prismaMock.user.findMany.mockResolvedValue([])

      await service.updateDeliveryMethodsInNoris()

      expect(adminApiUpdateSpy).not.toHaveBeenCalled()
      expect(prismaUserUpdateSpy).not.toHaveBeenCalled()
    })

    it('should skip deactivated users detected during the lock re-check and not call Noris for them', async () => {
      const adminApiUpdateSpy = jest.spyOn(service['taxSubservice'], 'updateDeliveryMethodsInNoris')
      const removeDeliveryMethodSpy = jest.spyOn(
        service['taxSubservice'],
        'removeDeliveryMethodFromNoris'
      )
      const internalErrorSpy = jest.spyOn(throwerErrorGuard, 'InternalServerErrorException')
      const prismaUserUpdateSpy = jest
        .spyOn(prismaMock.user, 'updateMany')
        .mockResolvedValue({ count: 1 })

      prismaMock.user.findMany
        // Initial batch: one user
        .mockResolvedValueOnce([
          {
            birthNumber: '1234562020',
            id: '1',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          },
        ] as unknown as UserWithRelations[])
        // Re-check inside the transaction: user was deactivated (birthNumber now null) → empty
        .mockResolvedValueOnce([])

      await service.updateDeliveryMethodsInNoris()

      expect(internalErrorSpy).not.toHaveBeenCalled()
      // The user was filtered out by the re-check, so Noris should not be called at all.
      expect(adminApiUpdateSpy).not.toHaveBeenCalled()
      // No re-remove needed — locking guarantees correctness without it.
      expect(removeDeliveryMethodSpy).not.toHaveBeenCalled()
      // lastTaxDeliveryMethodsUpdateTry is still stamped for the batch.
      expect(prismaUserUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['1'] } },
          data: { lastTaxDeliveryMethodsUpdateTry: expect.any(Date) },
        })
      )
    })

    it('should call Noris only with users still active after the re-check when some are deactivated mid-flight', async () => {
      const adminApiUpdateSpy = jest
        .spyOn(service['taxSubservice'], 'updateDeliveryMethodsInNoris')
        .mockResolvedValue({
          data: { birthNumbers: ['123456/2020'] },
        } as AxiosResponse<UpdateDeliveryMethodsInNorisResponseDto>)
      const prismaUserUpdateSpy = jest
        .spyOn(prismaMock.user, 'updateMany')
        .mockResolvedValue({ count: 1 })

      prismaMock.user.findMany
        // Initial batch: two users
        .mockResolvedValueOnce([
          {
            birthNumber: '1234562020',
            id: '1',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          },
          {
            birthNumber: '1234564848',
            id: '2',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
          },
        ] as unknown as UserWithRelations[])
        // Re-check: only user1 is still active (user2 was deactivated between the initial query and the lock)
        .mockResolvedValueOnce([{ birthNumber: '1234562020' }] as unknown as UserWithRelations[])

      await service.updateDeliveryMethodsInNoris()

      // Noris is called with only the still-active user's data.
      expect(adminApiUpdateSpy).toHaveBeenCalledTimes(1)
      expect(adminApiUpdateSpy).toHaveBeenCalledWith({
        data: {
          '1234562020': { deliveryMethod: DeliveryMethodNoris.EDESK },
        },
      })

      // lastTaxDeliveryMethodsUpdateTry is stamped for the entire batch, including the deactivated user.
      expect(prismaUserUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['1', '2'] } },
          data: { lastTaxDeliveryMethodsUpdateTry: expect.any(Date) },
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
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: null,
          deliveryMethodUserHistory: [],
          physicalEntity: {
            activeEdesk: true,
          },
        },
      ] as unknown as UserWithRelations[])

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
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
          deliveryMethodUserHistory: [{ createdAt: cityAccountDate }],
          physicalEntity: {
            activeEdesk: false,
          },
        },
      ] as unknown as UserWithRelations[])

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
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
          deliveryMethodUserHistory: [{ createdAt: cityAccountDate }],
          physicalEntity: {
            activeEdesk: null,
          },
        },
      ] as unknown as UserWithRelations[])

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
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.POSTAL,
          deliveryMethodUserHistory: [],
          physicalEntity: {
            activeEdesk: false,
          },
        },
      ] as unknown as UserWithRelations[])

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
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
          deliveryMethodUserHistory: [{ createdAt: new Date('2024-01-15') }],
          physicalEntity: {
            activeEdesk: true,
          },
        },
      ] as unknown as UserWithRelations[])

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
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.POSTAL,
          deliveryMethodUserHistory: [],
          physicalEntity: {
            activeEdesk: null,
          },
        },
      ] as unknown as UserWithRelations[])

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
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          taxDeliveryMethod: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
          deliveryMethodUserHistory: [{ createdAt: cityAccountDate }],
          physicalEntity: {
            activeEdesk: true, // EDESK should take priority
          },
        },
      ] as unknown as UserWithRelations[])

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
      prismaMock.config.findFirst.mockResolvedValue({
        key: 'SEND_DAILY_DELIVERY_METHOD_SUMMARIES',
        value: { active: false },
      } as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
      // Should not query for changes if disabled
      expect(prismaMock.deliveryMethodPreferenceHistory.findMany).not.toHaveBeenCalled()
      expect(prismaMock.physicalEntity.findMany).not.toHaveBeenCalled()
    })

    it('should skip users without email, externalId, or birthNumber', async () => {
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      // Mock initial query for users with changes
      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([
          { userId: 'user1' },
          { userId: 'user2' },
          { userId: 'user3' },
        ] as any)
        .mockResolvedValueOnce([]) // Latest delivery method
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      // Mock batch fetch returning users with missing data
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: null, // Missing email
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: null,
        },
        {
          id: 'user2',
          email: mockEmail,
          externalId: null, // Missing externalId
          birthNumber: '1234567890',
          physicalEntity: null,
        },
        {
          id: 'user3',
          email: mockEmail,
          externalId: 'ext-456',
          birthNumber: null, // Missing birthNumber
          physicalEntity: null,
        },
      ] as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should send eDesk activation email when eDesk was activated yesterday', async () => {
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      // Mock initial query for users with eDesk changes
      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([]) // Initial query - no delivery method changes
        .mockResolvedValueOnce([]) // Latest delivery method
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([
        {
          userId: 'user1',
          activeEdesk: true,
          edeskStatusChangedAt: yesterday,
        },
      ] as any)

      // Mock batch fetch
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: {
            activeEdesk: true,
            edeskStatusChangedAt: yesterday,
          },
        },
      ] as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-from-user-data', {
        userEmail: mockEmail,
        externalId: 'ext-123',
        deliveryMethod: 'edesk',
      })
    })

    it('should send postal email when eDesk was deactivated yesterday (no CITY_ACCOUNT preference)', async () => {
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([]) // Initial query - no delivery method changes
        .mockResolvedValueOnce([]) // Latest delivery method - none
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([
        {
          userId: 'user1',
          activeEdesk: false,
          edeskStatusChangedAt: yesterday,
        },
      ] as any)

      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: {
            activeEdesk: false,
            edeskStatusChangedAt: yesterday,
          },
        },
      ] as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-from-user-data', {
        userEmail: mockEmail,
        externalId: 'ext-123',
        deliveryMethod: 'postal',
      })
    })

    it('should send City Account email when eDesk was deactivated yesterday and user has CITY_ACCOUNT preference', async () => {
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([]) // Initial query - no delivery method changes
        .mockResolvedValueOnce([
          // Latest delivery method - user prefers CITY_ACCOUNT
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: new Date(yesterday.getTime() - 86400000), // Day before yesterday
          },
        ] as any)
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([
        {
          userId: 'user1',
          activeEdesk: false,
          edeskStatusChangedAt: yesterday,
        },
      ] as any)

      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: {
            activeEdesk: false,
            edeskStatusChangedAt: yesterday,
          },
        },
      ] as any)

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
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([{ userId: 'user1' }] as any) // Initial query - user has delivery method change
        .mockResolvedValueOnce([
          // Latest delivery method
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          },
        ] as any)
        .mockResolvedValueOnce([]) // Previous delivery method - no previous state
        .mockResolvedValueOnce([
          // Yesterday delivery method change
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          },
        ] as any)

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: {
            activeEdesk: false,
            edeskStatusChangedAt: null,
          },
        },
      ] as any)

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

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([{ userId: 'user1' }] as any) // Initial query
        .mockResolvedValueOnce([
          // Latest delivery method
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.POSTAL,
            createdAt: yesterday,
          },
        ] as any)
        .mockResolvedValueOnce([
          // Previous delivery method
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: twoDaysAgo,
          },
        ] as any)
        .mockResolvedValueOnce([
          // Yesterday delivery method change
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.POSTAL,
            createdAt: yesterday,
          },
        ] as any)

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: {
            activeEdesk: false,
            edeskStatusChangedAt: null,
          },
        },
      ] as any)

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

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([{ userId: 'user1' }] as any) // Initial query - delivery method change
        .mockResolvedValueOnce([
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          },
        ] as any)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: {
            activeEdesk: true,
            edeskStatusChangedAt: twoDaysAgo, // Changed 2 days ago, not yesterday
          },
        },
      ] as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should skip users when delivery method did not change from previous state', async () => {
      const twoDaysAgo = new Date(yesterday.getTime() - 86400000)

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([{ userId: 'user1' }] as any) // Initial query
        .mockResolvedValueOnce([
          // Latest delivery method - CITY_ACCOUNT
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          },
        ] as any)
        .mockResolvedValueOnce([
          // Previous delivery method - also CITY_ACCOUNT (no change)
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: twoDaysAgo,
          },
        ] as any)
        .mockResolvedValueOnce([
          // Yesterday delivery method change
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          },
        ] as any)

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: {
            activeEdesk: false,
            edeskStatusChangedAt: null,
          },
        },
      ] as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should combine both delivery method and eDesk changes and deduplicate by userId', async () => {
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      // User1 and User2 have delivery method changes, User1 and User3 have eDesk changes
      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([{ userId: 'user1' }, { userId: 'user2' }] as any)
        .mockResolvedValueOnce([]) // Latest delivery method
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([
        {
          userId: 'user1', // Duplicate - should be deduplicated
          activeEdesk: true,
          edeskStatusChangedAt: yesterday,
        },
        {
          userId: 'user3',
          activeEdesk: true,
          edeskStatusChangedAt: yesterday,
        },
      ] as any)

      // Mock batch fetch - should fetch all 3 unique users
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: null, // Will be skipped
          externalId: 'ext-1',
          birthNumber: '1234567890',
          physicalEntity: null,
        },
        {
          id: 'user2',
          email: null, // Will be skipped
          externalId: 'ext-2',
          birthNumber: '1234567890',
          physicalEntity: null,
        },
        {
          id: 'user3',
          email: null, // Will be skipped
          externalId: 'ext-3',
          birthNumber: '1234567890',
          physicalEntity: null,
        },
      ] as any)

      await service.sendDailyDeliveryMethodSummaries()

      // Verify batch fetch was called with deduplicated user IDs
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: expect.arrayContaining(['user1', 'user2', 'user3']) } },
        })
      )
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: expect.any(Array) } },
        })
      )
      const calledWith = (prismaMock.user.findMany as jest.Mock).mock.calls[0][0]
      expect(calledWith.where.id.in).toHaveLength(3) // Deduplicated
    })

    it('should only process users with changes between yesterday start (00:00:00) and end (23:59:59)', async () => {
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([]) // Initial query
        .mockResolvedValueOnce([]) // Latest delivery method
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change
      prismaMock.physicalEntity.findMany.mockResolvedValue([])
      prismaMock.user.findMany.mockResolvedValue([])

      await service.sendDailyDeliveryMethodSummaries()

      // Verify delivery-method initial query uses correct date range
      const initialCall = (prismaMock.deliveryMethodPreferenceHistory.findMany as jest.Mock).mock
        .calls[0][0]
      const rangeStart = initialCall.where.createdAt.gte
      const rangeEnd = initialCall.where.createdAt.lte

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
        expect.objectContaining({
          where: expect.objectContaining({
            edeskStatusChangedAt: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        })
      )
    })

    it('should prioritize eDesk status over delivery method changes when eDesk is active', async () => {
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([{ userId: 'user1' }] as any) // Initial query - delivery method change
        .mockResolvedValueOnce([
          // Latest delivery method
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          },
        ] as any)
        .mockResolvedValueOnce([]) // Previous delivery method
        .mockResolvedValueOnce([]) // Yesterday delivery method change

      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      // User has active eDesk (changed yesterday) AND delivery method change yesterday
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: mockEmail,
          externalId: 'ext-123',
          birthNumber: '1234567890',
          physicalEntity: {
            activeEdesk: true,
            edeskStatusChangedAt: yesterday,
          },
        },
      ] as any)

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
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      const twoDaysAgo = new Date(yesterday.getTime() - 86400000)

      prismaMock.deliveryMethodPreferenceHistory.findMany
        .mockResolvedValueOnce([{ userId: 'user1' }, { userId: 'user2' }] as any) // Initial query
        .mockResolvedValueOnce([
          // Latest delivery method
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          },
          {
            userId: 'user2',
            method: DeliveryMethodUserPreferenceEnum.POSTAL,
            createdAt: yesterday,
          },
        ] as any)
        .mockResolvedValueOnce([
          // Previous delivery method
          {
            userId: 'user2',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: twoDaysAgo,
          },
        ] as any)
        .mockResolvedValueOnce([
          // Yesterday delivery method change
          {
            userId: 'user1',
            method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT,
            createdAt: yesterday,
          },
          {
            userId: 'user2',
            method: DeliveryMethodUserPreferenceEnum.POSTAL,
            createdAt: yesterday,
          },
        ] as any)

      prismaMock.physicalEntity.findMany.mockResolvedValue([
        {
          userId: 'user3',
          activeEdesk: true,
          edeskStatusChangedAt: yesterday,
        },
      ] as any)

      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: 'user1@example.com',
          externalId: 'ext-1',
          birthNumber: '1111111111',
          physicalEntity: {
            activeEdesk: false,
            edeskStatusChangedAt: null,
          },
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          externalId: 'ext-2',
          birthNumber: '2222222222',
          physicalEntity: {
            activeEdesk: false,
            edeskStatusChangedAt: null,
          },
        },
        {
          id: 'user3',
          email: 'user3@example.com',
          externalId: 'ext-3',
          birthNumber: '3333333333',
          physicalEntity: {
            activeEdesk: true,
            edeskStatusChangedAt: yesterday,
          },
        },
      ] as any)

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
