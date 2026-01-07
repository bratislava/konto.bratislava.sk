/* eslint-disable no-param-reassign */

import { PaymentStatus, TaxType } from '@prisma/client'
import noop from 'lodash/noop'

import {
  RealEstateTaxAreaType,
  RealEstateTaxPropertyType,
} from '../../../prisma/json-types'
import { getTaxDefinitionByType } from '../../../tax-definitions/getTaxDefinitionByType'
import {
  GetTaxDetailPureOptions,
  GetTaxDetailPureResponse,
} from '../../../tax-definitions/taxDefinitionsTypes'
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
  getTaxDetailPure,
  getTaxDetailPureForInstallmentGenerator,
  getTaxDetailPureForOneTimeGenerator,
} from '../unified-tax.util'

// Add this mock at the top after imports
jest.mock('../../../tax-definitions/getTaxDefinitionByType')

const defaultInputRealEstate: GetTaxDetailPureOptions<typeof TaxType.DZN> = {
  type: TaxType.DZN,
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
  taxDetails: {
    type: TaxType.DZN,
    taxFlat: 369,
    taxLand: 246,
    taxConstructions: 369,
    propertyDetails: [
      {
        type: RealEstateTaxPropertyType.APARTMENT,
        areaType: RealEstateTaxAreaType.byt,
        area: undefined,
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxPropertyType.APARTMENT,
        areaType: RealEstateTaxAreaType.byt,
        area: undefined,
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxPropertyType.APARTMENT,
        areaType: RealEstateTaxAreaType.nebyt,
        area: undefined,
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxPropertyType.CONSTRUCTION,
        areaType: RealEstateTaxAreaType.RESIDENTIAL,
        area: undefined,
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxPropertyType.CONSTRUCTION,
        areaType: RealEstateTaxAreaType.RESIDENTIAL,
        area: undefined,
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxPropertyType.CONSTRUCTION,
        areaType: RealEstateTaxAreaType.NONRESIDENTIAL,
        area: undefined,
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxPropertyType.GROUND,
        areaType: RealEstateTaxAreaType.A,
        area: '123',
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxPropertyType.GROUND,
        areaType: RealEstateTaxAreaType.A,
        area: '123',
        base: 123,
        amount: 123,
      },
    ],
  },
  specificSymbol: '2025200000',
  taxPayments: [{ amount: 123, status: PaymentStatus.NEW }],
}

const defaultOutputRealEstate: GetTaxDetailPureResponse<'DZN'> = {
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
        type: RealEstateTaxAreaType.byt,
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxAreaType.byt,
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxAreaType.nebyt,
        base: 123,
        amount: 123,
      },
    ],
    groundTaxDetail: [
      {
        type: RealEstateTaxAreaType.A,
        area: '123',
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxAreaType.A,
        area: '123',
        base: 123,
        amount: 123,
      },
    ],
    constructionTaxDetail: [
      {
        type: RealEstateTaxAreaType.RESIDENTIAL,
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxAreaType.RESIDENTIAL,
        base: 123,
        amount: 123,
      },
      {
        type: RealEstateTaxAreaType.NONRESIDENTIAL,
        base: 123,
        amount: 123,
      },
    ],
  },
}

function createExpectedOutput(
  modifier: <T extends TaxType>(draft: GetTaxDetailPureResponse<T>) => void,
  base?: GetTaxDetailPureResponse<TaxType>,
) {
  const draft = structuredClone(base ?? defaultOutputRealEstate)
  modifier(draft)
  return draft
}

