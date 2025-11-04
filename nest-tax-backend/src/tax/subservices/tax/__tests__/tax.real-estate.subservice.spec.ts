import { todo } from 'node:test'

import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus, TaxPayer, TaxType } from '@prisma/client'

import prismaMock from '../../../../../test/singleton'
import { PrismaService } from '../../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../../../utils/guards/errors.guard'
import { QrCodeSubservice } from '../../../../utils/subservices/qrcode.subservice'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../../../dtos/error.dto'
import { TaxRealEstateSubservice } from '../tax.real-estate.subservice'

describe('TaxRealEstateSubservice', () => {
  let service: TaxRealEstateSubservice
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxRealEstateSubservice,
        { provide: PrismaService, useValue: prismaMock },
        ThrowerErrorGuard,
        { provide: QrCodeSubservice, useValue: createMock<QrCodeSubservice>() },
      ],
    }).compile()

    service = module.get<TaxRealEstateSubservice>(TaxRealEstateSubservice)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('fetchTaxData', () => {
    const mockTaxData = {
      id: 1,
      uuid: 'tax-uuid',
      year: 2023,
      amount: 1000,
      variableSymbol: 'VS123',
      dateTaxRuling: new Date('2023-01-01'),
      taxConstructions: 0,
      taxFlat: 0,
      taxLand: 0,
      taxInstallments: [
        {
          id: 1,
          installmentNumber: 1,
          amount: 500,
          dueDate: new Date('2023-06-01'),
          text: 'First installment',
          order: 1,
        },
        {
          id: 2,
          installmentNumber: 2,
          amount: 500,
          dueDate: new Date('2023-09-01'),
          text: 'Second installment',
          order: 2,
        },
      ],
      taxPayer: {
        id: 1,
        birthNumber: '123456/789',
        taxAdministrator: {
          id: 1,
          name: 'Test Administrator',
          email: 'admin@test.sk',
        },
      },
      taxDetails: [
        {
          id: 1,
          type: 'LAND',
          amount: 500,
        },
      ],
      taxPayments: [
        {
          id: 1,
          amount: 200,
          status: PaymentStatus.SUCCESS,
          createdAt: new Date('2023-05-01'),
        },
      ],
    }

    it('should fetch tax data successfully', async () => {
      prismaMock.taxPayer.findUnique.mockResolvedValue({
        id: 1,
      } as TaxPayer)
      prismaMock.tax.findUnique.mockResolvedValue(mockTaxData as any)

      const result = await service['fetchTaxData'](
        { birthNumber: '123456/789' },
        { taxInstallments: true },
        2023,
        TaxType.DZN,
        1,
      )

      expect(prismaMock.tax.findUnique).toHaveBeenCalledWith({
        where: {
          taxPayerId_year_type_order: {
            year: 2023,
            taxPayerId: 1,
            type: TaxType.DZN,
            order: 1,
          },
        },
        include: {
          taxInstallments: true,
        },
      })
      expect(result).toEqual(mockTaxData)
    })

    it('should throw error when tax not found', async () => {
      prismaMock.taxPayer.findUnique.mockResolvedValue({
        id: 1,
      } as TaxPayer)
      prismaMock.tax.findUnique.mockResolvedValue(null)
      const notFoundExceptionSpy = jest.spyOn(
        service['throwerErrorGuard'],
        'NotFoundException',
      )
      await expect(
        service['fetchTaxData'](
          { birthNumber: '123456/789' },
          {},
          2023,
          TaxType.DZN,
          1,
        ),
      ).rejects.toThrow()

      expect(notFoundExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
      )
    })

    todo('test also other types of taxes')
  })
})
