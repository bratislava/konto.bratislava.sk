/* eslint-disable no-param-reassign */

import {
  PaymentStatus,
  TaxDetailareaType,
  TaxDetailType,
  TaxType,
} from '@prisma/client'

import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { QrPaymentNoteEnum } from '../../../utils/subservices/dtos/qrcode.dto'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../../dtos/error.dto'
import {
  InstallmentPaidStatusEnum,
  InstallmentPaymentReasonNotPossibleEnum,
  OneTimePaymentReasonNotPossibleEnum,
  OneTimePaymentTypeEnum,
} from '../../dtos/response.tax.dto'
import {
  getRealEstateTaxDetailPure,
  getTaxDetailPureForInstallmentGenerator,
  getTaxDetailPureForOneTimeGenerator,
} from '../unified-tax.util'

const defaultInput = {
  taxYear: 2025,
  today: new Date('2025-01-01'),
  overallAmount: 6600,
  paymentCalendarThreshold: 6600,
  variableSymbol: '1234567890',
  dateOfValidity: new Date('2025-01-01'),
  installments: [
    { order: 1, amount: 2200 },
    { order: 2, amount: 2200 },
    { order: 3, amount: 2200 },
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

const defaultOutput: ReturnType<typeof getRealEstateTaxDetailPure> = {
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
    dueDateLastPayment: new Date('2025-10-31T23:00:00.000Z'),
    installments: [
      {
        installmentNumber: 1,
        dueDate: new Date('2025-01-21T23:00:00.000Z'),
        status: InstallmentPaidStatusEnum.NOT_PAID,
        remainingAmount: 2200,
        totalInstallmentAmount: 2200,
      },
      {
        installmentNumber: 2,
        dueDate: new Date('2025-08-31T22:00:00.000Z'),
        status: InstallmentPaidStatusEnum.NOT_PAID,
        remainingAmount: 2200,
        totalInstallmentAmount: 2200,
      },
      {
        installmentNumber: 3,
        dueDate: new Date('2025-10-31T23:00:00.000Z'),
        status: InstallmentPaidStatusEnum.NOT_PAID,
        remainingAmount: 2200,
        totalInstallmentAmount: 2200,
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
  received: ReturnType<typeof getRealEstateTaxDetailPure>,
  expected: ReturnType<typeof getRealEstateTaxDetailPure>,
) {
  const stringifiedOutput = JSON.stringify(
    received,
    Object.keys(received).sort(),
    2,
  )
  const stringifiedExpected = JSON.stringify(
    expected,
    Object.keys(expected).sort(),
    2,
  )

  expect(stringifiedOutput).toEqual(stringifiedExpected)
}

describe('UnifiedTaxUtil', () => {
  describe('- calculateUnifiedTax should create tax detail correctly for', () => {
    describe('value = ', () => {
      it('unpaid', () => {
        const output = getRealEstateTaxDetailPure(defaultInput)

        expect(output).toStrictEqual(defaultOutput)
      })

      it('partial first', () => {
        const output = getRealEstateTaxDetailPure({
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
        const output = getRealEstateTaxDetailPure({
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
        const output = getRealEstateTaxDetailPure({
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
        const output = getRealEstateTaxDetailPure({
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
        const output = getRealEstateTaxDetailPure({
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
            dueDateLastPayment: new Date('2025-10-31T23:00:00.000Z'),
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
        const output = getRealEstateTaxDetailPure({
          ...defaultInput,
          taxPayments: [],
          today: new Date('2025-01-21 21:00'),
        })

        const expected = createExpectedOutput(() => {})

        expectEqualAsJsonStringsWithDates(output, expected)
      })

      describe('after first payment due threshold', () => {
        it('', () => {
          const output = getRealEstateTaxDetailPure({
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
          const output = getRealEstateTaxDetailPure({
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
          const output = getRealEstateTaxDetailPure({
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
          const output = getRealEstateTaxDetailPure({
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
        const output = getRealEstateTaxDetailPure({
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
        const output = getRealEstateTaxDetailPure({
          ...defaultInput,
          taxPayments: [],
          today: new Date('2025-09-01'),
        })

        const expected = createExpectedOutput((draft) => {
          draft.installmentPayment.activeInstallment = {
            remainingAmount: 6600,
            variableSymbol:
              draft.installmentPayment.activeInstallment!.variableSymbol,
            qrCode: {
              ...draft.installmentPayment.activeInstallment!.qrCode,
              amount: draft.overallAmount,
              paymentNote: QrPaymentNoteEnum.QR_thirdInstallment,
            },
          }
          draft.installmentPayment.installments = [
            {
              ...draft.installmentPayment.installments![0],
              status: InstallmentPaidStatusEnum.AFTER_DUE_DATE,
              remainingAmount: 0,
            },
            {
              ...draft.installmentPayment.installments![1],
              status: InstallmentPaidStatusEnum.AFTER_DUE_DATE,
              remainingAmount: 0,
            },
            {
              ...draft.installmentPayment.installments![2],
              status: InstallmentPaidStatusEnum.NOT_PAID,
              remainingAmount: 6600,
            },
          ]
        })

        expectEqualAsJsonStringsWithDates(output, expected)
      })

      it('after third payment due threshold', () => {
        const output = getRealEstateTaxDetailPure({
          ...defaultInput,
          taxPayments: [],
          today: new Date('2025-11-01'),
        })

        const expected = createExpectedOutput((draft) => {
          delete draft.installmentPayment.activeInstallment
          delete draft.installmentPayment.installments
          draft.installmentPayment = {
            ...draft.installmentPayment,
            isPossible: false,
            reasonNotPossible:
              InstallmentPaymentReasonNotPossibleEnum.AFTER_DUE_DATE,
          }
        })

        expectEqualAsJsonStringsWithDates(output, expected)
      })
    })

    it('undefined dateOfValidity', () => {
      const output = getRealEstateTaxDetailPure({
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

  describe('for all possible installment payment scenarios', () => {
    const testInputArrays = {
      today: [
        new Date('2025-01-01'), // Before first due date
        new Date('2025-01-21T23:00:00.000Z'), // At first due date
        new Date('2025-01-22'), // After first due date
        new Date('2025-08-31T22:00:00.000Z'), // At second due date
        new Date('2025-09-01'), // After second due date
        new Date('2025-10-31T23:00:00.000Z'), // At third due date
        new Date('2025-11-01'), // After third due date
      ],
      dateOfValidity: [null, new Date('2025-01-01')],
      taxPayments: [
        // No payments
        [],
        [{ amount: 1100, status: PaymentStatus.FAIL }],
        [{ amount: 1100, status: PaymentStatus.NEW }],
        [{ amount: 2200, status: PaymentStatus.NEW }],
        // Partial first installment
        [{ amount: 1100, status: PaymentStatus.SUCCESS }],
        [
          { amount: 1100, status: PaymentStatus.SUCCESS },
          { amount: 1100, status: PaymentStatus.FAIL },
        ],
        // Full first installment
        [{ amount: 2200, status: PaymentStatus.SUCCESS }],
        [
          { amount: 1100, status: PaymentStatus.SUCCESS },
          { amount: 1100, status: PaymentStatus.SUCCESS },
        ],
        // Partial second installment
        [{ amount: 3300, status: PaymentStatus.SUCCESS }],
        [
          { amount: 2200, status: PaymentStatus.SUCCESS },
          { amount: 1100, status: PaymentStatus.SUCCESS },
        ],
        // Full second installment
        [{ amount: 4400, status: PaymentStatus.SUCCESS }],
        [
          { amount: 2200, status: PaymentStatus.SUCCESS },
          { amount: 2200, status: PaymentStatus.SUCCESS },
        ],
        // Partial third installment
        [{ amount: 5500, status: PaymentStatus.SUCCESS }],
        [
          { amount: 2200, status: PaymentStatus.SUCCESS },
          { amount: 2200, status: PaymentStatus.SUCCESS },
          { amount: 1100, status: PaymentStatus.SUCCESS },
        ],
        // Fully paid
        [{ amount: 6600, status: PaymentStatus.SUCCESS }],
        [
          { amount: 2200, status: PaymentStatus.SUCCESS },
          { amount: 2200, status: PaymentStatus.SUCCESS },
          { amount: 2200, status: PaymentStatus.SUCCESS },
        ],
        // Overpaid
        [{ amount: 7000, status: PaymentStatus.SUCCESS }],
      ],
    }

    // eslint-disable-next-line unicorn/no-array-reduce
    const combinations = Object.entries(testInputArrays).reduce(
      (acc, [key, values]) => {
        if (acc.length === 0) {
          return values.map((value) => ({ [key]: value }))
        }
        return acc.flatMap((combo) =>
          values.map((value) => ({ ...combo, [key]: value })),
        )
      },
      [] as Array<Partial<typeof defaultInput>>,
    )

    test.each(combinations.map((combination) => [combination]))(
      'should return total amount for all installments equal to the overall amount for input: %j',
      (combination) => {
        const input = { ...defaultInput, ...combination }
        const output = getRealEstateTaxDetailPure(input)

        if (
          !output.installmentPayment.isPossible ||
          !output.installmentPayment.installments
        ) {
          return
        }

        const totalInstallmentAmount =
          output.installmentPayment.installments.reduce(
            (sum, installment) => sum + installment.remainingAmount,
            0,
          )

        expect(totalInstallmentAmount).toBe(output.overallBalance)
      },
    )
  })
})

describe('getTaxDetailPureForInstallmentGenerator', () => {
  const baseOptions = {
    taxId: 123,
    taxYear: 2025,
    today: new Date('2025-01-01'),
    overallAmount: 6600,
    paymentCalendarThreshold: 6600,
    variableSymbol: '1234567890',
    dateOfValidity: new Date('2025-01-01'),
    installments: [
      { order: 1, amount: 2200 },
      { order: 2, amount: 2200 },
      { order: 3, amount: 2200 },
    ],
    specificSymbol: '2025200000',
    taxPayments: [],
    taxDefinition: getTaxDefinitionByType(TaxType.DZN),
  }

  it('should generate payment for the first installment', () => {
    const output = getTaxDetailPureForInstallmentGenerator(baseOptions)

    expect(output).toEqual({
      amount: 2200,
      taxId: 123,
      description: 'Platba 1. splatky za dane pre BA s id dane 123',
    })
  })

  it('should generate payment for a partially paid installment', () => {
    const options = {
      ...baseOptions,
      taxPayments: [{ amount: 1, status: PaymentStatus.SUCCESS }],
    }
    const output = getTaxDetailPureForInstallmentGenerator(options)

    expect(output).toEqual({
      amount: 2199,
      taxId: 123,
      description: 'Platba zostatku 1. splatky za dane pre BA s id dane 123',
    })
  })

  it('should throw an error if all installments are fully paid', () => {
    const options = {
      ...baseOptions,
      taxPayments: [{ amount: 6600, status: PaymentStatus.SUCCESS }],
    }

    expect(() => getTaxDetailPureForInstallmentGenerator(options)).toThrow(
      new ThrowerErrorGuard().UnprocessableEntityException(
        CustomErrorTaxTypesEnum.ALREADY_PAID,
        CustomErrorTaxTypesResponseEnum.ALREADY_PAID,
      ),
    )
  })

  it('should throw an error if payment is after the due date', () => {
    const options = {
      ...baseOptions,
      today: new Date('2025-10-31T23:00:01Z'),
      taxPayments: [],
    }

    expect(() => getTaxDetailPureForInstallmentGenerator(options)).toThrow(
      new ThrowerErrorGuard().UnprocessableEntityException(
        CustomErrorTaxTypesEnum.AFTER_DUE_DATE,
        CustomErrorTaxTypesResponseEnum.AFTER_DUE_DATE,
      ),
    )
  })

  it('should throw an error if below threshold', () => {
    const options = {
      ...baseOptions,
      overallAmount: 100,
      paymentCalendarThreshold: 200,
      taxPayments: [],
    }

    expect(() => getTaxDetailPureForInstallmentGenerator(options)).toThrow(
      new ThrowerErrorGuard().UnprocessableEntityException(
        CustomErrorTaxTypesEnum.BELOW_THRESHOLD,
        CustomErrorTaxTypesResponseEnum.BELOW_THRESHOLD,
      ),
    )
  })

  it('should handle an internal unexpected error for missing active installment', () => {
    const options = {
      ...baseOptions,
      installments: [],
    }

    expect(() => getTaxDetailPureForInstallmentGenerator(options)).toThrow(
      new ThrowerErrorGuard().InternalServerErrorException(
        CustomErrorTaxTypesEnum.INSTALLMENT_INCORRECT_COUNT,
        CustomErrorTaxTypesResponseEnum.INSTALLMENT_INCORRECT_COUNT,
      ),
    )
  })
})

describe('getTaxDetailPureForOneTimeGenerator', () => {
  const options: {
    taxId: number
    overallAmount: number // suma na zaplatenie
    taxPayments: {
      amount: number
      status: PaymentStatus
    }[]
  } = {
    taxId: 123,
    overallAmount: 6600,
    taxPayments: [],
  }
  it('should generate full payment', () => {
    const output = getTaxDetailPureForOneTimeGenerator(options)

    expect(output).toEqual({
      amount: 6600,
      taxId: 123,
      description: 'Platba za dane pre BA s id dane 123',
    })
  })

  it('should generate partial payment', () => {
    const output = getTaxDetailPureForOneTimeGenerator({
      ...options,
      taxPayments: [
        { amount: 1, status: PaymentStatus.NEW },
        { amount: 1, status: PaymentStatus.FAIL },
        {
          amount: 1,
          status: PaymentStatus.SUCCESS,
        },
      ],
    })

    expect(output).toEqual({
      amount: 6599,
      taxId: 123,
      description: 'Platba zostatku za dane pre BA s id dane 123',
    })
  })

  it('should handle already paid tax', () => {
    expect(() => {
      getTaxDetailPureForOneTimeGenerator({
        ...options,
        taxPayments: [
          {
            amount: 6600,
            status: PaymentStatus.SUCCESS,
          },
        ],
      })
    }).toThrow(
      new ThrowerErrorGuard().UnprocessableEntityException(
        CustomErrorTaxTypesEnum.ALREADY_PAID,
        CustomErrorTaxTypesResponseEnum.ALREADY_PAID,
      ),
    )
  })

  it('should handle overpaid tax', () => {
    expect(() => {
      getTaxDetailPureForOneTimeGenerator({
        ...options,
        taxPayments: [
          {
            amount: 999_999,
            status: PaymentStatus.SUCCESS,
          },
        ],
      })
    }).toThrow(
      new ThrowerErrorGuard().UnprocessableEntityException(
        CustomErrorTaxTypesEnum.ALREADY_PAID,
        CustomErrorTaxTypesResponseEnum.ALREADY_PAID,
      ),
    )
  })
})
