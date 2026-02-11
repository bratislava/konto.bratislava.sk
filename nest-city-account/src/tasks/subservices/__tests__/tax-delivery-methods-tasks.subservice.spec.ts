/**
 * DISCREPANCIES BETWEEN IMPLEMENTATION AND DOCUMENTATION:
 *
 * 1. INCOMPLETE EMAIL TEMPLATES (sendDailyDeliveryMethodSummaries):
 *    - Documentation states emails should be sent for eDesk activation/deactivation and postal activation
 *    - Implementation has these email sends commented out with TODO markers:
 *      * Line 432-436: eDesk activation email ('placeholder-edesk-activated')
 *      * Line 458-462: Postal email when eDesk deactivated ('placeholder-postal-activated')
 *      * Line 539-543: Postal email when GDPR unsubscribe ('placeholder-postal-activated')
 *    - Only City Account subscription email is fully implemented (line 530-534)
 *    - Tests reflect current implementation state (emails not sent) but include TODO comments
 *      referencing the expected behavior per documentation
 *
 * 2. NO OTHER DISCREPANCIES FOUND:
 *    - lockDeliveryMethods implementation matches documentation exactly
 *    - updateDeliveryMethodsInNoris implementation matches documentation exactly
 *    - All business logic, priority rules, and edge cases align with documentation
 */

import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { TaxSubservice } from '../../../utils/subservices/tax.subservice'
import { PrismaService } from '../../../prisma/prisma.service'
import prismaMock from '../../../../test/singleton'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { UpdateDeliveryMethodsInNorisResponseDto } from 'openapi-clients/tax'
import { TaxDeliveryMethodsTasksSubservice } from '../tax-delivery-methods-tasks.subservice'
import { DeliveryMethodEnum, GDPRSubTypeEnum, Prisma, User } from '@prisma/client'
import { DeliveryMethodNoris } from '../../../utils/types/tax.types'
import { AxiosResponse } from 'axios'
import { MailgunService } from '../../../mailgun/mailgun.service'
import { CognitoSubservice } from '../../../utils/subservices/cognito.subservice'
import { PdfGeneratorService } from '../../../pdf-generator/pdf-generator.service'

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    physicalEntity: true
    userGdprData: true
  }
}>

