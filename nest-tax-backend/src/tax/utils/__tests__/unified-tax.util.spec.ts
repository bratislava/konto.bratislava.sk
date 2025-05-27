// noinspection DuplicatedCode

import { TaxDetail, TaxDetailareaType, TaxDetailType } from '@prisma/client'

import {
  QrCodeGeneratorDto,
  QrPaymentNoteEnum,
} from '../../../utils/subservices/dtos/qrcode.dto'
import {
  InstallmentPaidStatusEnum,
  OneTimePaymentTypeEnum,
  ResponseActiveInstallmentDto,
  ResponseInstallmentPaymentDetailDto,
  ResponseOneTimePaymentDetailsDto,
  ResponseTaxSummaryDetailDto,
} from '../../dtos/response.tax.dto'
import { getTaxDetailPure } from '../unified-tax.util'

type InputGetTaxDetailPureType = {
  overallPaid: number
  taxYear: number
  today: Date
  overallAmount: number
  payment_calendar_threshold: number
  variableSymbol: string
  dateOfValidity: Date | null
  installments: { order: string | null; amount: number }[]
  taxDetail: TaxDetail[]
  taxConstructions: number
  taxFlat: number
  taxLand: number
}

const defaultInput: InputGetTaxDetailPureType = {
  overallPaid: 0,
  taxYear: 2025,
  today: new Date('2025-01-01'),
  overallAmount: 6600,
  payment_calendar_threshold: 6600,
  variableSymbol: '1234567890',
  dateOfValidity: new Date('2025-01-01'),
  installments: [
    { order: '1', amount: 2200 },
    { order: '2', amount: 2200 },
    { order: '3', amount: 2200 },
  ],
  taxDetail: [
    {
      id: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
      taxId: 1234,
      type: TaxDetailType.APARTMENT,
      areaType: TaxDetailareaType.byt,
      area: null,
      base: 123,
      amount: 123,
    },
    {
      id: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
      taxId: 1234,
      type: TaxDetailType.APARTMENT,
      areaType: TaxDetailareaType.byt,
      area: null,
      base: 123,
      amount: 123,
    },
    {
      id: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
      taxId: 1234,
      type: TaxDetailType.APARTMENT,
      areaType: TaxDetailareaType.nebyt,
      area: null,
      base: 123,
      amount: 123,
    },
    {
      id: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
      taxId: 1234,
      type: TaxDetailType.CONSTRUCTION,
      areaType: TaxDetailareaType.RESIDENTIAL,
      area: null,
      base: 123,
      amount: 123,
    },
    {
      id: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
      taxId: 1234,
      type: TaxDetailType.CONSTRUCTION,
      areaType: TaxDetailareaType.RESIDENTIAL,
      area: null,
      base: 123,
      amount: 123,
    },
    {
      id: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
      taxId: 1234,
      type: TaxDetailType.CONSTRUCTION,
      areaType: TaxDetailareaType.NONRESIDENTIAL,
      area: null,
      base: 123,
      amount: 123,
    },
    {
      id: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
      taxId: 1234,
      type: TaxDetailType.GROUND,
      areaType: TaxDetailareaType.A,
      area: '123',
      base: 123,
      amount: 123,
    },
    {
      id: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
      taxId: 1234,
      type: TaxDetailType.GROUND,
      areaType: TaxDetailareaType.A,
      area: '123',
      base: 123,
      amount: 123,
    },
  ],
  taxFlat: 369,
  taxLand: 246,
  taxConstructions: 369,
}

type ReplaceQrCodeWithGeneratorDto<T extends object> = {
  [K in keyof T]: K extends 'qrCode' ? QrCodeGeneratorDto : T[K]
}

const defaultOutput: Omit<
  ResponseTaxSummaryDetailDto,
  'oneTimePayment' | 'installmentPayment' | 'taxEmployee'
