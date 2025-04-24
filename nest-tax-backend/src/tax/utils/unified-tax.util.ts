import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import {
  ErrorsEnum,
  ErrorsResponseEnum,
} from '../../utils/guards/dtos/error.dto'
import { PaymentService } from '../../payment/payment.service'
import dayjs from 'dayjs'
import { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

type OneTimePaymentDetails = {
  // Jednorázová platba
  isPossible: boolean // Je jednorázová platba možná. False len ak je plná suma splatená.
  type?: 'ONE_TIME_PAYMENT' | 'REMAINING_AMOUNT_PAYMENT'
  reasonNotPossible?: 'ALREADY_PAID' // Dôvod ak nie je možná
  amount?: number // Suma
  qrCode?: string // Qr kód
  variableSymbol?: string // Variabilný symbol
  paymentGatewayLink?: string // Link na platobnú bránu TODO: len ak type == 'ONE_TIME_PAYMENT'
}

type InstallmentPaymentDetail = {
  // Splátkové platby
  isPossible: boolean // Je splátková platba možná
  reasonNotPossible?: 'BELOW_THRESHOLD' | 'AFTER_DATE' // Dôvod ak nie je možná
  installments?: [
    // Exactly 3 installments or none at all
    {
      installmentNumber: 1 // Prvá splátka
      dueDate?: Date // Dátum splatnosti
      status: 'PAID' | 'UNPAID' | 'PARTIAL' // Stav
      paidAmount: number // Uhradená suma zo splátky
      remainingAmount: number // Zostávajúca suma zo splátky
      variableSymbol?: string // Variabilný symbol
      qrCode?: string // QR kód
    },
    {
      installmentNumber: 2 // Druhá splátka
      dueDate: Date // Dátum splatnosti
      status: 'PAID' | 'UNPAID' | 'PARTIAL' // Stav
      paidAmount: number // Uhradená suma zo splátky
      remainingAmount: number // Zostávajúca suma zo splátky
      variableSymbol?: string // Variabilný symbol
      qrCode?: string // QR kód
    },
    {
      installmentNumber: 3 // Tretia splátka
      dueDate: Date // Dátum splatnosti
      status: 'PAID' | 'UNPAID' | 'PARTIAL' // Stav
      paidAmount: number // Uhradená suma zo splátky
      remainingAmount: number // Zostávajúca suma zo splátky
      variableSymbol?: string // Variabilný symbol
      qrCode?: string // QR kód
    },
  ]
}

export type TaxSummaryDetail = {
  overallPaid: number // Celkovo uhradené
  overallBalance: number // Celkovo zostatok
  overallOverpayment: number // Celkovo preplatok
  overallAmount: number // Celková daň
  oneTimePayment: OneTimePaymentDetails
  installmentPayment: InstallmentPaymentDetail
}

export const validateTaxDetail = (tax_detail: TaxSummaryDetail): undefined => {
  const errors: string[] = []

  // Validate overall summary
  if (tax_detail.overallPaid < 0) {
    errors.push('Overall paid amount cannot be negative.')
  }
  if (tax_detail.overallBalance < 0) {
    errors.push('Overall balance cannot be negative.')
  }
  if (tax_detail.overallOverpayment < 0) {
    errors.push('Overall overpayment cannot be negative.')
  }
  if (tax_detail.overallAmount < 0) {
    errors.push('Overall amount cannot be negative.')
  }

  // Validate one-time payment
  const oneTimePayment = tax_detail.oneTimePayment
  if (oneTimePayment.isPossible) {
    const paymentTypeName =
      oneTimePayment.type === 'ONE_TIME_PAYMENT'
        ? 'One-time'
        : 'Remaining amount'
    if (oneTimePayment.type === undefined) {
      errors.push(`${paymentTypeName} payment type must be provided.`)
    }
    if (
      oneTimePayment.type === 'ONE_TIME_PAYMENT' &&
      !oneTimePayment.paymentGatewayLink
    ) {
      errors.push(`${paymentTypeName} payment must include paymentGatewayLink.`)
    }
    if (
      oneTimePayment.type === 'REMAINING_AMOUNT_PAYMENT' &&
      oneTimePayment.paymentGatewayLink
    ) {
      errors.push(
        'Remaining amount payment must not include paymentGatewayLink.',
      )
    }
    if (oneTimePayment.amount === undefined) {
      errors.push(`${paymentTypeName} payment amount must be provideded.`)
    } else if (oneTimePayment.amount <= 0) {
      errors.push(
        `${paymentTypeName} payment amount must be greater or equal 0.`,
      )
    }
    if (!oneTimePayment.qrCode) {
      errors.push('QR Code must be provided for one-time payments.')
    }
    if (!oneTimePayment.paymentGatewayLink) {
      errors.push(
        'Payment gateway link must be provided for one-time payments.',
      )
    }
  } else {
    if (!oneTimePayment.reasonNotPossible) {
      errors.push(
        'Reason must be provided when a one-time payment is not possible.',
      )
    }
  }

  // Validate installment payment
  const installmentPayment = tax_detail.installmentPayment
  if (installmentPayment.isPossible) {
    if (!installmentPayment.installments) {
      errors.push(
        'Exactly 3 installments must be provided when installment payments are possible.',
      )
    } else {
      if (installmentPayment.installments.length !== 3) {
        errors.push(
          'Exactly 3 installments must be provided when installment payments are possible.',
        )
      }
      installmentPayment.installments.forEach((installment) => {
        if (installment.paidAmount < 0) {
          errors.push(
            `Installment ${installment.installmentNumber}: Paid amount cannot be negative.`,
          )
        }
        if (installment.remainingAmount < 0) {
          errors.push(
            `Installment ${installment.installmentNumber}: Remaining amount cannot be negative.`,
          )
        }
        if (!installment.dueDate) {
          errors.push(
            `Installment ${installment.installmentNumber}: Due date must be provided.`,
          )
        }
        if (!installment.qrCode) {
          errors.push(
            `Installment ${installment.installmentNumber}: QR Code must be provided.`,
          )
        }
        if (!installment.variableSymbol) {
          errors.push(
            `Installment ${installment.installmentNumber}: Variable symbol must be provided.`,
          )
        }
      })
    }
  } else {
    if (installmentPayment.installments.length !== 0) {
      errors.push(
        'Installments should not exist when installment payments are not possible.',
      )
    }
    if (!installmentPayment.reasonNotPossible) {
      errors.push(
        'Reason must be provided when installment payments are not possible.',
      )
    }
  }

  const throwerErrorGuard = new ThrowerErrorGuard()

  throw throwerErrorGuard.InternalServerErrorException(
    ErrorsEnum.INTERNAL_SERVER_ERROR,
    ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
    errors.join('\n'),
  )
}

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

const calculateDueDate = (dateOfValidity: Date | undefined) => {
  if (!dateOfValidity) return undefined

  const dueDateBase = dayjs(dateOfValidity).add(20, 'day')
  const dueDate = getNextWorkingDay(dueDateBase)

  return dueDate.toDate()
}

const calculateInstallmentAmounts = (
  overallAmount: number,
  overallPaid: number,
) => {
  const truncatedThird = ~~(overallAmount / 3)
  const firstTotal = overallAmount - 2 * truncatedThird

  if (overallPaid === 0)
    return [{toPay: firstTotal, paid: 0}, {toPay: truncatedThird, paid: 0}, {toPay: truncatedThird, paid: 0}]

  if (overallPaid <= firstTotal)
    return [{toPay: firstTotal - overallPaid, paid: overallPaid}, {toPay: truncatedThird, paid: 0}, {toPay: truncatedThird, paid: 0}]

  if (overallPaid <= firstTotal + truncatedThird)
    return [{toPay: 0, paid: firstTotal}, {toPay: firstTotal + truncatedThird - overallPaid, paid: overallPaid - firstTotal}, {toPay: truncatedThird, paid: 0}]

  return [{toPay: 0, paid: firstTotal}, {toPay: 0, paid: truncatedThird}, {toPay:overallAmount - overallPaid, paid: overallPaid - firstTotal - truncatedThird }]
}

export const get_tax_detail = (
  overallPaid: number, // zaplatená suma
  taxYear: number, // daňový rok
  today: Date, // aktuálny dátum
  overallAmount: number, // suma na zaplatenie
  payment_calendar_threshold: number, // splátková hranica (66 Eur)
  variableSymbol: string,
  dateOfValidity?: Date, // dátum právoplatnosti
): TaxSummaryDetail => {
  const overallBalance =
    overallAmount - overallPaid > 0 ? overallAmount - overallPaid : 0
  const overallOverpayment =
    overallPaid - overallAmount > 0 ? overallPaid - overallAmount : 0

  const oneTimePayment: OneTimePaymentDetails = {
    isPossible: true,
    type: overallPaid > 0 ? 'REMAINING_AMOUNT_PAYMENT' : 'ONE_TIME_PAYMENT',
    amount: overallBalance,
    qrCode: new PaymentService().getQrCodeByTaxUuid(),
    variableSymbol: 'TODO',
    paymentGatewayLink: 'TODO',
  }

  const installmentPayment: InstallmentPaymentDetail = { isPossible: false }

  const novemberFirst = new Date(taxYear, 10, 1)

  const installmentAmounts = calculateInstallmentAmounts(
    overallAmount,
    overallPaid,
  )

  if (today < novemberFirst) {
    installmentPayment.reasonNotPossible = 'AFTER_DATE'
  }
  if (overallBalance > 6600) {
    installmentPayment.reasonNotPossible = 'BELOW_THRESHOLD'
  } else {
    const fistPaymentDueDate = calculateDueDate(dateOfValidity)

    installmentPayment.isPossible = true
    installmentPayment.installments = [
      {
        installmentNumber: 1,
        dueDate: fistPaymentDueDate,
        status: undefined,
        paidAmount: installmentAmounts[0].paid,
        remainingAmount: installmentAmounts[0].toPay,
        variableSymbol: undefined,
        qrCode: undefined,
      },
      {
        installmentNumber:2,
        dueDate:dayjs.tz(`${dayjs().year()}-31-08`, bratislavaTimeZone).toDate(),
        status:undefined,
        paidAmount: installmentAmounts[1].paid,
        remainingAmount: installmentAmounts[1].toPay,
        variableSymbol:undefined,
        qrCode:undefined,
      },
      {
        installmentNumber:3,
        dueDate:dayjs.tz(`${dayjs().year()}-31-10`, bratislavaTimeZone).toDate(),
        status:undefined,
        paidAmount: installmentAmounts[2].paid,
        remainingAmount: installmentAmounts[2].toPay,
        variableSymbol:undefined,
        qrCode:undefined,
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
