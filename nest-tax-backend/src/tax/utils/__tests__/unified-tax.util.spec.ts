/* eslint-disable no-param-reassign */

import { PaymentStatus, TaxDetailareaType, TaxDetailType } from '@prisma/client'

import { QrPaymentNoteEnum } from '../../../utils/subservices/dtos/qrcode.dto'
import {
  InstallmentPaidStatusEnum,
  InstallmentPaymentReasonNotPossibleEnum,
  OneTimePaymentReasonNotPossibleEnum,
  OneTimePaymentTypeEnum,
} from '../../dtos/response.tax.dto'
import { getTaxDetailPure } from '../unified-tax.util'

const defaultInput = {
  taxYear: 2025,
  today: new Date('2025-01-01'),
  overallAmount: 6600,
  paymentCalendarThreshold: 6600,
  variableSymbol: '1234567890',
  dateOfValidity: new Date('2025-01-01'),
  installments: [
    { order: '1', amount: 2200 },
    { order: '2', amount: 2200 },
    { order: '3', amount: 2200 },
  ],
  taxDetails: [
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
  specificSymbol: '2025200000',
  taxPayments: [{ amount: 123, status: PaymentStatus.NEW }],
}

const defaultOutput: ReturnType<typeof getTaxDetailPure> = {
  overallPaid: 0,
  overallBalance: 6600,
  overallAmount: 6600,
  oneTimePayment: {
    isPossible: true,
    type: OneTimePaymentTypeEnum.ONE_TIME_PAYMENT,
    amount: 6600,
    dueDate: new Date('2025-01-21T23:00:00.000Z'),
    qrCode: {
      amount: 6600,
      variableSymbol: '1234567890',
      specificSymbol: '2025200000',
      paymentNote: QrPaymentNoteEnum.QR_oneTimePay,
    },
    variableSymbol: '1234567890',
  },
  installmentPayment: {
    isPossible: true,
    installments: [
      {
        installmentNumber: 1,
        dueDate: new Date('2025-01-21T23:00:00.000Z'),
        status: InstallmentPaidStatusEnum.NOT_PAID,
        remainingAmount: 2200,
      },
      {
        installmentNumber: 2,
        dueDate: new Date('2025-08-31T22:00:00.000Z'),
        status: InstallmentPaidStatusEnum.NOT_PAID,
        remainingAmount: 2200,
      },
      {
        installmentNumber: 3,
        dueDate: new Date('2025-10-31T23:00:00.000Z'),
        status: InstallmentPaidStatusEnum.NOT_PAID,
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
        paymentNote: QrPaymentNoteEnum.QR_firstInstallment,
      },
    },
  },
  itemizedDetail: {
    apartmentTotalAmount: 369,
    groundTotalAmount: 246,
    constructionTotalAmount: 369,
    apartmentTaxDetail: [
      {
        type: TaxDetailareaType.byt,
        base: 123,
        amount: 123,
      },
      {
        type: TaxDetailareaType.byt,
        base: 123,
        amount: 123,
      },
      {
        type: TaxDetailareaType.nebyt,
        base: 123,
        amount: 123,
      },
    ],
    groundTaxDetail: [
      {
        type: TaxDetailareaType.A,
        area: '123',
        base: 123,
        amount: 123,
      },
      {
        type: TaxDetailareaType.A,
        area: '123',
        base: 123,
        amount: 123,
      },
    ],
    constructionTaxDetail: [
      {
        type: TaxDetailareaType.RESIDENTIAL,
        base: 123,
        amount: 123,
      },
      {
        type: TaxDetailareaType.RESIDENTIAL,
        base: 123,
        amount: 123,
      },
      {
        type: TaxDetailareaType.NONRESIDENTIAL,
        base: 123,
        amount: 123,
      },
    ],
  },
}

function createExpectedOutput(modifier: (draft: typeof defaultOutput) => void) {
  const draft = structuredClone(defaultOutput)
  modifier(draft)
  return draft
}

function expectEqualAsJsonStringsWithDates(
  received: ReturnType<typeof getTaxDetailPure>,
  expected: ReturnType<typeof getTaxDetailPure>,
) {
  const stringifiedOutput = JSON.stringify(received, undefined, 2)
  const stringifiedExpected = JSON.stringify(expected, undefined, 2)

  expect(stringifiedOutput).toEqual(stringifiedExpected)
}

describe('UnifiedTaxUtil', () => {
  describe('- calculateUnifiedTax should create tax detail correctly for', () => {
    describe('value = ', () => {
      it('unpaid', () => {
        const output = getTaxDetailPure(defaultInput)

        expect(output).toStrictEqual(defaultOutput)
      })

      it('partial first', () => {
        const output = getTaxDetailPure({
          ...defaultInput,
          taxPayments: [{ amount: 1, status: PaymentStatus.SUCCESS }],
        })

        const expected = createExpectedOutput((draft) => {
          const newOverallBalance = 6599
          draft.overallPaid = 1
          draft.overallBalance = newOverallBalance
          draft.installmentPayment.installments![0].remainingAmount = 2199
          draft.installmentPayment.installments![0].status =
            InstallmentPaidStatusEnum.PARTIALLY_PAID
          draft.installmentPayment.activeInstallment!.remainingAmount = 2199
          draft.installmentPayment.activeInstallment!.qrCode.amount = 2199
          draft.oneTimePayment.amount = newOverallBalance
          draft.oneTimePayment.type =
            OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
          draft.oneTimePayment.qrCode!.amount = newOverallBalance
          draft.oneTimePayment.qrCode!.paymentNote =
            QrPaymentNoteEnum.QR_remainingAmount
        })

        expectEqualAsJsonStringsWithDates(output, expected)
      })

      it('full first', () => {
        const output = getTaxDetailPure({
          ...defaultInput,
          taxPayments: [{ amount: 2200, status: PaymentStatus.SUCCESS }],
        })

        const expected = createExpectedOutput((draft) => {
          const newOverallBalance = 4400
          draft.overallPaid = 2200
          draft.overallBalance = newOverallBalance
          draft.installmentPayment.installments![0].remainingAmount = 0
          draft.installmentPayment.installments![0].status =
            InstallmentPaidStatusEnum.PAID
          draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
            QrPaymentNoteEnum.QR_secondInstallment
          draft.oneTimePayment.amount = newOverallBalance
          draft.oneTimePayment.type =
            OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
          draft.oneTimePayment.qrCode!.amount = newOverallBalance
          draft.oneTimePayment.qrCode!.paymentNote =
            QrPaymentNoteEnum.QR_remainingAmount
        })

        expectEqualAsJsonStringsWithDates(output, expected)
      })

      it('partial second', () => {
        const output = getTaxDetailPure({
          ...defaultInput,
          taxPayments: [{ amount: 2201, status: PaymentStatus.SUCCESS }],
        })

        const expected = createExpectedOutput((draft) => {
          const newOverallBalance = 4399
          draft.overallPaid = 2201
          draft.overallBalance = newOverallBalance
          draft.installmentPayment.installments![0].remainingAmount = 0
          draft.installmentPayment.installments![1].remainingAmount = 2199
          draft.installmentPayment.installments![0].status =
            InstallmentPaidStatusEnum.PAID
          draft.installmentPayment.installments![1].status =
            InstallmentPaidStatusEnum.PARTIALLY_PAID
          draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
            QrPaymentNoteEnum.QR_secondInstallment
          draft.installmentPayment.activeInstallment!.qrCode.amount = 2199
          draft.installmentPayment.activeInstallment!.remainingAmount = 2199
          draft.oneTimePayment.amount = newOverallBalance
          draft.oneTimePayment.type =
            OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
          draft.oneTimePayment.qrCode!.amount = newOverallBalance
          draft.oneTimePayment.qrCode!.paymentNote =
            QrPaymentNoteEnum.QR_remainingAmount
        })

        expectEqualAsJsonStringsWithDates(output, expected)
      })

      it('full second', () => {
        const output = getTaxDetailPure({
          ...defaultInput,
          taxPayments: [{ amount: 4400, status: PaymentStatus.SUCCESS }],
        })

        const expected = createExpectedOutput((draft) => {
          const newOverallBalance = 2200
          draft.overallPaid = 4400
          draft.overallBalance = newOverallBalance
          draft.installmentPayment.installments![0].remainingAmount = 0
          draft.installmentPayment.installments![1].remainingAmount = 0
          draft.installmentPayment.installments![0].status =
            InstallmentPaidStatusEnum.PAID
          draft.installmentPayment.installments![1].status =
            InstallmentPaidStatusEnum.PAID
          draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
            QrPaymentNoteEnum.QR_thirdInstallment
          draft.oneTimePayment.amount = newOverallBalance
          draft.oneTimePayment.type =
            OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
          draft.oneTimePayment.qrCode!.amount = newOverallBalance
          draft.oneTimePayment.qrCode!.paymentNote =
            QrPaymentNoteEnum.QR_remainingAmount
        })

        expectEqualAsJsonStringsWithDates(output, expected)
      })

      it('fully paid', () => {
        const output = getTaxDetailPure({
          ...defaultInput,
          taxPayments: [{ amount: 6600, status: PaymentStatus.SUCCESS }],
        })

        const expected = createExpectedOutput((draft) => {
          draft.overallPaid = 6600
          draft.overallBalance = 0
          draft.installmentPayment = {
            isPossible: false,
            reasonNotPossible:
              InstallmentPaymentReasonNotPossibleEnum.ALREADY_PAID,
          }
          draft.oneTimePayment = {
            isPossible: false,
            reasonNotPossible: OneTimePaymentReasonNotPossibleEnum.ALREADY_PAID,
          }
        })

        expectEqualAsJsonStringsWithDates(output, expected)
      })
    })

    describe('date', () => {
      it('at first payment due threshold', () => {
        const output = getTaxDetailPure({
          ...defaultInput,
          taxPayments: [],
          today: new Date('2025-01-21 21:00'),
        })

        const expected = createExpectedOutput(() => {})

        expectEqualAsJsonStringsWithDates(output, expected)
      })

      describe('after first payment due threshold', () => {
        it('', () => {
          const output = getTaxDetailPure({
            ...defaultInput,
            taxPayments: [],
            today: new Date('2025-01-22'),
          })

          const expected = createExpectedOutput((draft) => {
            draft.installmentPayment.installments![0].status =
              InstallmentPaidStatusEnum.AFTER_DUE_DATE
            draft.installmentPayment.installments![0].remainingAmount = 0
            draft.installmentPayment.installments![1].remainingAmount = 4400
            draft.installmentPayment.activeInstallment!.remainingAmount = 4400
            draft.installmentPayment.activeInstallment!.qrCode.amount = 4400
            draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
              QrPaymentNoteEnum.QR_firstSecondInstallment
          })

          expectEqualAsJsonStringsWithDates(output, expected)
        })

        it('with partial first payment', () => {
          const output = getTaxDetailPure({
            ...defaultInput,
            taxPayments: [{ amount: 1, status: PaymentStatus.SUCCESS }],
            today: new Date('2025-01-22'),
          })

          const expected = createExpectedOutput((draft) => {
            draft.installmentPayment.installments![0].status =
              InstallmentPaidStatusEnum.AFTER_DUE_DATE
            draft.installmentPayment.installments![0].remainingAmount = 0
            draft.installmentPayment.installments![1].remainingAmount = 4399
            draft.installmentPayment.installments![1].status =
              InstallmentPaidStatusEnum.PARTIALLY_PAID
            draft.installmentPayment.activeInstallment!.remainingAmount = 4399
            draft.installmentPayment.activeInstallment!.qrCode.amount = 4399
            draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
              QrPaymentNoteEnum.QR_firstSecondInstallment
            draft.oneTimePayment.type =
              OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
            draft.oneTimePayment.amount = 6599
            draft.oneTimePayment.qrCode!.amount = 6599
            draft.oneTimePayment.qrCode!.paymentNote =
              QrPaymentNoteEnum.QR_remainingAmount
            draft.overallBalance = 6599
            draft.overallPaid = 1
          })

          expectEqualAsJsonStringsWithDates(output, expected)
        })

        it('with full first payment', () => {
          const output = getTaxDetailPure({
            ...defaultInput,
            taxPayments: [{ amount: 2200, status: PaymentStatus.SUCCESS }],
            today: new Date('2025-01-22'),
          })

          const expected = createExpectedOutput((draft) => {
            draft.installmentPayment.installments![0].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.installments![0].remainingAmount = 0
            draft.installmentPayment.installments![1].status =
              InstallmentPaidStatusEnum.NOT_PAID
            draft.installmentPayment.installments![1].remainingAmount = 2200
            draft.installmentPayment.activeInstallment!.remainingAmount = 2200
            draft.installmentPayment.activeInstallment!.qrCode.amount = 2200
            draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
              QrPaymentNoteEnum.QR_secondInstallment
            draft.oneTimePayment.type =
              OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
            draft.oneTimePayment.amount = 4400
            draft.oneTimePayment.qrCode!.amount = 4400
            draft.oneTimePayment.qrCode!.paymentNote =
              QrPaymentNoteEnum.QR_remainingAmount
            draft.overallBalance = 4400
            draft.overallPaid = 2200
          })

          expectEqualAsJsonStringsWithDates(output, expected)
        })

        it('with full second payment', () => {
          const output = getTaxDetailPure({
            ...defaultInput,
            taxPayments: [{ amount: 4400, status: PaymentStatus.SUCCESS }],
            today: new Date('2025-01-22'),
          })

          const expected = createExpectedOutput((draft) => {
            draft.installmentPayment.installments![0].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.installments![0].remainingAmount = 0
            draft.installmentPayment.installments![1].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.installments![1].remainingAmount = 0
            draft.installmentPayment.activeInstallment!.remainingAmount = 2200
            draft.installmentPayment.activeInstallment!.qrCode.amount = 2200
            draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
              QrPaymentNoteEnum.QR_thirdInstallment
            draft.oneTimePayment.type =
              OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
            draft.oneTimePayment.amount = 2200
            draft.oneTimePayment.qrCode!.amount = 2200
            draft.oneTimePayment.qrCode!.paymentNote =
              QrPaymentNoteEnum.QR_remainingAmount
            draft.overallBalance = 2200
            draft.overallPaid = 4400
          })

          expectEqualAsJsonStringsWithDates(output, expected)
        })
      })

      it('at second payment due threshold', () => {
        const output = getTaxDetailPure({
          ...defaultInput,
          taxPayments: [],
          today: new Date('2025-08-31'),
        })

        const expected = createExpectedOutput((draft) => {
          draft.installmentPayment.installments![0].status =
            InstallmentPaidStatusEnum.AFTER_DUE_DATE
          draft.installmentPayment.installments![0].remainingAmount = 0
          draft.installmentPayment.installments![1].remainingAmount = 4400
          draft.installmentPayment.activeInstallment!.remainingAmount = 4400
          draft.installmentPayment.activeInstallment!.qrCode.amount = 4400
          draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
            QrPaymentNoteEnum.QR_firstSecondInstallment
        })

        expectEqualAsJsonStringsWithDates(output, expected)
      })

      it('after second payment due threshold', () => {
        const output = getTaxDetailPure({
          ...defaultInput,
          taxPayments: [],
          today: new Date('2025-09-01'),
        })

        const expected = createExpectedOutput((draft) => {
          delete draft.installmentPayment.installments
          delete draft.installmentPayment.activeInstallment
          draft.installmentPayment.isPossible = false
          draft.installmentPayment.reasonNotPossible =
            InstallmentPaymentReasonNotPossibleEnum.AFTER_DUE_DATE
        })

        expectEqualAsJsonStringsWithDates(output, expected)
      })
    })

    it('undefined dateOfValidity', () => {
      const output = getTaxDetailPure({
        ...defaultInput,
        dateOfValidity: null,
      })

      const expected = createExpectedOutput((draft) => {
        delete draft.installmentPayment.installments![0].dueDate
        delete draft.oneTimePayment.dueDate
      })

      expectEqualAsJsonStringsWithDates(output, expected)
    })
  })
})
