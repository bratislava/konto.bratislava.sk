import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import {
  InstallmentPaidStatusEnum,
  InstallmentPaymentReasonNotPossibleEnum,
  OneTimePaymentReasonNotPossibleEnum,
  OneTimePaymentTypeEnum,
  ResponseInstallmentPaymentDetailDto,
  ResponseOneTimePaymentDetailsDto,
  ResponseTaxSummaryDetailDto,
} from '../dtos/response.tax.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../dtos/error.dto'

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
  return getNextWorkingDay(dueDateBase)
}

const calculateInstallmentAmounts = (
  installments: { order: string | null; amount: number }[],
  overallPaid: number,
): { toPay: number; paid: number; status: InstallmentPaidStatusEnum }[] => {
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
        ? InstallmentPaidStatusEnum.PAID
        : toPay === amount
          ? InstallmentPaidStatusEnum.NOT_PAID
          : InstallmentPaidStatusEnum.PARTIALLY_PAID

    return { toPay, paid, status }
  })
}

const calculateInstallmentPaymentDetails = (
  overallAmount: number,
  overallPaid: number,
  today: Date,
  taxYear: number,
  payment_calendar_threshold: string,
  dateOfValidity: Date | null,
  installments: { order: string | null; amount: number }[],
): ResponseInstallmentPaymentDetailDto => {
  const installmentPayment: ResponseInstallmentPaymentDetailDto = {
    isPossible: false,
  }

  const novemberFirst = dayjs(
    new Date(`${taxYear}-${payment_calendar_threshold}`),
  )

  if (dayjs(today) >= novemberFirst) {
    installmentPayment.reasonNotPossible =
      InstallmentPaymentReasonNotPossibleEnum.AFTER_DUE_DATE
  }
  if (overallAmount < 6600) {
    installmentPayment.reasonNotPossible =
      InstallmentPaymentReasonNotPossibleEnum.BELOW_THRESHOLD
  }
  if (overallAmount - overallPaid <= 0) {
    installmentPayment.reasonNotPossible =
      InstallmentPaymentReasonNotPossibleEnum.ALREADY_PAID
  } else {
    const fistPaymentDueDate = calculateDueDate(dateOfValidity)

    const installmentAmounts = calculateInstallmentAmounts(
      installments,
      overallPaid,
    )

    installmentPayment.isPossible = true
    if (fistPaymentDueDate && fistPaymentDueDate > dayjs(today)) {
      installmentPayment.installments = [
        {
          installmentNumber: 1,
          dueDate: fistPaymentDueDate.toDate(),
          status: installmentAmounts[0].status,
          remainingAmount: installmentAmounts[0].toPay,
        },
        {
          installmentNumber: 2,
          dueDate: dayjs
            .tz(`${dayjs().year()}-31-08`, bratislavaTimeZone)
            .toDate(),
          status: installmentAmounts[1].status,
          remainingAmount: installmentAmounts[1].toPay,
        },
        {
          installmentNumber: 3,
          dueDate: dayjs
            .tz(`${dayjs().year()}-31-10`, bratislavaTimeZone)
            .toDate(),
          status: installmentAmounts[2].status,
          remainingAmount: installmentAmounts[2].toPay,
        },
      ]
    } else {
      installmentPayment.installments = [
        {
          installmentNumber: 1,
          dueDate: fistPaymentDueDate?.toDate(),
          status: InstallmentPaidStatusEnum.AFTER_DUE_DATE,
          remainingAmount: 0,
        },
        {
          installmentNumber: 2,
          dueDate: dayjs
            .tz(`${dayjs().year()}-31-08`, bratislavaTimeZone)
            .toDate(),
          status: installmentAmounts[1].status,
          remainingAmount:
            installmentAmounts[1].toPay + installmentAmounts[0].toPay,
        },
        {
          installmentNumber: 3,
          dueDate: dayjs
            .tz(`${dayjs().year()}-31-10`, bratislavaTimeZone)
            .toDate(),
          status: installmentAmounts[2].status,
          remainingAmount: installmentAmounts[2].toPay,
        },
      ]
    }
  }
  return installmentPayment
}

const calculateOneTimePaymentDetails = (
  overallPaid: number,
  overallBalance: number,
  dueDate: Date | undefined,
  variableSymbol: string,
): ResponseOneTimePaymentDetailsDto => {
  if (overallBalance === 0) {
    return {
      isPossible: false,
      reasonNotPossible: OneTimePaymentReasonNotPossibleEnum.ALREADY_PAID,
    }
  }
  return {
    isPossible: true,
    type:
      overallPaid > 0
        ? OneTimePaymentTypeEnum.REMAINING_AMOUNT_PAYMENT
        : OneTimePaymentTypeEnum.ONE_TIME_PAYMENT,
    amount: overallBalance,
    dueDate: dueDate,
    variableSymbol,
  }
}

export const getTaxDetailPure = (
  overallPaid: number, // zaplatená suma
  taxYear: number, // daňový rok
  today: Date, // aktuálny dátum
  overallAmount: number, // suma na zaplatenie
  payment_calendar_threshold: string, // splátková hranica (66 Eur)
  variableSymbol: string,
  dateOfValidity: Date | null, // dátum právoplatnosti
  installments: { order: string | null; amount: number }[],
): Omit<ResponseTaxSummaryDetailDto, 'itemizedDetail'> => {
  const overallBalance =
    overallAmount - overallPaid > 0 ? overallAmount - overallPaid : 0

  const overallOverpayment =
    overallPaid - overallAmount > 0 ? overallPaid - overallAmount : 0

  const dueDate = calculateDueDate(dateOfValidity)

  const oneTimePayment: ResponseOneTimePaymentDetailsDto =
    calculateOneTimePaymentDetails(
      overallPaid,
      overallBalance,
      dueDate?.toDate(),
      variableSymbol,
    )

  const installmentPayment = calculateInstallmentPaymentDetails(
    overallAmount,
    overallPaid,
    today,
    taxYear,
    payment_calendar_threshold,
    dateOfValidity,
    installments,
  )

  return {
    overallPaid,
    overallBalance,
    overallOverpayment,
    overallAmount,
    oneTimePayment,
    installmentPayment,
  }
}