> & {
  oneTimePayment: ReplaceQrCodeWithGeneratorDto<ResponseOneTimePaymentDetailsDto>
  installmentPayment: Omit<
    ResponseInstallmentPaymentDetailDto,
    'activeInstallment'
  > & {
    activeInstallment?: ReplaceQrCodeWithGeneratorDto<ResponseActiveInstallmentDto>
  }
} = {
  overallPaid: 0,
  overallBalance: 6600,
  overallAmount: 6600,
  oneTimePayment: {
    isPossible: true,
    type: 'ONE_TIME_PAYMENT' as OneTimePaymentTypeEnum,
    amount: 6600,
    dueDate: new Date('2025-01-21T23:00:00.000Z'),
    qrCode: {
      amount: 6600,
      variableSymbol: '1234567890',
      specificSymbol: '2025200000',
      paymentNote: 'QR_oneTimePay' as QrPaymentNoteEnum,
    },
    variableSymbol: '1234567890',
  },
  installmentPayment: {
    isPossible: true,
    installments: [
      {
        installmentNumber: 1,
        dueDate: new Date('2025-01-21T23:00:00.000Z'),
        status: 'NOT_PAID' as InstallmentPaidStatusEnum,
        remainingAmount: 2200,
      },
      {
        installmentNumber: 2,
        dueDate: new Date('2025-08-31T22:00:00.000Z'),
        status: 'NOT_PAID' as InstallmentPaidStatusEnum,
        remainingAmount: 2200,
      },
      {
        installmentNumber: 3,
        dueDate: new Date('2025-10-31T23:00:00.000Z'),
        status: 'NOT_PAID' as InstallmentPaidStatusEnum,
        remainingAmount: 2200,
      },
    ],
    activeInstallment: {
      remainingAmount: 2200,
      variableSymbol: '1234567890',
      qrCode: {
        amount: 2200,
        variableSymbol: '1234567890',
        specificSymbol: '2025200000',
        paymentNote: 'QR_firstInstallment' as QrPaymentNoteEnum,
      },
    },
  },
  itemizedDetail: {
    apartmentTotalAmount: 369,
    groundTotalAmount: 246,
    constructionTotalAmount: 369,
    apartmentTaxDetail: [
      {
        type: 'byt',
        base: 123,
        amount: 123,
      },
      {
        type: 'byt',
        base: 123,
        amount: 123,
      },
      {
        type: 'nebyt',
        base: 123,
        amount: 123,
      },
    ],
    groundTaxDetail: [
      {
        type: 'A',
        area: '123',
        base: 123,
        amount: 123,
      },
      {
        type: 'A',
        area: '123',
        base: 123,
        amount: 123,
      },
    ],
    constructionTaxDetail: [
      {
        type: 'RESIDENTIAL',
        base: 123,
        amount: 123,
      },
      {
        type: 'RESIDENTIAL',
        base: 123,
        amount: 123,
      },
      {
        type: 'NONRESIDENTIAL',
        base: 123,
        amount: 123,
      },
    ],
  },
}