function expectEqualAsJsonStringsWithDates(received: object, expected: object) {
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
  beforeEach(() => {
    // Get the actual implementation
    const actualModule = jest.requireActual(
      '../../../tax-definitions/getTaxDefinitionByType',
    )

    // Reset and setup default mock to use actual implementation
    ;(getTaxDefinitionByType as jest.Mock).mockImplementation(
      actualModule.getTaxDefinitionByType,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('RealEstate', () => {
    describe('- calculateUnifiedTax should create tax detail correctly for', () => {
      describe('value = ', () => {
        it('unpaid', () => {
          const output = getTaxDetailPure(defaultInputRealEstate)

          expect(output).toStrictEqual(defaultOutputRealEstate)
        })

        it('partial first', () => {
          const output = getTaxDetailPure({
            ...defaultInputRealEstate,
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
            ...defaultInputRealEstate,
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
            ...defaultInputRealEstate,
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
            ...defaultInputRealEstate,
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
            ...defaultInputRealEstate,
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
          const output = getTaxDetailPure({
            ...defaultInputRealEstate,
            taxPayments: [],
            today: new Date('2025-01-21 21:00'),
          })
  
          const expected = createExpectedOutput(noop)
  
          expectEqualAsJsonStringsWithDates(output, expected)
        })
  
        describe('after first payment due threshold', () => {
          it('', () => {
            const output = getTaxDetailPure({
              ...defaultInputRealEstate,
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
                QrPaymentNoteEnum.QR_firstInstallment
            })

            expectEqualAsJsonStringsWithDates(output, expected)
          })

          it('with partial first payment', () => {
            const output = getTaxDetailPure({
              ...defaultInputRealEstate,
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
                QrPaymentNoteEnum.QR_firstInstallment
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
              ...defaultInputRealEstate,
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
              ...defaultInputRealEstate,
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
            ...defaultInputRealEstate,
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
              QrPaymentNoteEnum.QR_firstInstallment
          })

          expectEqualAsJsonStringsWithDates(output, expected)
        })

        it('after second payment due threshold', () => {
          const output = getTaxDetailPure({
            ...defaultInputRealEstate,
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
          const output = getTaxDetailPure({
            ...defaultInputRealEstate,
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
        const output = getTaxDetailPure({
          ...defaultInputRealEstate,
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
        [] as Array<Partial<typeof defaultInputRealEstate>>,
      )

      test.each(combinations.map((combination) => [combination]))(
        'should return total amount for all installments equal to the overall amount for input: %j',
        (combination) => {
          const input = { ...defaultInputRealEstate, ...combination }
          const output = getTaxDetailPure(input)

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

  describe('4 installments', () => {
    const defaultInput4Installments: GetTaxDetailPureOptions<
      typeof TaxType.KO
    > = {
      type: TaxType.KO,
      taxYear: 2025,
      today: new Date('2025-01-01'),
      overallAmount: 8000,
      paymentCalendarThreshold: 0,
      variableSymbol: '1234567890',
      dateOfValidity: new Date('2025-01-01'),
      installments: [
        { order: 1, amount: 2000 },
        { order: 2, amount: 2000 },
        { order: 3, amount: 2000 },
        { order: 4, amount: 2000 },
      ],
      taxDetails: {
        type: TaxType.KO,
        addresses: [
          {
            addressDetail: {
              street: 'Test Street',
              orientationNumber: '1',
            },
            containers: [
              {
                objem_nadoby: 120,
                pocet_nadob: 1,
                pocet_odvozov: 12,
                sadzba: 100,
                poplatok: 2000,
                druh_nadoby: 'KO',
              },
            ],
          },
        ],
      },
      specificSymbol: '2025200000',
      taxPayments: [],
    }

    const defaultOutput4Installments: GetTaxDetailPureResponse<'KO'> = {
      overallPaid: 0,
      overallBalance: 8000,
      overallAmount: 8000,
      oneTimePayment: {
        isPossible: true,
        type: OneTimePaymentTypeEnum.ONE_TIME_PAYMENT,
        amount: 8000,
        dueDate: new Date('2025-01-21T23:00:00.000Z'),
        qrCode: {
          amount: 8000,
          variableSymbol: '1234567890',
          specificSymbol: '2025200000',
          paymentNote: QrPaymentNoteEnum.QR_oneTimePay,
        },
        variableSymbol: '1234567890',
      },
      installmentPayment: {
        isPossible: true,
        dueDateLastPayment: new Date('2025-10-31T22:00:00.000Z'),
        installments: [
          {
            installmentNumber: 1,
            dueDate: new Date('2025-01-21T23:00:00.000Z'),
            status: InstallmentPaidStatusEnum.NOT_PAID,
            remainingAmount: 2000,
            totalInstallmentAmount: 2000,
          },
          {
            installmentNumber: 2,
            dueDate: new Date('2025-05-31T22:00:00.000Z'),
            status: InstallmentPaidStatusEnum.NOT_PAID,
            remainingAmount: 2000,
            totalInstallmentAmount: 2000,
          },
          {
            installmentNumber: 3,
            dueDate: new Date('2025-08-31T22:00:00.000Z'),
            status: InstallmentPaidStatusEnum.NOT_PAID,
            remainingAmount: 2000,
            totalInstallmentAmount: 2000,
          },
          {
            installmentNumber: 4,
            dueDate: new Date('2025-10-31T22:00:00.000Z'),
            status: InstallmentPaidStatusEnum.NOT_PAID,
            remainingAmount: 2000,
            totalInstallmentAmount: 2000,
          },
        ],
        activeInstallment: {
          remainingAmount: 2000,
          variableSymbol: '1234567890',
          qrCode: {
            amount: 2000,
            variableSymbol: '1234567890',
            specificSymbol: '2025200000',
            paymentNote: QrPaymentNoteEnum.QR_firstInstallment,
          },
        },
      },
      itemizedDetail: {
        addressDetail: [
          {
            address: {
              street: 'Test Street',
              orientationNumber: '1',
            },
            totalAmount: 2000,
            itemizedContainers: [
              {
                containerVolume: 120,
                containerCount: 1,
                numberOfDisposals: 12,
                unitRate: 100,
                containerType: 'N12',
                fee: 2000,
              },
            ],
          },
        ],
      },
    }

    describe('- calculateUnifiedTax should create tax detail correctly for', () => {
      describe('value = ', () => {
        it('unpaid', () => {
          const output = getTaxDetailPure(defaultInput4Installments)

          expectEqualAsJsonStringsWithDates(output, defaultOutput4Installments)
        })

        it('partial first', () => {
          const output = getTaxDetailPure({
            ...defaultInput4Installments,
            taxPayments: [{ amount: 500, status: PaymentStatus.SUCCESS }],
          })

          const expected = createExpectedOutput((draft) => {
            const newOverallBalance = 7500
            draft.overallPaid = 500
            draft.overallBalance = newOverallBalance
            draft.installmentPayment.installments![0].remainingAmount = 1500
            draft.installmentPayment.installments![0].status =
              InstallmentPaidStatusEnum.PARTIALLY_PAID
            draft.installmentPayment.activeInstallment!.remainingAmount = 1500
            draft.installmentPayment.activeInstallment!.qrCode.amount = 1500
            draft.oneTimePayment.amount = newOverallBalance
            draft.oneTimePayment.type =
              OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
            draft.oneTimePayment.qrCode!.amount = newOverallBalance
            draft.oneTimePayment.qrCode!.paymentNote =
              QrPaymentNoteEnum.QR_remainingAmount
          }, defaultOutput4Installments)

          expectEqualAsJsonStringsWithDates(output, expected)
        })

        it('full first', () => {
          const output = getTaxDetailPure({
            ...defaultInput4Installments,
            taxPayments: [{ amount: 2000, status: PaymentStatus.SUCCESS }],
          })

          const expected = createExpectedOutput((draft) => {
            const newOverallBalance = 6000
            draft.overallPaid = 2000
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
          }, defaultOutput4Installments)

          expectEqualAsJsonStringsWithDates(output, expected)
        })

        it('partial second', () => {
          const output = getTaxDetailPure({
            ...defaultInput4Installments,
            taxPayments: [{ amount: 2500, status: PaymentStatus.SUCCESS }],
          })

          const expected = createExpectedOutput((draft) => {
            const newOverallBalance = 5500
            draft.overallPaid = 2500
            draft.overallBalance = newOverallBalance
            draft.installmentPayment.installments![0].remainingAmount = 0
            draft.installmentPayment.installments![1].remainingAmount = 1500
            draft.installmentPayment.installments![0].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.installments![1].status =
              InstallmentPaidStatusEnum.PARTIALLY_PAID
            draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
              QrPaymentNoteEnum.QR_secondInstallment
            draft.installmentPayment.activeInstallment!.qrCode.amount = 1500
            draft.installmentPayment.activeInstallment!.remainingAmount = 1500
            draft.oneTimePayment.amount = newOverallBalance
            draft.oneTimePayment.type =
              OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
            draft.oneTimePayment.qrCode!.amount = newOverallBalance
            draft.oneTimePayment.qrCode!.paymentNote =
              QrPaymentNoteEnum.QR_remainingAmount
          }, defaultOutput4Installments)

          expectEqualAsJsonStringsWithDates(output, expected)
        })

        it('full second', () => {
          const output = getTaxDetailPure({
            ...defaultInput4Installments,
            taxPayments: [{ amount: 4000, status: PaymentStatus.SUCCESS }],
          })

          const expected = createExpectedOutput((draft) => {
            const newOverallBalance = 4000
            draft.overallPaid = 4000
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
          }, defaultOutput4Installments)

          expectEqualAsJsonStringsWithDates(output, expected)
        })

        it('partial third', () => {
          const output = getTaxDetailPure({
            ...defaultInput4Installments,
            taxPayments: [{ amount: 5500, status: PaymentStatus.SUCCESS }],
          })

          const expected = createExpectedOutput((draft) => {
            const newOverallBalance = 2500
            draft.overallPaid = 5500
            draft.overallBalance = newOverallBalance
            draft.installmentPayment.installments![0].remainingAmount = 0
            draft.installmentPayment.installments![1].remainingAmount = 0
            draft.installmentPayment.installments![2].remainingAmount = 1500
            draft.installmentPayment.installments![0].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.installments![1].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.installments![2].status =
              InstallmentPaidStatusEnum.PARTIALLY_PAID
            draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
              QrPaymentNoteEnum.QR_thirdInstallment
            draft.installmentPayment.activeInstallment!.qrCode.amount = 1500
            draft.installmentPayment.activeInstallment!.remainingAmount = 1500
            draft.oneTimePayment.amount = newOverallBalance
            draft.oneTimePayment.type =
              OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
            draft.oneTimePayment.qrCode!.amount = newOverallBalance
            draft.oneTimePayment.qrCode!.paymentNote =
              QrPaymentNoteEnum.QR_remainingAmount
          }, defaultOutput4Installments)

          expectEqualAsJsonStringsWithDates(output, expected)
        })

        it('full third', () => {
          const output = getTaxDetailPure({
            ...defaultInput4Installments,
            taxPayments: [{ amount: 6000, status: PaymentStatus.SUCCESS }],
          })

          const expected = createExpectedOutput((draft) => {
            const newOverallBalance = 2000
            draft.overallPaid = 6000
            draft.overallBalance = newOverallBalance
            draft.installmentPayment.installments![0].remainingAmount = 0
            draft.installmentPayment.installments![1].remainingAmount = 0
            draft.installmentPayment.installments![2].remainingAmount = 0
            draft.installmentPayment.installments![0].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.installments![1].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.installments![2].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
              QrPaymentNoteEnum.QR_fourthInstallment
            draft.oneTimePayment.amount = newOverallBalance
            draft.oneTimePayment.type =
              OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
            draft.oneTimePayment.qrCode!.amount = newOverallBalance
            draft.oneTimePayment.qrCode!.paymentNote =
              QrPaymentNoteEnum.QR_remainingAmount
          }, defaultOutput4Installments)

          expectEqualAsJsonStringsWithDates(output, expected)
        })

        it('partial fourth', () => {
          const output = getTaxDetailPure({
            ...defaultInput4Installments,
            taxPayments: [{ amount: 7500, status: PaymentStatus.SUCCESS }],
          })

          const expected = createExpectedOutput((draft) => {
            const newOverallBalance = 500
            draft.overallPaid = 7500
            draft.overallBalance = newOverallBalance
            draft.installmentPayment.installments![0].remainingAmount = 0
            draft.installmentPayment.installments![1].remainingAmount = 0
            draft.installmentPayment.installments![2].remainingAmount = 0
            draft.installmentPayment.installments![3].remainingAmount = 500
            draft.installmentPayment.installments![0].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.installments![1].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.installments![2].status =
              InstallmentPaidStatusEnum.PAID
            draft.installmentPayment.installments![3].status =
              InstallmentPaidStatusEnum.PARTIALLY_PAID
            draft.installmentPayment.activeInstallment!.qrCode.paymentNote =
              QrPaymentNoteEnum.QR_fourthInstallment
            draft.installmentPayment.activeInstallment!.qrCode.amount = 500
            draft.installmentPayment.activeInstallment!.remainingAmount = 500
            draft.oneTimePayment.amount = newOverallBalance
            draft.oneTimePayment.type =
              OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
            draft.oneTimePayment.qrCode!.amount = newOverallBalance
            draft.oneTimePayment.qrCode!.paymentNote =
              QrPaymentNoteEnum.QR_remainingAmount
          }, defaultOutput4Installments)

          expectEqualAsJsonStringsWithDates(output, expected)
        })

        it('fully paid', () => {
          const output = getTaxDetailPure({
            ...defaultInput4Installments,
            taxPayments: [{ amount: 8000, status: PaymentStatus.SUCCESS }],
          })

          const expected = createExpectedOutput((draft) => {
            draft.overallPaid = 8000
            draft.overallBalance = 0
            draft.installmentPayment = {
              isPossible: false,
              reasonNotPossible:
                InstallmentPaymentReasonNotPossibleEnum.ALREADY_PAID,
              dueDateLastPayment: new Date('2025-10-31T22:00:00.000Z'),
            }
            draft.oneTimePayment = {
              isPossible: false,
              reasonNotPossible:
                OneTimePaymentReasonNotPossibleEnum.ALREADY_PAID,
            }
          }, defaultOutput4Installments)

          expectEqualAsJsonStringsWithDates(output, expected)
        })
      })

      describe('date', () => {
        it('after fourth payment due threshold', () => {
          const output = getTaxDetailPure({
            ...defaultInput4Installments,
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
          }, defaultOutput4Installments)

          expectEqualAsJsonStringsWithDates(output, expected)
        })
      })

      describe('for all possible installment payment scenarios', () => {
        const testInputArrays = {
          today: [
            new Date('2025-01-01'), // Before first due date
            new Date('2025-01-21T23:00:00.000Z'), // At first due date
            new Date('2025-01-22'), // After first due date
            new Date('2025-05-31T22:00:00.000Z'), // At second due date
            new Date('2025-06-01'), // After second due date
            new Date('2025-08-31T22:00:00.000Z'), // At third due date
            new Date('2025-09-01'), // After third due date
            new Date('2025-10-31T22:00:00.000Z'), // At fourth due date
            new Date('2025-11-01'), // After fourth due date
          ],
          dateOfValidity: [null, new Date('2025-01-01')],
          taxPayments: [
            // No payments
            [],
            [{ amount: 500, status: PaymentStatus.FAIL }],
            [{ amount: 500, status: PaymentStatus.NEW }],
            [{ amount: 2000, status: PaymentStatus.NEW }],
            // Partial first installment
            [{ amount: 500, status: PaymentStatus.SUCCESS }],
            [
              { amount: 500, status: PaymentStatus.SUCCESS },
              { amount: 500, status: PaymentStatus.FAIL },
            ],
            // Full first installment
            [{ amount: 2000, status: PaymentStatus.SUCCESS }],
            [
              { amount: 1000, status: PaymentStatus.SUCCESS },
              { amount: 1000, status: PaymentStatus.SUCCESS },
            ],
            // Partial second installment
            [{ amount: 3000, status: PaymentStatus.SUCCESS }],
            [
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 1000, status: PaymentStatus.SUCCESS },
            ],
            // Full second installment
            [{ amount: 4000, status: PaymentStatus.SUCCESS }],
            [
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 2000, status: PaymentStatus.SUCCESS },
            ],
            // Partial third installment
            [{ amount: 5000, status: PaymentStatus.SUCCESS }],
            [
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 1000, status: PaymentStatus.SUCCESS },
            ],
            // Full third installment
            [{ amount: 6000, status: PaymentStatus.SUCCESS }],
            [
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 2000, status: PaymentStatus.SUCCESS },
            ],
            // Partial fourth installment
            [{ amount: 7000, status: PaymentStatus.SUCCESS }],
            [
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 1000, status: PaymentStatus.SUCCESS },
            ],
            // Fully paid
            [{ amount: 8000, status: PaymentStatus.SUCCESS }],
            [
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 2000, status: PaymentStatus.SUCCESS },
              { amount: 2000, status: PaymentStatus.SUCCESS },
            ],
            // Overpaid
            [{ amount: 9000, status: PaymentStatus.SUCCESS }],
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
          [] as Array<Partial<typeof defaultInput4Installments>>,
        )

        test.each(combinations.map((combination) => [combination]))(
          'should return total amount for all installments equal to the overall amount for input: %j',
          (combination) => {
            const input = { ...defaultInput4Installments, ...combination }
            const output = getTaxDetailPure(input)

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
  })

  describe('installment count mismatch', () => {
    it('should throw error when installments.length !== numberOfInstallments (fewer installments)', () => {
      const input = {
        ...defaultInputRealEstate,
        installments: [
          { order: 1, amount: 2200 },
          { order: 2, amount: 2200 },
        ],
      }

      expect(() => getTaxDetailPure(input)).toThrow(
        new ThrowerErrorGuard().InternalServerErrorException(
          CustomErrorTaxTypesEnum.INSTALLMENT_INCORRECT_COUNT,
          CustomErrorTaxTypesResponseEnum.INSTALLMENT_INCORRECT_COUNT,
        ),
      )
    })

    it('should throw error when installments.length !== numberOfInstallments (more installments)', () => {
      const input = {
        ...defaultInputRealEstate,
        installments: [
          { order: 1, amount: 1650 },
          { order: 2, amount: 1650 },
          { order: 3, amount: 1650 },
          { order: 4, amount: 1650 },
        ],
      }

      expect(() => getTaxDetailPure(input)).toThrow(
        new ThrowerErrorGuard().InternalServerErrorException(
          CustomErrorTaxTypesEnum.INSTALLMENT_INCORRECT_COUNT,
          CustomErrorTaxTypesResponseEnum.INSTALLMENT_INCORRECT_COUNT,
        ),
      )
    })

    it('should throw error when installments array is empty', () => {
      const input = {
        ...defaultInputRealEstate,
        installments: [],
      }

      expect(() => getTaxDetailPure(input)).toThrow(
        new ThrowerErrorGuard().InternalServerErrorException(
          CustomErrorTaxTypesEnum.INSTALLMENT_INCORRECT_COUNT,
          CustomErrorTaxTypesResponseEnum.INSTALLMENT_INCORRECT_COUNT,
        ),
      )
    })
  })
})

describe('getTaxDetailPureForInstallmentGenerator', () => {
  const baseOptionsRealEstate: {
    taxType: TaxType
    taxId: number
    taxYear: number
    today: Date
    overallAmount: number
    variableSymbol: string
    dateOfValidity: Date | null
    installments: { order: number; amount: number }[]
    specificSymbol: string
    taxPayments: {
      amount: number
      status: PaymentStatus
    }[]
  } = {
    taxType: TaxType.DZN,
    taxId: 123,
    taxYear: 2025,
    today: new Date('2025-01-01'),
    overallAmount: 6600,
    variableSymbol: '1234567890',
    dateOfValidity: new Date('2025-01-01'),
    installments: [
      { order: 1, amount: 2200 },
      { order: 2, amount: 2200 },
      { order: 3, amount: 2200 },
    ],
    specificSymbol: '2025200000',
    taxPayments: [],
  }

  beforeEach(() => {
    // Get the actual implementation
    const actualModule = jest.requireActual(
      '../../../tax-definitions/getTaxDefinitionByType',
    )

    // Reset and setup default mock to use actual implementation
    ;(getTaxDefinitionByType as jest.Mock).mockImplementation(
      actualModule.getTaxDefinitionByType,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should generate payment for the first installment', () => {
    const output = getTaxDetailPureForInstallmentGenerator(
      baseOptionsRealEstate,
    )

    expect(output).toEqual({
      amount: 2200,
      taxId: 123,
      description: 'Platba 1. splatky za dane pre BA s id dane 123',
    })
  })

  it('should generate payment for a partially paid installment', () => {
    const options = {
      ...baseOptionsRealEstate,
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
      ...baseOptionsRealEstate,
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
      ...baseOptionsRealEstate,
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
      ...baseOptionsRealEstate,
      overallAmount: 100,
      taxPayments: [],
    }

    expect(() => getTaxDetailPureForInstallmentGenerator(options)).toThrow(
      new ThrowerErrorGuard().UnprocessableEntityException(
        CustomErrorTaxTypesEnum.BELOW_THRESHOLD,
        CustomErrorTaxTypesResponseEnum.BELOW_THRESHOLD,
      ),
    )
  })

  it('should work when threshold is 0', () => {
    // Get the actual implementation and override just paymentCalendarThreshold
    const actualModule = jest.requireActual(
      '../../../tax-definitions/getTaxDefinitionByType',
    )
    const actualDefinition = actualModule.getTaxDefinitionByType(TaxType.DZN)

    ;(getTaxDefinitionByType as jest.Mock).mockReturnValue({
      ...actualDefinition,
      paymentCalendarThreshold: 0,
    })

    const options = {
      ...baseOptionsRealEstate,
      overallAmount: 100,
      taxPayments: [],
      installments: [
        { order: 1, amount: 33 },
        { order: 2, amount: 33 },
        { order: 3, amount: 34 },
      ],
    }

    const output = getTaxDetailPureForInstallmentGenerator(options)
    expect(output).toEqual(
      expect.objectContaining({
        amount: 33,
        taxId: 123,
      }),
    )
  })

  it('should handle an internal unexpected error for missing active installment', () => {
    const options = {
      ...baseOptionsRealEstate,
      installments: [],
    }

    expect(() => getTaxDetailPureForInstallmentGenerator(options)).toThrow(
      new ThrowerErrorGuard().InternalServerErrorException(
        CustomErrorTaxTypesEnum.INSTALLMENT_INCORRECT_COUNT,
        CustomErrorTaxTypesResponseEnum.INSTALLMENT_INCORRECT_COUNT,
      ),
    )
  })

  it('should throw error when installments.length !== numberOfInstallments (fewer installments)', () => {
    const options = {
      ...baseOptionsRealEstate,
      installments: [
        { order: 1, amount: 2200 },
        { order: 2, amount: 2200 },
      ],
    }

    expect(() => getTaxDetailPureForInstallmentGenerator(options)).toThrow(
      new ThrowerErrorGuard().InternalServerErrorException(
        CustomErrorTaxTypesEnum.INSTALLMENT_INCORRECT_COUNT,
        CustomErrorTaxTypesResponseEnum.INSTALLMENT_INCORRECT_COUNT,
      ),
    )
  })

  it('should throw error when installments.length > numberOfInstallments', () => {
    const options = {
      ...baseOptionsRealEstate,
      installments: [
        { order: 1, amount: 1650 },
        { order: 2, amount: 1650 },
        { order: 3, amount: 1650 },
        { order: 4, amount: 1650 },
      ],
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

/* eslint-enable no-param-reassign */