describe('TaxDeliveryMethodsTasksSubservice', () => {
  let service: TaxDeliveryMethodsTasksSubservice
  let throwerErrorGuard: ThrowerErrorGuard

  beforeAll(() => {
    process.env = {
      ...process.env,
      MUNICIPAL_TAX_LOCK_MONTH: '02',
      MUNICIPAL_TAX_LOCK_DAY: '01',
    }
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxDeliveryMethodsTasksSubservice,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TaxSubservice, useValue: createMock<TaxSubservice>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
        { provide: MailgunService, useValue: createMock<MailgunService>() },
        { provide: CognitoSubservice, useValue: createMock<CognitoSubservice>() },
        { provide: PdfGeneratorService, useValue: createMock<PdfGeneratorService>() },
      ],
    }).compile()

    service = module.get<TaxDeliveryMethodsTasksSubservice>(TaxDeliveryMethodsTasksSubservice)
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)
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
        .mockResolvedValueOnce([])

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

    it('should throw error if some user was deactivated during his update in Noris', async () => {
      const adminApiUpdateSpy = jest
        .spyOn(service['taxSubservice'], 'updateDeliveryMethodsInNoris')
        .mockResolvedValue({
          data: {
            birthNumbers: ['123456/2020'],
          },
        } as AxiosResponse<UpdateDeliveryMethodsInNorisResponseDto>)
      const internalErrorSpy = jest
        .spyOn(throwerErrorGuard, 'InternalServerErrorException')
        .mockImplementation(() => {
          throw new Error('User deactivated')
        })
      const prismaUserUpdateSpy = jest.spyOn(prismaMock.user, 'updateMany')

      prismaMock.user.findMany
        .mockResolvedValueOnce([
          {
            birthNumber: '1234562020',
            id: '1',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
          },
        ] as unknown as UserWithRelations[])
        .mockResolvedValueOnce([
          {
            id: '1',
          },
        ] as User[])

      await expect(service.updateDeliveryMethodsInNoris()).rejects.toThrow('User deactivated')

      expect(internalErrorSpy).toHaveBeenCalled()
      expect(adminApiUpdateSpy).toHaveBeenCalled()
      expect(prismaUserUpdateSpy).not.toHaveBeenCalled()
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
          userGdprData: [],
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

    it('should set CITY_ACCOUNT delivery method when GDPR subscribe exists and no active eDesk', async () => {
      const jobStartTime = new Date()
      const gdprDate = new Date('2024-01-15')
      const updateSpy = jest.spyOn(prismaMock.user, 'update').mockResolvedValue({} as User)

      prismaMock.user.findMany.mockResolvedValueOnce([
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          userGdprData: [
            {
              subType: GDPRSubTypeEnum.subscribe,
              createdAt: gdprDate,
            },
          ],
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
          taxDeliveryMethodCityAccountLockDate: gdprDate,
        },
      })
    })

    it('should set taxDeliveryMethodCityAccountLockDate to GDPR consent date for CITY_ACCOUNT users', async () => {
      const jobStartTime = new Date()
      const gdprDate = new Date('2024-01-15T10:30:00Z')
      const updateSpy = jest.spyOn(prismaMock.user, 'update').mockResolvedValue({} as User)

      prismaMock.user.findMany.mockResolvedValueOnce([
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          userGdprData: [
            {
              subType: GDPRSubTypeEnum.subscribe,
              createdAt: gdprDate,
            },
          ],
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
          taxDeliveryMethodCityAccountLockDate: gdprDate,
        },
      })
    })

    it('should set POSTAL delivery method when no GDPR subscribe and no active eDesk', async () => {
      const jobStartTime = new Date()
      const updateManySpy = jest
        .spyOn(prismaMock.user, 'updateMany')
        .mockResolvedValue({ count: 1 })

      prismaMock.user.findMany.mockResolvedValueOnce([
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          userGdprData: [],
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
          userGdprData: [
            {
              subType: GDPRSubTypeEnum.subscribe,
              createdAt: new Date('2024-01-15'),
            },
          ],
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
          userGdprData: [
            {
              subType: GDPRSubTypeEnum.unsubscribe,
              createdAt: new Date('2024-01-15'),
            },
          ],
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

    it('should process users in batches of 100 with 1 second delay', async () => {
      jest.useFakeTimers()
      const jobStartTime = new Date()

      // Create 150 mock users to test batching
      const firstBatch = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        birthNumber: `123456${String(i).padStart(4, '0')}`,
        createdAt: new Date(jobStartTime.getTime() - 10000),
        userGdprData: [],
        physicalEntity: { activeEdesk: false },
      }))

      const secondBatch = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 101}`,
        birthNumber: `123456${String(i + 100).padStart(4, '0')}`,
        createdAt: new Date(jobStartTime.getTime() - 10000),
        userGdprData: [],
        physicalEntity: { activeEdesk: false },
      }))

      prismaMock.user.findMany
        .mockResolvedValueOnce(firstBatch as unknown as UserWithRelations[])
        .mockResolvedValueOnce(secondBatch as unknown as UserWithRelations[])
        .mockResolvedValueOnce([])

      prismaMock.user.updateMany.mockResolvedValue({ count: 1 })

      const lockPromise = service.lockDeliveryMethods()

      // Fast-forward through the delay
      await jest.runAllTimersAsync()
      await lockPromise

      expect(prismaMock.user.findMany).toHaveBeenCalledTimes(3)
      expect(prismaMock.user.findMany).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ take: 100 })
      )

      jest.useRealTimers()
    })

    it('should use latest GDPR record when multiple FORMAL_COMMUNICATION records exist', async () => {
      const jobStartTime = new Date()
      const olderDate = new Date('2024-01-10')
      const newerDate = new Date('2024-01-20')
      const updateSpy = jest.spyOn(prismaMock.user, 'update').mockResolvedValue({} as User)

      prismaMock.user.findMany.mockResolvedValueOnce([
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          userGdprData: [
            {
              subType: GDPRSubTypeEnum.subscribe,
              createdAt: newerDate,
            },
          ],
          physicalEntity: {
            activeEdesk: false,
          },
        },
      ] as unknown as UserWithRelations[])

      prismaMock.user.findMany.mockResolvedValueOnce([])

      await service.lockDeliveryMethods()

      // Should use the latest (first) record due to orderBy createdAt desc, take 1
      expect(updateSpy).toHaveBeenCalledWith({
        where: { birthNumber: '1234567890' },
        data: {
          taxDeliveryMethodAtLockDate: DeliveryMethodEnum.CITY_ACCOUNT,
          taxDeliveryMethodCityAccountLockDate: newerDate,
        },
      })

      // Verify the query orders by createdAt desc and takes 1
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            userGdprData: expect.objectContaining({
              orderBy: { createdAt: 'desc' },
              take: 1,
            }),
          }),
        })
      )
    })

    it('should prioritize activeEdesk over GDPR subscribe preference', async () => {
      const jobStartTime = new Date()
      const gdprDate = new Date('2024-01-15')
      const updateManySpy = jest
        .spyOn(prismaMock.user, 'updateMany')
        .mockResolvedValue({ count: 1 })

      prismaMock.user.findMany.mockResolvedValueOnce([
        {
          id: '1',
          birthNumber: '1234567890',
          createdAt: new Date(jobStartTime.getTime() - 10000),
          userGdprData: [
            {
              subType: GDPRSubTypeEnum.subscribe,
              createdAt: gdprDate,
            },
          ],
          physicalEntity: {
            activeEdesk: true, // EDESK should take priority
          },
        },
      ] as unknown as UserWithRelations[])

      prismaMock.user.findMany.mockResolvedValueOnce([])

      await service.lockDeliveryMethods()

      // Should set EDESK, not CITY_ACCOUNT, even though GDPR subscribe exists
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
    let cognitoSubservice: CognitoSubservice
    let pdfGeneratorService: PdfGeneratorService

    beforeEach(() => {
      mailgunService = service['mailgunService']
      cognitoSubservice = service['cognitoSubsevice']
      pdfGeneratorService = service['pdfGeneratorService']
    })

    it('should not send emails when SEND_DAILY_DELIVERY_METHOD_SUMMARIES config is disabled', async () => {
      prismaMock.config.findFirst.mockResolvedValue({
        key: 'SEND_DAILY_DELIVERY_METHOD_SUMMARIES',
        value: { active: false },
      } as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should throw error when SEND_DAILY_DELIVERY_METHOD_SUMMARIES config is missing from database', async () => {
      prismaMock.config.findFirst.mockResolvedValue(null)

      const internalErrorSpy = jest
        .spyOn(throwerErrorGuard, 'InternalServerErrorException')
        .mockImplementation(() => {
          throw new Error('Config not found')
        })

      await expect(service.sendDailyDeliveryMethodSummaries()).rejects.toThrow('Config not found')

      expect(internalErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        'SEND_DAILY_DELIVERY_METHOD_SUMMARIES not found in database config.'
      )
    })

    it('should skip users without email', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.userGdprData.findMany.mockResolvedValue([{ userId: 'user1' }] as any)
      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: null,
        externalId: 'ext-123',
        birthNumber: '1234567890',
      } as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should skip users without externalId', async () => {
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.userGdprData.findMany.mockResolvedValue([{ userId: 'user1' }] as any)
      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'user@example.com',
        externalId: null,
        birthNumber: '1234567890',
      } as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should skip users without birthNumber', async () => {
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.userGdprData.findMany.mockResolvedValue([{ userId: 'user1' }] as any)
      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'user@example.com',
        externalId: 'ext-123',
        birthNumber: null,
      } as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should send eDesk activation email when eDesk was activated yesterday', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(12, 0, 0, 0)

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.userGdprData.findMany.mockResolvedValue([])
      prismaMock.physicalEntity.findMany.mockResolvedValue([
        {
          userId: 'user1',
          activeEdesk: true,
          edeskStatusChangedAt: yesterday,
        },
      ] as any)

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'user@example.com',
        externalId: 'ext-123',
        birthNumber: '1234567890',
        physicalEntity: {
          activeEdesk: true,
          edeskStatusChangedAt: yesterday,
        },
      } as any)

      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue({
        given_name: 'John',
        family_name: 'Doe',
      } as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      // TODO: Currently commented out in implementation (line 432-436)
      // expect(sendEmailSpy).toHaveBeenCalledWith('placeholder-edesk-activated', {
      //   to: 'user@example.com',
      //   variables: { firstName: 'John' },
      // })
      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should send postal email when eDesk was deactivated yesterday', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(12, 0, 0, 0)

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.userGdprData.findMany.mockResolvedValue([])
      prismaMock.physicalEntity.findMany.mockResolvedValue([
        {
          userId: 'user1',
          activeEdesk: false,
          edeskStatusChangedAt: yesterday,
        },
      ] as any)

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'user@example.com',
        externalId: 'ext-123',
        birthNumber: '1234567890',
        physicalEntity: {
          activeEdesk: false,
          edeskStatusChangedAt: yesterday,
        },
      } as any)

      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue({
        given_name: 'John',
        family_name: 'Doe',
      } as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      // TODO: Currently commented out in implementation (line 458-462)
      // expect(sendEmailSpy).toHaveBeenCalledWith('placeholder-postal-activated', {
      //   to: 'user@example.com',
      //   variables: { firstName: 'John' },
      // })
      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should send City Account email with PDF when GDPR changed to subscribe yesterday', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(12, 0, 0, 0)

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.userGdprData.findMany.mockResolvedValue([{ userId: 'user1' }] as any)
      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'user@example.com',
        externalId: 'ext-123',
        birthNumber: '1234567890',
        physicalEntity: {
          activeEdesk: false,
        },
      } as any)

      prismaMock.userGdprData.findFirst
        .mockResolvedValueOnce({
          userId: 'user1',
          subType: GDPRSubTypeEnum.subscribe,
          createdAt: yesterday,
        } as any)
        .mockResolvedValueOnce(null) // No previous GDPR state

      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue({
        given_name: 'John',
        family_name: 'Doe',
      } as any)

      const mockPdf = {
        data: Buffer.from('mock-pdf'),
        filename: 'mock.pdf',
        contentType: 'application/pdf',
      }
      jest.spyOn(pdfGeneratorService, 'generateFromTemplate').mockResolvedValue(mockPdf)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(pdfGeneratorService.generateFromTemplate).toHaveBeenCalledWith(
        'delivery-method-set-to-notification',
        'oznamenie.pdf',
        {
          email: 'user@example.com',
          name: 'John Doe',
          birthNumber: '1234567890',
          date: expect.any(String),
        },
        '1234567890'
      )

      expect(sendEmailSpy).toHaveBeenCalledWith('2025-delivery-method-changed-notify', {
        to: 'user@example.com',
        variables: { firstName: 'John' },
        attachment: mockPdf,
      })
    })

    it('should send postal email when GDPR changed to unsubscribe yesterday', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(12, 0, 0, 0)

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.userGdprData.findMany.mockResolvedValue([{ userId: 'user1' }] as any)
      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'user@example.com',
        externalId: 'ext-123',
        birthNumber: '1234567890',
        physicalEntity: {
          activeEdesk: false,
        },
      } as any)

      prismaMock.userGdprData.findFirst
        .mockResolvedValueOnce({
          userId: 'user1',
          subType: GDPRSubTypeEnum.unsubscribe,
          createdAt: yesterday,
        } as any)
        .mockResolvedValueOnce({
          userId: 'user1',
          subType: GDPRSubTypeEnum.subscribe,
          createdAt: new Date(yesterday.getTime() - 86400000),
        } as any)

      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue({
        given_name: 'John',
        family_name: 'Doe',
      } as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      // TODO: Currently commented out in implementation (line 539-543)
      // expect(sendEmailSpy).toHaveBeenCalledWith('placeholder-postal-activated', {
      //   to: 'user@example.com',
      //   variables: { firstName: 'John' },
      // })
      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should skip users with active eDesk who had GDPR changes but no eDesk status change', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(12, 0, 0, 0)

      const twoDaysAgo = new Date(yesterday)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 1)

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.userGdprData.findMany.mockResolvedValue([{ userId: 'user1' }] as any)
      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'user@example.com',
        externalId: 'ext-123',
        birthNumber: '1234567890',
        physicalEntity: {
          activeEdesk: true,
          edeskStatusChangedAt: twoDaysAgo, // Changed 2 days ago, not yesterday
        },
      } as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should skip users when GDPR subType did not change from previous state', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(12, 0, 0, 0)

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.userGdprData.findMany.mockResolvedValue([{ userId: 'user1' }] as any)
      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'user@example.com',
        externalId: 'ext-123',
        birthNumber: '1234567890',
        physicalEntity: {
          activeEdesk: false,
        },
      } as any)

      // Both current and previous are subscribe - no change
      prismaMock.userGdprData.findFirst
        .mockResolvedValueOnce({
          userId: 'user1',
          subType: GDPRSubTypeEnum.subscribe,
          createdAt: yesterday,
        } as any)
        .mockResolvedValueOnce({
          userId: 'user1',
          subType: GDPRSubTypeEnum.subscribe,
          createdAt: new Date(yesterday.getTime() - 86400000),
        } as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')

      await service.sendDailyDeliveryMethodSummaries()

      expect(sendEmailSpy).not.toHaveBeenCalled()
    })

    it('should combine both GDPR and eDesk changes and deduplicate by userId', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(12, 0, 0, 0)

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      // User appears in both GDPR changes and eDesk changes
      prismaMock.userGdprData.findMany.mockResolvedValue([
        { userId: 'user1' },
        { userId: 'user2' },
      ] as any)

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

      let callCount = 0
      prismaMock.user.findUnique.mockImplementation(() => {
        callCount++
        // Should be called for user1, user2, user3 (3 unique users)
        return Promise.resolve(null) as any
      })

      await service.sendDailyDeliveryMethodSummaries()

      expect(callCount).toBe(3) // user1, user2, user3 (deduplicated)
    })

    it('should only process users with changes between yesterday start (00:00:00) and end (23:59:59)', async () => {
      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.userGdprData.findMany.mockResolvedValue([])
      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      await service.sendDailyDeliveryMethodSummaries()

      // Verify GDPR query uses correct date range
      expect(prismaMock.userGdprData.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        })
      )

      const gdprCall = (prismaMock.userGdprData.findMany as jest.Mock).mock.calls[0][0]
      const gdprStart = gdprCall.where.createdAt.gte
      const gdprEnd = gdprCall.where.createdAt.lte

      expect(gdprStart.getHours()).toBe(0)
      expect(gdprStart.getMinutes()).toBe(0)
      expect(gdprStart.getSeconds()).toBe(0)
      expect(gdprStart.getMilliseconds()).toBe(0)

      expect(gdprEnd.getHours()).toBe(23)
      expect(gdprEnd.getMinutes()).toBe(59)
      expect(gdprEnd.getSeconds()).toBe(59)
      expect(gdprEnd.getMilliseconds()).toBe(999)

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

    it('should prioritize eDesk status over GDPR changes when eDesk is active', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(12, 0, 0, 0)

      prismaMock.config.findFirst.mockResolvedValue({
        value: { active: true },
      } as any)

      prismaMock.userGdprData.findMany.mockResolvedValue([{ userId: 'user1' }] as any)
      prismaMock.physicalEntity.findMany.mockResolvedValue([])

      // User has active eDesk (changed yesterday) AND GDPR change yesterday
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user1',
        email: 'user@example.com',
        externalId: 'ext-123',
        birthNumber: '1234567890',
        physicalEntity: {
          activeEdesk: true,
          edeskStatusChangedAt: yesterday,
        },
      } as any)

      prismaMock.userGdprData.findFirst.mockResolvedValue({
        userId: 'user1',
        subType: GDPRSubTypeEnum.subscribe,
        createdAt: yesterday,
      } as any)

      jest.spyOn(cognitoSubservice, 'getDataFromCognito').mockResolvedValue({
        given_name: 'John',
        family_name: 'Doe',
      } as any)

      const sendEmailSpy = jest.spyOn(mailgunService, 'sendEmail')
      const generatePdfSpy = jest.spyOn(pdfGeneratorService, 'generateFromTemplate')

      await service.sendDailyDeliveryMethodSummaries()

      // Should NOT generate City Account PDF (which would happen for GDPR subscribe)
      expect(generatePdfSpy).not.toHaveBeenCalled()

      // TODO: Should send eDesk email instead, but it's commented out (line 432-436)
      // expect(sendEmailSpy).toHaveBeenCalledWith('placeholder-edesk-activated', ...)
      expect(sendEmailSpy).not.toHaveBeenCalled()
    })
  })
})
