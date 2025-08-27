import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { DeliveryMethodEnum, GDPRSubTypeEnum, Prisma, User } from '@prisma/client'
import prismaMock from '../../../test/singleton'
import { AdminApi } from 'openapi-clients/tax'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { DeliveryMethodNoris } from '../../utils/types/tax.types'
import { TasksService } from '../tasks.service'
import { TaxSubservice } from '../../utils/subservices/tax.subservice'
import { PhysicalEntityService } from '../../physical-entity/physical-entity.service'

jest.mock('../../utils/decorators/errorHandler.decorators', () => {
  return jest.fn(() => (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: undefined[]) {
      try {
        const result = await originalMethod.apply(this, args)
        return result
      } catch (error) {}
      return null
    }
    return descriptor
  })
})

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    physicalEntity: true
    userGdprData: true
  }
}>

describe('TasksService', () => {
  let service: TasksService

  let throwerErrorGuard: ThrowerErrorGuard

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TaxSubservice, useValue: createMock<TaxSubservice>() },
        { provide: PhysicalEntityService, useValue: createMock<PhysicalEntityService>() },
        ThrowerErrorGuard,
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)
    Object.defineProperty(service, 'taxBackendAdminApi', { value: createMock<AdminApi>() }) // It is not injected so has to be set this way
  })

  describe('updateDeliveryMethodsInNoris', () => {
    it('should call the endpoint with the correct data', async () => {
      const adminApiUpdateSpy = jest.spyOn(service['taxSubservice'], 'updateDeliveryMethodsInNoris')
      const internalErrorSpy = jest.spyOn(throwerErrorGuard, 'InternalServerErrorException')
      const prismaUserUpdateSpy = jest.spyOn(prismaMock.user, 'updateMany')

      prismaMock.user.findMany
        .mockResolvedValueOnce([
          {
            birthNumber: '1234562020',
            id: '1',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK
          },
          {
            birthNumber: '1234564848',
            id: '2',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL
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
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK
          },
          {
            birthNumber: '1234564646',
            id: '6',
            taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL
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
        where: { id: { in: ['1', '2', '3', '4', '5', '6', '7', '8'] } },
        data: { lastTaxDeliveryMethodsUpdateYear: new Date().getFullYear() },
      })
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
      const adminApiUpdateSpy = jest.spyOn(service['taxSubservice'], 'updateDeliveryMethodsInNoris')
      const internalErrorSpy = jest.spyOn(throwerErrorGuard, 'InternalServerErrorException')
      const prismaUserUpdateSpy = jest.spyOn(prismaMock.user, 'update')

      prismaMock.user.findMany
        .mockResolvedValueOnce([
          {
            birthNumber: '1234562020',
            id: '1',
            physicalEntity: {
              activeEdesk: true,
            },
            userGdprData: [
              {
                subType: GDPRSubTypeEnum.subscribe,
                createdAt: new Date('2023-01-03'),
              },
            ],
          },
        ] as unknown as UserWithRelations[])
        .mockResolvedValueOnce([
          {
            id: '1',
          },
        ] as User[])

      await service.updateDeliveryMethodsInNoris()

      expect(internalErrorSpy).toHaveBeenCalled()
      expect(adminApiUpdateSpy).toHaveBeenCalled()
      expect(prismaUserUpdateSpy).not.toHaveBeenCalled()
    })
  })
})
