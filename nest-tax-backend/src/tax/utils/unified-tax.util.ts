import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const bratislavaTimeZone = 'Europe/Bratislava'

const stateHolidays: Dayjs[] = [
  dayjs.tz('2025-01-01', bratislavaTimeZone),
  dayjs.tz('2025-07-05', bratislavaTimeZone),
  dayjs.tz('2025-08-29', bratislavaTimeZone),
  dayjs.tz('2025-09-01', bratislavaTimeZone),
  dayjs.tz('2025-11-17', bratislavaTimeZone),
  dayjs.tz('2025-01-06', bratislavaTimeZone),
  dayjs.tz('2025-05-01', bratislavaTimeZone),
  dayjs.tz('2025-05-08', bratislavaTimeZone),
  dayjs.tz('2025-09-15', bratislavaTimeZone),
  dayjs.tz('2025-11-01', bratislavaTimeZone),
  dayjs.tz('2025-12-24', bratislavaTimeZone),
  dayjs.tz('2025-12-25', bratislavaTimeZone),
  dayjs.tz('2025-12-26', bratislavaTimeZone),
]

const isStateHoliday = (date: Dayjs): boolean => {
  return !!stateHolidays.find((holiday) => holiday.isSame(date, 'day'))
}

const getNextWorkingDay = (date: Dayjs): Dayjs => {
  const nextDay = date

  while (
    // Check if it's a weekend or a state holiday
    nextDay.day() === 6 || // Saturday
    nextDay.day() === 0 || // Sunday
    isStateHoliday(nextDay) // Holiday
  ) {
    // Move to the next day
    nextDay.add(1, 'day')
  }

  return nextDay
}

const calculateDueDate = (dateOfValidity: Date | null) => {
  if (!dateOfValidity) return undefined

  const dueDateBase = dayjs(dateOfValidity).add(20, 'day')
  const dueDate = getNextWorkingDay(dueDateBase)

  return dueDate.toDate()
}

const calculateInstallmentAmounts = (
  installments: { order: string | null; amount: number }[],
  overallPaid: number,
):
  | { toPay: number; paid: number; status: 'PAID' | 'UNPAID' | 'PARTIAL' }[]
  | null => {
  const amounts = [1, 2, 3].map(
    (order) =>
      installments.find((installment) => installment.order === order.toString())
        ?.amount,
  )

  if (!amounts.every((amount) => amount !== undefined)) {
    return null
  }

  let remainingPaid = overallPaid
  return amounts.map((amount) => {
    const paid = Math.min(amount, remainingPaid)
    const toPay = amount - paid

    remainingPaid -= paid

    const status =
      toPay === 0 ? 'PAID' : toPay === amount ? 'UNPAID' : 'PARTIAL'

    return { toPay, paid, status }
  })
}

type InstallmentPaymentDetailWithQrCodeArgs = {
  isPossible: boolean
  reasonNotPossible?: 'BELOW_THRESHOLD' | 'AFTER_DATE'
  installments?: [
    {
      installmentNumber: 1
      dueDate?: Date
      status: 'PAID' | 'UNPAID' | 'PARTIAL'
      paidAmount: number
      remainingAmount: number
      variableSymbol?: string
      qrCodeArgs?: {
        amount: number
        variableSymbol: string
        specificSymbol: string
      }
    },
    {
      installmentNumber: 2
      dueDate: Date
      status: 'PAID' | 'UNPAID' | 'PARTIAL'
      paidAmount: number
      remainingAmount: number
      variableSymbol?: string
      qrCodeArgs?: {
        amount: number
        variableSymbol: string
        specificSymbol: string
      }
    },
    {
      installmentNumber: 3
      dueDate: Date
      status: 'PAID' | 'UNPAID' | 'PARTIAL'
      paidAmount: number
      remainingAmount: number
      variableSymbol?: string
      qrCodeArgs?: {
        amount: number
        variableSymbol: string
        specificSymbol: string
      }
    },
  ]
}

type OneTimePaymentDetailsWithQrCodeArgs = {
  isPossible: boolean
  type?: 'ONE_TIME_PAYMENT' | 'REMAINING_AMOUNT_PAYMENT'
  reasonNotPossible?: 'ALREADY_PAID'
  amount?: number
  qrCodeArgs?: {
    amount: number
    variableSymbol: string
    specificSymbol: string
  }
  variableSymbol?: string
  paymentGatewayLink?: string
}

