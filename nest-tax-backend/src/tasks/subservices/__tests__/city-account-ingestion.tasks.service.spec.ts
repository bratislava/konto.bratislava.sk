import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { Test, TestingModule } from '@nestjs/testing'

import prismaMock from '../../../../test/singleton'
import { createTestTaxPayer } from '../../../__tests__/factories/taxPayer.factory'
import { createTestUserDataFromCityAccount } from '../../../__tests__/factories/userDataFromCityAccount.factory'
import { expectObjectContaining } from '../../../__tests__/jest-matchers'
import { PrismaService } from '../../../prisma/prisma.service'
import { CityAccountSubservice } from '../../../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../../../utils/subservices/database.subservice'
import CityAccountIngestionTasksService from '../city-account-ingestion.tasks.service'

describe('CityAccountIngestionTasksService', () => {
  let service: CityAccountIngestionTasksService
  let cityAccountSubservice: jest.Mocked<CityAccountSubservice>

  const missingSince = new Date('2027-01-15T10:00:00.000Z')

  const makeTaxPayers = (birthNumbers: string[], firstId = 1) =>
    birthNumbers.map((birthNumber, index) =>
      createTestTaxPayer({
        id: firstId + index,
        birthNumber,
        cityAccountUserMissingSince: missingSince,
      }),
    )

  const makeUserData = (birthNumbers: string[]) =>
    Object.fromEntries(
      birthNumbers.map((birthNumber) => [
        birthNumber,
        createTestUserDataFromCityAccount({ birthNumber }),
      ]),
    )

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityAccountIngestionTasksService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ErrorFactoryService, useValue: {} },
        { provide: DatabaseSubservice, useValue: {} },
        {
          provide: CityAccountSubservice,
          useValue: { getUserDataAdminBatch: jest.fn() },
        },
        {
          provide: LineLoggerService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile()

    service = module.get(CityAccountIngestionTasksService)
    cityAccountSubservice = module.get(CityAccountSubservice)

    prismaMock.taxPayer.updateMany.mockResolvedValue({ count: 0 })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('recheckCityAccountUserMissing', () => {
    it('should unmark only tax payers whose user is back in city account', async () => {
      prismaMock.taxPayer.findMany.mockResolvedValueOnce(
        makeTaxPayers(['111111/1111', '222222/2222', '333333/3333']),
      )
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue(
        makeUserData(['222222/2222']),
      )

      await service.recheckCityAccountUserMissing()

      expect(prismaMock.taxPayer.findMany).toHaveBeenCalledWith(
        expectObjectContaining({
          where: {
            cityAccountUserMissingSince: { not: null },
            id: { gt: 0 },
          },
        }),
      )
      expect(cityAccountSubservice.getUserDataAdminBatch).toHaveBeenCalledWith([
        '111111/1111',
        '222222/2222',
        '333333/3333',
      ])
      expect(prismaMock.taxPayer.updateMany).toHaveBeenCalledTimes(1)
      expect(prismaMock.taxPayer.updateMany).toHaveBeenCalledWith(
        expectObjectContaining({
          where: expectObjectContaining({
            birthNumber: { in: ['222222/2222'] },
          }),
          data: { cityAccountUserMissingSince: null },
        }),
      )
    })

    it('should not unmark when no user is back in city account', async () => {
      prismaMock.taxPayer.findMany.mockResolvedValueOnce(
        makeTaxPayers(['111111/1111']),
      )
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue({})

      await service.recheckCityAccountUserMissing()

      expect(prismaMock.taxPayer.updateMany).not.toHaveBeenCalled()
    })

    it('should not call city account when no tax payer is marked', async () => {
      prismaMock.taxPayer.findMany.mockResolvedValueOnce([])

      await service.recheckCityAccountUserMissing()

      expect(cityAccountSubservice.getUserDataAdminBatch).not.toHaveBeenCalled()
      expect(prismaMock.taxPayer.updateMany).not.toHaveBeenCalled()
    })

    it('should go through all marked tax payers in batches', async () => {
      const fullBatch = makeTaxPayers(
        Array.from({ length: 100 }, (_, index) => `${100000 + index}/0000`),
      )
      const lastBatch = makeTaxPayers(['999999/9999'], 101)
      prismaMock.taxPayer.findMany
        .mockResolvedValueOnce(fullBatch)
        .mockResolvedValueOnce(lastBatch)
      cityAccountSubservice.getUserDataAdminBatch.mockResolvedValue(
        makeUserData(['999999/9999']),
      )

      await service.recheckCityAccountUserMissing()

      expect(prismaMock.taxPayer.findMany).toHaveBeenCalledTimes(2)
      expect(prismaMock.taxPayer.findMany).toHaveBeenNthCalledWith(
        2,
        expectObjectContaining({
          where: {
            cityAccountUserMissingSince: { not: null },
            id: { gt: 100 },
          },
        }),
      )
      expect(cityAccountSubservice.getUserDataAdminBatch).toHaveBeenCalledTimes(
        2,
      )
      expect(prismaMock.taxPayer.updateMany).toHaveBeenCalledTimes(1)
      expect(prismaMock.taxPayer.updateMany).toHaveBeenCalledWith(
        expectObjectContaining({
          where: expectObjectContaining({
            birthNumber: { in: ['999999/9999'] },
          }),
          data: { cityAccountUserMissingSince: null },
        }),
      )
    })
  })
})
