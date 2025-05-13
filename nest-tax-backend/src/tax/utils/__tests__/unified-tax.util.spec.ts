// unified-tax.util.spec.ts
import { getTaxDetailPure } from '../unified-tax.util'

type InputGetTaxDetailPureType = {
  overallPaid: number
  taxYear: number
  today: Date
  overallAmount: number
  payment_calendar_threshold: string
  variableSymbol: string
  dateOfValidity: Date | null
  installments: { order: string | null; amount: number }[]
}

describe('UnifiedTaxUtil', () => {
  describe('calculateUnifiedTax should create tax correctly for', () => {
    describe('value over partial payment threshold', () => {
      it('unpaid', () => {
        const input: InputGetTaxDetailPureType = {
          overallPaid: 0,
          taxYear: 2025,
          today: new Date('2025-01-01'),
          overallAmount: 30000,
          payment_calendar_threshold: '11-01',
          variableSymbol: '1234567890',
          dateOfValidity: new Date('2025-01-01'),
          installments: [
            {
              order: '1',
              amount: 10000,
            },
            {
              order: '2',
              amount: 10000,
            },
            {
              order: '3',
              amount: 10000,
            },
          ],
        }
        const output = getTaxDetailPure(
          input.overallPaid,
          input.taxYear,
          input.today,
          input.overallAmount,
          input.payment_calendar_threshold,
          input.variableSymbol,
          input.dateOfValidity,
          input.installments,
        )

        expect(output).toEqual({
          overallPaid: 0,
          overallBalance: 30000,
          overallOverpayment: 0,
          overallAmount: 30000,
          oneTimePayment: {
            isPossible: true,
            type: 'ONE_TIME_PAYMENT',
            amount: 30000,
            dueDate: new Date('2025-01-21T00:00:00.000Z'),
            qrCodeArgs: {
              amount: 30000,
              variableSymbol: '1234567890',
              specificSymbol: '2024200000',
              paymentNote: 'QR_oneTimePay',
            },
            variableSymbol: '1234567890',
          },
          installmentPayment: {
            isPossible: true,
            installments: [
              {
                installmentNumber: 1,
                dueDate: new Date('2025-01-21T00:00:00.000Z'),
                status: 'NOT_PAID',
                paidAmount: 0,
                remainingAmount: 10000,
                variableSymbol: '1234567890',
                qrCodeArgs: {
                  amount: 10000,
                  variableSymbol: '1234567890',
                  specificSymbol: '2024200000',
                  paymentNote: 'QR_firstInstallment',
                },
              },
              {
                installmentNumber: 2,
                dueDate: new Date('2027-07-07T22:00:00.000Z'),
                status: 'NOT_PAID',
                paidAmount: 0,
                remainingAmount: 10000,
                variableSymbol: '1234567890',
                qrCodeArgs: {
                  amount: 10000,
                  variableSymbol: '1234567890',
                  specificSymbol: '2024200000',
                  paymentNote: 'QR_secondInstallment',
                },
              },
              {
                installmentNumber: 3,
                dueDate: new Date('2027-07-09T22:00:00.000Z'),
                status: 'NOT_PAID',
                paidAmount: 0,
                remainingAmount: 10000,
                variableSymbol: '1234567890',
                qrCodeArgs: {
                  amount: 10000,
                  variableSymbol: '1234567890',
                  specificSymbol: '2024200000',
                  paymentNote: 'QR_thirdInstallment',
                },
              },
            ],
          },
        })
      })

      it('partial first payment', () => {
        const input: InputGetTaxDetailPureType = {
          overallPaid: 9999,
          taxYear: 2025,
          today: new Date('2025-01-01'),
          overallAmount: 30000,
          payment_calendar_threshold: '11-01',
          variableSymbol: '1234567890',
          dateOfValidity: new Date('2025-01-01'),
          installments: [
            {
              order: '1',
              amount: 10000,
            },
            {
              order: '2',
              amount: 10000,
            },
            {
              order: '3',
              amount: 10000,
            },
          ],
        }
        const output = getTaxDetailPure(
          input.overallPaid,
          input.taxYear,
          input.today,
          input.overallAmount,
          input.payment_calendar_threshold,
          input.variableSymbol,
          input.dateOfValidity,
          input.installments,
        )

        expect(output).toEqual({
          overallPaid: 9999,
          overallBalance: 20001,
          overallOverpayment: 0,
          overallAmount: 30000,
          oneTimePayment: {
            isPossible: true,
            type: 'REMAINING_AMOUNT_PAYMENT',
            amount: 20001,
            dueDate: new Date('2025-01-21T00:00:00.000Z'),
            qrCodeArgs: {
              amount: 20001,
              variableSymbol: '1234567890',
              specificSymbol: '2024200000',
              paymentNote: 'QR_remainingAmount',
            },
            variableSymbol: '1234567890',
          },
          installmentPayment: {
            isPossible: true,
            installments: [
              {
                installmentNumber: 1,
                dueDate: new Date('2025-01-21T00:00:00.000Z'),
                status: 'PARTIALLY_PAID',
                paidAmount: 9999,
                remainingAmount: 1,
                variableSymbol: '1234567890',
                qrCodeArgs: {
                  amount: 1,
                  variableSymbol: '1234567890',
                  specificSymbol: '2024200000',
                  paymentNote: 'QR_firstInstallment',
                },
              },
              {
                installmentNumber: 2,
                dueDate: new Date('2027-07-07T22:00:00.000Z'),
                status: 'NOT_PAID',
                paidAmount: 0,
                remainingAmount: 10000,
                variableSymbol: '1234567890',
                qrCodeArgs: {
                  amount: 10000,
                  variableSymbol: '1234567890',
                  specificSymbol: '2024200000',
                  paymentNote: 'QR_secondInstallment',
                },
              },
              {
                installmentNumber: 3,
                dueDate: new Date('2027-07-09T22:00:00.000Z'),
                status: 'NOT_PAID',
                paidAmount: 0,
                remainingAmount: 10000,
                variableSymbol: '1234567890',
                qrCodeArgs: {
                  amount: 10000,
                  variableSymbol: '1234567890',
                  specificSymbol: '2024200000',
                  paymentNote: 'QR_thirdInstallment',
                },
              },
            ],
          },
        })
      })

      it('full first payment', () => {
        const input: InputGetTaxDetailPureType = {
          overallPaid: 10000,
          taxYear: 2025,
          today: new Date('2025-01-01'),
          overallAmount: 30000,
          payment_calendar_threshold: '11-01',
          variableSymbol: '1234567890',
          dateOfValidity: new Date('2025-01-01'),
          installments: [
            {
              order: '1',
              amount: 10000,
            },
            {
              order: '2',
              amount: 10000,
            },
            {
              order: '3',
              amount: 10000,
            },
          ],
        }
        const output = getTaxDetailPure(
          input.overallPaid,
          input.taxYear,
          input.today,
          input.overallAmount,
          input.payment_calendar_threshold,
          input.variableSymbol,
          input.dateOfValidity,
          input.installments,
        )
        expect(output.oneTimePayment.isPossible).toEqual(true)
        expect(output.oneTimePayment.type).toEqual('REMAINING_AMOUNT_PAYMENT')
        expect(output.oneTimePayment.qrCodeArgs?.paymentNote).toEqual(
          'QR_remainingAmount',
        )
        expect(output.installmentPayment.installments).toBeDefined()
        expect(output.installmentPayment.installments![0].status).toEqual(
          'PAID',
        )
        expect(
          output.installmentPayment.installments![0].remainingAmount,
        ).toEqual(0)
        expect(output.installmentPayment.installments![1].status).toEqual(
          'NOT_PAID',
        )
        expect(output.installmentPayment.installments![1].paidAmount).toEqual(0)
        expect(output.installmentPayment.installments![2].status).toEqual(
          'NOT_PAID',
        )
        expect(output.installmentPayment.installments![2].paidAmount).toEqual(0)
      })

      it('partial second payment', () => {
        const input: InputGetTaxDetailPureType = {
          overallPaid: 10001,
          taxYear: 2025,
          today: new Date('2025-01-01'),
          overallAmount: 30000,
          payment_calendar_threshold: '11-01',
          variableSymbol: '1234567890',
          dateOfValidity: new Date('2025-01-01'),
          installments: [
            {
              order: '1',
              amount: 10000,
            },
            {
              order: '2',
              amount: 10000,
            },
            {
              order: '3',
              amount: 10000,
            },
          ],
        }
        const output = getTaxDetailPure(
          input.overallPaid,
          input.taxYear,
          input.today,
          input.overallAmount,
          input.payment_calendar_threshold,
          input.variableSymbol,
          input.dateOfValidity,
          input.installments,
        )

        expect(output.oneTimePayment.isPossible).toEqual(true)
        expect(output.oneTimePayment.type).toEqual('REMAINING_AMOUNT_PAYMENT')
        expect(output.oneTimePayment.qrCodeArgs?.paymentNote).toEqual(
          'QR_remainingAmount',
        )
        expect(output.oneTimePayment.qrCodeArgs?.amount).toEqual(19999)
        expect(output.installmentPayment.installments).toBeDefined()
        expect(output.installmentPayment.installments![0].status).toEqual(
          'PAID',
        )
        expect(
          output.installmentPayment.installments![0].remainingAmount,
        ).toEqual(0)
        expect(output.installmentPayment.installments![1].status).toEqual(
          'PARTIALLY_PAID',
        )
        expect(output.installmentPayment.installments![1].paidAmount).toEqual(1)
        expect(output.installmentPayment.installments![2].status).toEqual(
          'NOT_PAID',
        )
        expect(output.installmentPayment.installments![2].paidAmount).toEqual(0)
      })
    })

    describe('value at partial payment threshold', () => {
      it('partial payment', () => {
        const input: InputGetTaxDetailPureType = {
          overallPaid: 600,
          taxYear: 2025,
          today: new Date('2025-01-01'),
          overallAmount: 6600,
          payment_calendar_threshold: '11-01',
          variableSymbol: '1234567890',
          dateOfValidity: new Date('2025-01-01'),
          installments: [
            {
              order: '1',
              amount: 10000,
            },
            {
              order: '2',
              amount: 10000,
            },
            {
              order: '3',
              amount: 10000,
            },
          ],
        }
        const output = getTaxDetailPure(
          input.overallPaid,
          input.taxYear,
          input.today,
          input.overallAmount,
          input.payment_calendar_threshold,
          input.variableSymbol,
          input.dateOfValidity,
          input.installments,
        )


        expect(output.oneTimePayment.isPossible).toEqual(true)
        expect(output.oneTimePayment.type).toEqual('REMAINING_AMOUNT_PAYMENT')
        expect(output.oneTimePayment.qrCodeArgs?.paymentNote).toEqual(
          'QR_remainingAmount',
        )
        expect(output.installmentPayment.isPossible).toEqual(true)
      })
      it('full payment', () => {
        const input: InputGetTaxDetailPureType = {
          overallPaid: 6600,
          taxYear: 2025,
          today: new Date('2025-01-01'),
          overallAmount: 6600,
          payment_calendar_threshold: '11-01',
          variableSymbol: '1234567890',
          dateOfValidity: new Date('2025-01-01'),
          installments: [
            {
              order: '1',
              amount: 10000,
            },
            {
              order: '2',
              amount: 10000,
            },
            {
              order: '3',
              amount: 10000,
            },
          ],
        }
        const output = getTaxDetailPure(
          input.overallPaid,
          input.taxYear,
          input.today,
          input.overallAmount,
          input.payment_calendar_threshold,
          input.variableSymbol,
          input.dateOfValidity,
          input.installments,
        )

        expect(output.oneTimePayment.isPossible).toEqual(false)
        expect(output.oneTimePayment.reasonNotPossible).toEqual("ALREADY_PAID")
        expect(output.oneTimePayment.qrCodeArgs).toBeUndefined()
        expect(output.oneTimePayment.type).toBeUndefined()
        expect(output.oneTimePayment.dueDate).toBeUndefined()
        expect(output.oneTimePayment.amount).toBeUndefined()
        expect(output.oneTimePayment.variableSymbol).toBeUndefined()
        expect(output.installmentPayment.isPossible).toEqual(false)
        expect(output.installmentPayment.reasonNotPossible).toEqual("ALREADY_PAID")
      })
    })

    describe('value below partial payment threshold', () => {
      it('full payment', () => {
        const input: InputGetTaxDetailPureType = {
          overallPaid: 0,
          taxYear: 2025,
          today: new Date('2025-01-01'),
          overallAmount: 6599,
          payment_calendar_threshold: '11-01',
          variableSymbol: '1234567890',
          dateOfValidity: new Date('2025-01-01'),
          installments: [
            {
              order: '1',
              amount: 10000,
            },
            {
              order: '2',
              amount: 10000,
            },
            {
              order: '3',
              amount: 10000,
            },
          ],
        }
        const output = getTaxDetailPure(
          input.overallPaid,
          input.taxYear,
          input.today,
          input.overallAmount,
          input.payment_calendar_threshold,
          input.variableSymbol,
          input.dateOfValidity,
          input.installments,
        )
        console.log(JSON.stringify(output, null, 4))

        expect(output.oneTimePayment.isPossible).toEqual(true)
        expect(output.oneTimePayment.reasonNotPossible).toBeUndefined()
        expect(output.oneTimePayment.qrCodeArgs?.paymentNote).toEqual('TODO')
        expect(output.oneTimePayment.type).toBeUndefined() // TODO FROM HERE
        expect(output.oneTimePayment.dueDate).toBeUndefined()
        expect(output.oneTimePayment.amount).toBeUndefined()
        expect(output.oneTimePayment.variableSymbol).toBeUndefined()
        expect(output.installmentPayment.isPossible).toEqual(false)
        expect(output.installmentPayment.reasonNotPossible).toEqual("ALREADY_PAID")
      })
    })
  })
})