// Modified version of TaxSummaryDetail with qrCodeArgs instead of qrCode
type TaxSummaryDetailWithQrCodeArgs = {
  overallPaid: number
  overallBalance: number
  overallOverpayment: number
  overallAmount: number
  oneTimePayment: OneTimePaymentDetailsWithQrCodeArgs
  installmentPayment: InstallmentPaymentDetailWithQrCodeArgs
}

export const get_tax_detail = (
  overallPaid: number, // zaplatená suma
  taxYear: number, // daňový rok
  today: Date, // aktuálny dátum
  overallAmount: number, // suma na zaplatenie
  payment_calendar_threshold: string, // splátková hranica (66 Eur)
  variableSymbol: string,
  dateOfValidity: Date | null, // dátum právoplatnosti
  installments: { order: string | null; amount: number }[],
): TaxSummaryDetailWithQrCodeArgs => {
  const overallBalance =
    overallAmount - overallPaid > 0 ? overallAmount - overallPaid : 0

  const overallOverpayment =
    overallPaid - overallAmount > 0 ? overallPaid - overallAmount : 0

  const oneTimePayment: OneTimePaymentDetailsWithQrCodeArgs = {
    isPossible: true,
    type: overallPaid > 0 ? 'REMAINING_AMOUNT_PAYMENT' : 'ONE_TIME_PAYMENT',
    amount: overallBalance,
    qrCodeArgs: {
      amount: overallBalance,
      variableSymbol: variableSymbol,
      specificSymbol: '2024200000',
    },
    variableSymbol: 'TODO',
    paymentGatewayLink: 'TODO',
  }

  const installmentPayment: InstallmentPaymentDetailWithQrCodeArgs = {
    isPossible: false,
  }

  const novemberFirst = new Date(`${taxYear}-${payment_calendar_threshold}`)

  const installmentAmounts = calculateInstallmentAmounts(
    installments,
    overallPaid,
  )

  if (today < novemberFirst) {
    installmentPayment.reasonNotPossible = 'AFTER_DATE'
  }
  if (overallBalance > 6600) {
    installmentPayment.reasonNotPossible = 'BELOW_THRESHOLD'
  }
  if (installmentAmounts === null) {
    throw new Error('Installments invalid') // TODO better error
  } else {
    const fistPaymentDueDate = calculateDueDate(dateOfValidity)

    installmentPayment.isPossible = true
    installmentPayment.installments = [
      {
        installmentNumber: 1,
        dueDate: fistPaymentDueDate,
        status: installmentAmounts[0].status,
        paidAmount: installmentAmounts[0].paid,
        remainingAmount: installmentAmounts[0].toPay,
        variableSymbol,
        qrCodeArgs: {
          // TODO: placeholder
          amount: installmentAmounts[0].toPay,
          variableSymbol: variableSymbol,
          specificSymbol: '2024200000',
        },
      },
      {
        installmentNumber: 2,
        dueDate: dayjs
          .tz(`${dayjs().year()}-31-08`, bratislavaTimeZone)
          .toDate(),
        status: installmentAmounts[1].status,
        paidAmount: installmentAmounts[1].paid,
        remainingAmount: installmentAmounts[1].toPay,
        variableSymbol,
        qrCodeArgs: {
          amount: installmentAmounts[0].toPay,
          variableSymbol: variableSymbol,
          specificSymbol: '2024200000',
        },
      },
      {
        installmentNumber: 3,
        dueDate: dayjs
          .tz(`${dayjs().year()}-31-10`, bratislavaTimeZone)
          .toDate(),
        status: installmentAmounts[2].status,
        paidAmount: installmentAmounts[2].paid,
        remainingAmount: installmentAmounts[2].toPay,
        variableSymbol,
        qrCodeArgs: {
          amount: installmentAmounts[0].toPay,
          variableSymbol: variableSymbol,
          specificSymbol: '2024200000',
        },
      },
    ]
  }

  return {
    overallPaid,
    overallBalance,
    overallOverpayment,
    overallAmount,
    oneTimePayment,
    installmentPayment,
  }
}