describe('UnifiedTaxUtil', () => {
  describe('- calculateUnifiedTax should create tax detail correctly for', () => {
    describe('value = ', () => {
      it('unpaid', () => {
        const output = getTaxDetailPure(
          defaultInput.overallPaid,
          defaultInput.taxYear,
          defaultInput.today,
          defaultInput.overallAmount,
          defaultInput.payment_calendar_threshold,
          defaultInput.variableSymbol,
          defaultInput.dateOfValidity,
          defaultInput.installments,
          defaultInput.taxDetail,
          defaultInput.taxConstructions,
          defaultInput.taxFlat,
          defaultInput.taxLand,
        )

        expect(output).toEqual(defaultOutput)
      })

      it('partial first', () => {
        const output = getTaxDetailPure(
          1,
          defaultInput.taxYear,
          defaultInput.today,
          defaultInput.overallAmount,
          defaultInput.payment_calendar_threshold,
          defaultInput.variableSymbol,
          defaultInput.dateOfValidity,
          defaultInput.installments,
          defaultInput.taxDetail,
          defaultInput.taxConstructions,
          defaultInput.taxFlat,
          defaultInput.taxLand,
        )

        // console.log(JSON.stringify(output, null, 2))

        expect(output.overallPaid).toBe(1)
        expect(output.installmentPayment.isPossible).toBe(true)
        expect(output.installmentPayment.installments).toBeDefined()
        expect(output.installmentPayment.installments![0].remainingAmount).toBe(
          2199,
        )
        expect(output.installmentPayment.installments![0].status).toBe(
          'PARTIALLY_PAID',
        )
        expect(output.installmentPayment.installments![1].status).toBe(
          'NOT_PAID',
        )
        expect(output.installmentPayment.installments![2].status).toBe(
          'NOT_PAID',
        )
      })

      it('full first', () => {
        const output = getTaxDetailPure(
          2200,
          defaultInput.taxYear,
          defaultInput.today,
          defaultInput.overallAmount,
          defaultInput.payment_calendar_threshold,
          defaultInput.variableSymbol,
          defaultInput.dateOfValidity,
          defaultInput.installments,
          defaultInput.taxDetail,
          defaultInput.taxConstructions,
          defaultInput.taxFlat,
          defaultInput.taxLand,
        )

        // console.log(JSON.stringify(output, null, 2))

        expect(output.installmentPayment.installments![0].remainingAmount).toBe(
          0,
        )
        expect(output.installmentPayment.installments![0].status).toBe('PAID')
        expect(output.installmentPayment.installments![1].remainingAmount).toBe(
          2200,
        )
        expect(output.installmentPayment.installments![1].status).toBe(
          'NOT_PAID',
        )
      })

      it('partial second', () => {
        const output = getTaxDetailPure(
          2201,
          defaultInput.taxYear,
          defaultInput.today,
          defaultInput.overallAmount,
          defaultInput.payment_calendar_threshold,
          defaultInput.variableSymbol,
          defaultInput.dateOfValidity,
          defaultInput.installments,
          defaultInput.taxDetail,
          defaultInput.taxConstructions,
          defaultInput.taxFlat,
          defaultInput.taxLand,
        )
        expect(output.installmentPayment.installments![0].remainingAmount).toBe(
          0,
        )
        expect(output.installmentPayment.installments![0].status).toBe('PAID')
        expect(output.installmentPayment.installments![1].remainingAmount).toBe(
          2199,
        )
        expect(output.installmentPayment.installments![1].status).toBe(
          'PARTIALLY_PAID',
        )
        expect(output.installmentPayment.installments![2].status).toBe(
          'NOT_PAID',
        )
      })

      it('full second', () => {
        const output = getTaxDetailPure(
          4400,
          defaultInput.taxYear,
          defaultInput.today,
          defaultInput.overallAmount,
          defaultInput.payment_calendar_threshold,
          defaultInput.variableSymbol,
          defaultInput.dateOfValidity,
          defaultInput.installments,
          defaultInput.taxDetail,
          defaultInput.taxConstructions,
          defaultInput.taxFlat,
          defaultInput.taxLand,
        )

        expect(output.installmentPayment.installments![0].remainingAmount).toBe(
          0,
        )
        expect(output.installmentPayment.installments![0].status).toBe('PAID')
        expect(output.installmentPayment.installments![1].remainingAmount).toBe(
          0,
        )
        expect(output.installmentPayment.installments![1].status).toBe('PAID')
      })

      it('fully paid', () => {
        const output = getTaxDetailPure(
          6600,
          defaultInput.taxYear,
          defaultInput.today,
          defaultInput.overallAmount,
          defaultInput.payment_calendar_threshold,
          defaultInput.variableSymbol,
          defaultInput.dateOfValidity,
          defaultInput.installments,
          defaultInput.taxDetail,
          defaultInput.taxConstructions,
          defaultInput.taxFlat,
          defaultInput.taxLand,
        )

        expect(output.installmentPayment.isPossible).toBe(false)
        expect(output.installmentPayment.installments).toBeUndefined()
        expect(output.installmentPayment.activeInstallment).toBeUndefined()
        expect(output.installmentPayment.reasonNotPossible).toBe('ALREADY_PAID')
      })
    })

    describe('date', () => {
      it('at first payment due threshold', () => {
        const output = getTaxDetailPure(
          0,
          defaultInput.taxYear,
          new Date('2025-01-21 21:00'),
          defaultInput.overallAmount,
          defaultInput.payment_calendar_threshold,
          defaultInput.variableSymbol,
          defaultInput.dateOfValidity,
          defaultInput.installments,
          defaultInput.taxDetail,
          defaultInput.taxConstructions,
          defaultInput.taxFlat,
          defaultInput.taxLand,
        )

        expect(output).toEqual(defaultOutput)
      })

      it('after first payment due threshold', () => {
        const output = getTaxDetailPure(
          0,
          defaultInput.taxYear,
          new Date('2025-01-22'),
          defaultInput.overallAmount,
          defaultInput.payment_calendar_threshold,
          defaultInput.variableSymbol,
          defaultInput.dateOfValidity,
          defaultInput.installments,
          defaultInput.taxDetail,
          defaultInput.taxConstructions,
          defaultInput.taxFlat,
          defaultInput.taxLand,
        )

        expect(output.installmentPayment.isPossible).toBe(true)
        expect(output.installmentPayment.activeInstallment).toEqual({
          remainingAmount: 4400,
          variableSymbol: '1234567890',
          qrCode: {
            amount: 4400,
            variableSymbol: '1234567890',
            specificSymbol: '2025200000',
            // eslint-disable-next-line no-secrets/no-secrets
            paymentNote: 'QR_firstSecondInstallment',
          },
        })
        expect(output.installmentPayment.installments).toEqual([
          {
            installmentNumber: 1,
            dueDate: new Date('2025-01-21T23:00:00.000Z'),
            status: 'AFTER_DUE_DATE' as InstallmentPaidStatusEnum,
            remainingAmount: 0,
          },
          {
            installmentNumber: 2,
            dueDate: new Date('2025-08-31T22:00:00.000Z'),
            status: 'NOT_PAID' as InstallmentPaidStatusEnum,
            remainingAmount: 4400,
          },
          {
            installmentNumber: 3,
            dueDate: new Date('2025-10-31T23:00:00.000Z'),
            status: 'NOT_PAID' as InstallmentPaidStatusEnum,
            remainingAmount: 2200,
          },
        ])
      })

      it('after first payment due threshold with partial first payment', () => {
        const output = getTaxDetailPure(
          1,
          defaultInput.taxYear,
          new Date('2025-01-22'),
          defaultInput.overallAmount,
          defaultInput.payment_calendar_threshold,
          defaultInput.variableSymbol,
          defaultInput.dateOfValidity,
          defaultInput.installments,
          defaultInput.taxDetail,
          defaultInput.taxConstructions,
          defaultInput.taxFlat,
          defaultInput.taxLand,
        )

        expect(output.installmentPayment.isPossible).toBe(true)
        expect(output.installmentPayment.activeInstallment).toEqual({
          remainingAmount: 4399,
          variableSymbol: '1234567890',
          qrCode: {
            amount: 4399,
            variableSymbol: '1234567890',
            specificSymbol: '2025200000',
            // eslint-disable-next-line no-secrets/no-secrets
            paymentNote: 'QR_firstSecondInstallment',
          },
        })
        expect(output.installmentPayment.installments).toEqual([
          {
            installmentNumber: 1,
            dueDate: new Date('2025-01-21T23:00:00.000Z'),
            status: 'AFTER_DUE_DATE' as InstallmentPaidStatusEnum,
            remainingAmount: 0,
          },
          {
            installmentNumber: 2,
            dueDate: new Date('2025-08-31T22:00:00.000Z'),
            status: 'PARTIALLY_PAID' as InstallmentPaidStatusEnum,
            remainingAmount: 4399,
          },
          {
            installmentNumber: 3,
            dueDate: new Date('2025-10-31T23:00:00.000Z'),
            status: 'NOT_PAID' as InstallmentPaidStatusEnum,
            remainingAmount: 2200,
          },
        ])
      })

      it('at second payment due threshold', () => {
        const output = getTaxDetailPure(
          0,
          defaultInput.taxYear,
          new Date('2025-08-31'),
          defaultInput.overallAmount,
          defaultInput.payment_calendar_threshold,
          defaultInput.variableSymbol,
          defaultInput.dateOfValidity,
          defaultInput.installments,
          defaultInput.taxDetail,
          defaultInput.taxConstructions,
          defaultInput.taxFlat,
          defaultInput.taxLand,
        )

        expect(output.installmentPayment.isPossible).toBe(true)
        expect(output.installmentPayment.activeInstallment).toEqual({
          remainingAmount: 4400,
          variableSymbol: '1234567890',
          qrCode: {
            amount: 4400,
            variableSymbol: '1234567890',
            specificSymbol: '2025200000',
            // eslint-disable-next-line no-secrets/no-secrets
            paymentNote: 'QR_firstSecondInstallment',
          },
        })
        expect(output.installmentPayment.installments).toEqual([
          {
            installmentNumber: 1,
            dueDate: new Date('2025-01-21T23:00:00.000Z'),
            status: 'AFTER_DUE_DATE' as InstallmentPaidStatusEnum,
            remainingAmount: 0,
          },
          {
            installmentNumber: 2,
            dueDate: new Date('2025-08-31T22:00:00.000Z'),
            status: 'NOT_PAID' as InstallmentPaidStatusEnum,
            remainingAmount: 4400,
          },
          {
            installmentNumber: 3,
            dueDate: new Date('2025-10-31T23:00:00.000Z'),
            status: 'NOT_PAID' as InstallmentPaidStatusEnum,
            remainingAmount: 2200,
          },
        ])
      })

      it('after second payment due threshold', () => {
        const output = getTaxDetailPure(
          0,
          defaultInput.taxYear,
          new Date('2025-09-01'),
          defaultInput.overallAmount,
          defaultInput.payment_calendar_threshold,
          defaultInput.variableSymbol,
          defaultInput.dateOfValidity,
          defaultInput.installments,
          defaultInput.taxDetail,
          defaultInput.taxConstructions,
          defaultInput.taxFlat,
          defaultInput.taxLand,
        )

        expect(output.installmentPayment.isPossible).toBe(false)
        expect(output.installmentPayment.reasonNotPossible).toBe(
          'AFTER_DUE_DATE',
        )
        expect(output.installmentPayment.installments).toBeUndefined()
        expect(output.installmentPayment.activeInstallment).toBeUndefined()
      })
    })

    it('undefined dateOfValidity', () => {
      const output = getTaxDetailPure(
        defaultInput.overallPaid,
        defaultInput.taxYear,
        defaultInput.today,
        defaultInput.overallAmount,
        defaultInput.payment_calendar_threshold,
        defaultInput.variableSymbol,
        null,
        defaultInput.installments,
        defaultInput.taxDetail,
        defaultInput.taxConstructions,
        defaultInput.taxFlat,
        defaultInput.taxLand,
      )

      expect(output.installmentPayment.isPossible).toBe(true)
      expect(output.installmentPayment.installments![0]).toEqual({
        installmentNumber: 1,
        status: 'NOT_PAID' as InstallmentPaidStatusEnum,
        remainingAmount: 2200,
      })
      expect(output.installmentPayment.installments![1]).toEqual({
        installmentNumber: 2,
        dueDate: new Date('2025-08-31T22:00:00.000Z'),
        status: 'NOT_PAID' as InstallmentPaidStatusEnum,
        remainingAmount: 2200,
      })
      expect(output.installmentPayment.activeInstallment?.qrCode).toEqual({
        amount: 2200,
        variableSymbol: defaultInput.variableSymbol,
        specificSymbol: '2025200000',
        paymentNote: 'QR_firstInstallment',
      })
    })
  })
})
