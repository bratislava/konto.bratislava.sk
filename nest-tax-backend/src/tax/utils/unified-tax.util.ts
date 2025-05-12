import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import {
  InstallmentPaymentReasonNotPossibleEnum,
  OneTimePaymentTypeEnum,
  TaxPaidStatusEnum,
} from '../dtos/response.tax.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CustomErrorTaxTypesEnum, CustomErrorTaxTypesResponseEnum } from '../dtos/error.dto'

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
  // We will not provide due date if date of validity for the first payment is not set.
  if (!dateOfValidity) return undefined

  const dueDateBase = dayjs(dateOfValidity).add(20, 'day')
  const dueDate = getNextWorkingDay(dueDateBase)

  return dueDate.toDate()
}

const calculateInstallmentAmounts = (
  installments: { order: string | null; amount: number }[],
  overallPaid: number,
): { toPay: number; paid: number; status: TaxPaidStatusEnum }[] => {
  const amounts = [1, 2, 3].map(
    (order) =>
      installments.find((installment) => installment.order === order.toString())
        ?.amount,
  )

  if (!amounts.every((amount) => amount !== undefined)) {
    throw new ThrowerErrorGuard().InternalServerErrorException(
      CustomErrorTaxTypesEnum.MISSING_INSTALLMENT_AMOUNTS,
      CustomErrorTaxTypesResponseEnum.MISSING_INSTALLMENT_AMOUNTS,
    )
  }

  let remainingPaid = overallPaid
  return amounts.map((amount) => {
    const paid = Math.min(amount, remainingPaid)
    const toPay = amount - paid

    remainingPaid -= paid

    const status =
      toPay === 0
        ? TaxPaidStatusEnum.PAID
        : toPay === amount
          ? TaxPaidStatusEnum.NOT_PAID
          : TaxPaidStatusEnum.PARTIALLY_PAID

    return { toPay, paid, status }
  })
}

type InstallmentPaymentDetailWithQrCodeAndUrlArgs = {
  isPossible: boolean
  reasonNotPossible?: InstallmentPaymentReasonNotPossibleEnum
  installments?: [
    {
      installmentNumber: 1
      dueDate?: Date
      status: TaxPaidStatusEnum
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
      status: TaxPaidStatusEnum
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
      status: TaxPaidStatusEnum
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

type OneTimePaymentDetailsWithQrCodeAndUrlArgs = {
  isPossible: boolean
  type?: OneTimePaymentTypeEnum
  reasonNotPossible?: InstallmentPaymentReasonNotPossibleEnum.ALREADY_PAID
  amount?: number
  dueDate?: Date
  qrCodeArgs?: {
    amount: number
    variableSymbol: string
    specificSymbol: string
  }
  variableSymbol?: string
}

// Modified version of TaxSummaryDetail with qrCodeArgs instead of qrCode
type TaxSummaryDetailWithQrCodeAndUrlArgs = {
  overallPaid: number
  overallBalance: number
  overallOverpayment: number
  overallAmount: number
  oneTimePayment: OneTimePaymentDetailsWithQrCodeAndUrlArgs
  installmentPayment: InstallmentPaymentDetailWithQrCodeAndUrlArgs
}

export const getTaxDetailWithoutQrAndUrl = (
  overallPaid: number, // zaplatená suma
  taxYear: number, // daňový rok
  today: Date, // aktuálny dátum
  overallAmount: number, // suma na zaplatenie
  payment_calendar_threshold: string, // splátková hranica (66 Eur)
  variableSymbol: string,
  dateOfValidity: Date | null, // dátum právoplatnosti
  installments: { order: string | null; amount: number }[],
): TaxSummaryDetailWithQrCodeAndUrlArgs => {
  const overallBalance =
    overallAmount - overallPaid > 0 ? overallAmount - overallPaid : 0

  const overallOverpayment =
    overallPaid - overallAmount > 0 ? overallPaid - overallAmount : 0

  const dueDate = calculateDueDate(dateOfValidity)

  const oneTimePayment: OneTimePaymentDetailsWithQrCodeAndUrlArgs = {
    isPossible: true,
    type:
      overallPaid > 0
        ? OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
        : OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT,
    amount: overallBalance,
    dueDate: dueDate,
    qrCodeArgs: {
      amount: overallBalance,
      variableSymbol: variableSymbol,
      specificSymbol: '2024200000',
    },
    variableSymbol,
  }

  const installmentPayment: InstallmentPaymentDetailWithQrCodeAndUrlArgs = {
    isPossible: false,
  }

  const novemberFirst = new Date(`${taxYear}-${payment_calendar_threshold}`)

  const installmentAmounts = calculateInstallmentAmounts(
    installments,
    overallPaid,
  )

  if (today < novemberFirst) {
    installmentPayment.reasonNotPossible =
      InstallmentPaymentReasonNotPossibleEnum.AFTER_DATE
  }
  if (overallBalance > 6600) {
    installmentPayment.reasonNotPossible =
      InstallmentPaymentReasonNotPossibleEnum.BELOW_THRESHOLD
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
