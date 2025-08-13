import { PaymentStatus, TaxDetail } from '@prisma/client'
import dayjs, { Dayjs } from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { PaymentGateURLGeneratorDto } from '../../payment/dtos/generator.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import {
  QrCodeGeneratorDto,
  QrPaymentNoteEnum,
} from '../../utils/subservices/dtos/qrcode.dto'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../dtos/error.dto'
import {
  InstallmentPaidStatusEnum,
  InstallmentPaymentReasonNotPossibleEnum,
  OneTimePaymentReasonNotPossibleEnum,
  OneTimePaymentTypeEnum,
  ResponseActiveInstallmentDto,
  ResponseInstallmentItemDto,
  ResponseInstallmentPaymentDetailDto,
  ResponseOneTimePaymentDetailsDto,
  ResponseTaxDetailItemizedDto,
} from '../dtos/response.tax.dto'
import { generateItemizedTaxDetail } from './helpers/tax.helper'

dayjs.extend(utc)
dayjs.extend(timezone)

type ReplaceQrCodeWithGeneratorDto<T extends object> = {
  [K in keyof T]: K extends 'qrCode' ? QrCodeGeneratorDto : T[K]
}

const bratislavaTimeZone = 'Europe/Bratislava'

export const stateHolidays = [
  {
    year: 2025,
    dates: [
      dayjs.tz('2025-01-01', bratislavaTimeZone),
      dayjs.tz('2025-01-06', bratislavaTimeZone),
      dayjs.tz('2025-04-18', bratislavaTimeZone),
      dayjs.tz('2025-04-21', bratislavaTimeZone),
      dayjs.tz('2025-05-01', bratislavaTimeZone),
      dayjs.tz('2025-05-08', bratislavaTimeZone),
      dayjs.tz('2025-07-05', bratislavaTimeZone),
      dayjs.tz('2025-08-29', bratislavaTimeZone),
      dayjs.tz('2025-09-15', bratislavaTimeZone),
      dayjs.tz('2025-11-01', bratislavaTimeZone),
      dayjs.tz('2025-11-17', bratislavaTimeZone),
      dayjs.tz('2025-12-24', bratislavaTimeZone),
      dayjs.tz('2025-12-25', bratislavaTimeZone),
      dayjs.tz('2025-12-26', bratislavaTimeZone),
    ],
  },
  {
    year: 2026,
    dates: [
      dayjs.tz('2026-01-01', bratislavaTimeZone),
      dayjs.tz('2026-01-06', bratislavaTimeZone),
      dayjs.tz('2026-04-02', bratislavaTimeZone),
      dayjs.tz('2026-04-06', bratislavaTimeZone),
      dayjs.tz('2026-05-01', bratislavaTimeZone),
      dayjs.tz('2026-05-08', bratislavaTimeZone),
      dayjs.tz('2026-07-05', bratislavaTimeZone),
      dayjs.tz('2026-08-29', bratislavaTimeZone),
      dayjs.tz('2026-09-15', bratislavaTimeZone),
      dayjs.tz('2026-11-01', bratislavaTimeZone),
      dayjs.tz('2026-11-17', bratislavaTimeZone),
      dayjs.tz('2026-12-24', bratislavaTimeZone),
      dayjs.tz('2026-12-25', bratislavaTimeZone),
      dayjs.tz('2026-12-26', bratislavaTimeZone),
    ],
  },
  {
    year: 2027,
    dates: [
      dayjs.tz('2027-01-01', bratislavaTimeZone),
      dayjs.tz('2027-01-06', bratislavaTimeZone),
      dayjs.tz('2027-04-26', bratislavaTimeZone),
      dayjs.tz('2027-04-29', bratislavaTimeZone),
      dayjs.tz('2027-05-01', bratislavaTimeZone),
      dayjs.tz('2027-05-08', bratislavaTimeZone),
      dayjs.tz('2027-07-05', bratislavaTimeZone),
      dayjs.tz('2027-08-29', bratislavaTimeZone),
      dayjs.tz('2027-09-15', bratislavaTimeZone),
      dayjs.tz('2027-11-01', bratislavaTimeZone),
      dayjs.tz('2027-11-17', bratislavaTimeZone),
      dayjs.tz('2027-12-24', bratislavaTimeZone),
      dayjs.tz('2027-12-25', bratislavaTimeZone),
      dayjs.tz('2027-12-26', bratislavaTimeZone),
    ],
  },
  {
    year: 2028,
    dates: [
      dayjs.tz('2028-01-01', bratislavaTimeZone),
      dayjs.tz('2028-01-06', bratislavaTimeZone),
      dayjs.tz('2028-04-14', bratislavaTimeZone),
      dayjs.tz('2028-04-17', bratislavaTimeZone),
      dayjs.tz('2028-05-01', bratislavaTimeZone),
      dayjs.tz('2028-05-08', bratislavaTimeZone),
      dayjs.tz('2028-07-05', bratislavaTimeZone),
      dayjs.tz('2028-08-29', bratislavaTimeZone),
      dayjs.tz('2028-09-15', bratislavaTimeZone),
      dayjs.tz('2028-11-01', bratislavaTimeZone),
      dayjs.tz('2028-11-17', bratislavaTimeZone),
      dayjs.tz('2028-12-24', bratislavaTimeZone),
      dayjs.tz('2028-12-25', bratislavaTimeZone),
      dayjs.tz('2028-12-26', bratislavaTimeZone),
    ],
  },
]

const secondPaymentDueDate = '09-01'
const thirdPaymentDueDate = '11-01'
const dueDateOffset = 21

const isStateHoliday = (date: Dayjs): boolean => {
  const year = date.year()
  const yearHolidays = stateHolidays.find((holiday) => holiday.year === year)

  if (!yearHolidays) {
    throw new ThrowerErrorGuard().InternalServerErrorException(
      CustomErrorTaxTypesEnum.STATE_HOLIDAY_NOT_EXISTS,
      CustomErrorTaxTypesResponseEnum.STATE_HOLIDAY_NOT_EXISTS,
    )
  }

  return yearHolidays.dates.some((holiday) => holiday.isSame(date, 'day'))
}

const ensureWorkingDay = (date: Dayjs): Dayjs => {
  let workingDay = date

  while (
    // Check if it's a weekend or a state holiday
    workingDay.day() === 6 || // Saturday
    workingDay.day() === 0 || // Sunday
    isStateHoliday(workingDay) // Holiday
  ) {
    // Move to the next day
    workingDay = workingDay.add(1, 'day')
  }

  return workingDay
}

const calculateDueDate = (dateOfValidity: Dayjs | null): Dayjs | undefined => {
  // We will not provide due date if date of validity for the first payment is not set.
  if (!dateOfValidity) {
    return undefined
  }

  // We add one more day to get midnight - start of the next day
  const dueDateBase = dateOfValidity
    .tz(bratislavaTimeZone)
    .startOf('day')
    .add(dueDateOffset, 'day')
  return ensureWorkingDay(dueDateBase)
}

const calculateInstallmentAmounts = (
  installments: { order: number; amount: number }[],
  overallPaid: number,
): { toPay: number; paid: number; status: InstallmentPaidStatusEnum }[] => {
  if (installments.length !== 3) {
    throw new ThrowerErrorGuard().InternalServerErrorException(
      CustomErrorTaxTypesEnum.INSTALLMENT_INCORRECT_COUNT,
      CustomErrorTaxTypesResponseEnum.INSTALLMENT_INCORRECT_COUNT,
    )
  }

  const amounts = [1, 2, 3].map((order) => {
    const installment = installments.find(
      (item) => item.order === order,
    )
    if (!installment) {
      throw new ThrowerErrorGuard().InternalServerErrorException(
        CustomErrorTaxTypesEnum.MISSING_INSTALLMENT_AMOUNTS,
        CustomErrorTaxTypesResponseEnum.MISSING_INSTALLMENT_AMOUNTS,
      )
    }
    return installment.amount
  })

  const result: {
    toPay: number
    paid: number
    status: InstallmentPaidStatusEnum
  }[] = []
  let remainingPaid = overallPaid

  amounts.forEach((amount) => {
    const paid = Math.min(amount, remainingPaid)
    const toPay = amount - paid

    let status
    if (toPay === 0) {
      status = InstallmentPaidStatusEnum.PAID
    } else if (toPay === amount) {
      status = InstallmentPaidStatusEnum.NOT_PAID
    } else {
      status = InstallmentPaidStatusEnum.PARTIALLY_PAID
    }

    result.push({ toPay, paid, status })
    remainingPaid -= paid
  })

  return result
}

const calculateInstallmentPaymentDetails = (options: {
  overallAmount: number
  overallPaid: number
  today: Date
  taxYear: number
  paymentCalendarThreshold: number
  dueDate?: Dayjs
  installments: { order: number; amount: number }[]
  variableSymbol: string
  specificSymbol: any
}): Omit<ResponseInstallmentPaymentDetailDto, 'activeInstallment'> & {
  activeInstallment?: ReplaceQrCodeWithGeneratorDto<ResponseActiveInstallmentDto>
} => {
  const {
    overallAmount,
    overallPaid,
    today,
    taxYear,
    paymentCalendarThreshold,
    dueDate,
    installments,
    variableSymbol,
    specificSymbol,
  } = options
  if (overallAmount - overallPaid <= 0) {
    return {
      isPossible: false,
      reasonNotPossible: InstallmentPaymentReasonNotPossibleEnum.ALREADY_PAID,
    }
  }

  // Midnight start of the next day
  const dueDateSecondPayment = dayjs.tz(
    `${taxYear}-${secondPaymentDueDate}`,
    bratislavaTimeZone,
  )
  const dueDateThirdPayment = dayjs.tz(
    `${taxYear}-${thirdPaymentDueDate}`,
    bratislavaTimeZone,
  )

  if (dayjs(today) > dueDateSecondPayment) {
    return {
      isPossible: false,
      reasonNotPossible: InstallmentPaymentReasonNotPossibleEnum.AFTER_DUE_DATE,
    }
  }

  if (overallAmount < paymentCalendarThreshold) {
    return {
      isPossible: false,
      reasonNotPossible:
        InstallmentPaymentReasonNotPossibleEnum.BELOW_THRESHOLD,
    }
  }

  const installmentAmounts = calculateInstallmentAmounts(
    installments,
    overallPaid,
  )

  const dueDateInFuture = !dueDate || dueDate > dayjs(today)
  const isFirstInstallmentLate =
    !dueDateInFuture &&
    installmentAmounts[0].status !== InstallmentPaidStatusEnum.PAID &&
    installmentAmounts[0].status !== InstallmentPaidStatusEnum.OVER_PAID

  const installmentDetails: ResponseInstallmentItemDto[] = [
    {
      installmentNumber: 1,
      dueDate: dueDate?.toDate(),
      status: isFirstInstallmentLate
        ? InstallmentPaidStatusEnum.AFTER_DUE_DATE
        : installmentAmounts[0].status,
      remainingAmount: isFirstInstallmentLate ? 0 : installmentAmounts[0].toPay,
    },
    {
      installmentNumber: 2,
      dueDate: dueDateSecondPayment.toDate(),
      status: isFirstInstallmentLate
        ? installmentAmounts[0].status
        : installmentAmounts[1].status,
      remainingAmount: isFirstInstallmentLate
        ? installmentAmounts[1].toPay + installmentAmounts[0].toPay
        : installmentAmounts[1].toPay,
    },
    {
      installmentNumber: 3,
      dueDate: dueDateThirdPayment.toDate(),
      status: installmentAmounts[2].status,
      remainingAmount: installmentAmounts[2].toPay,
    },
  ]

  const active = installmentDetails.find(
    (installment) =>
      installment.status === InstallmentPaidStatusEnum.NOT_PAID ||
      installment.status === InstallmentPaidStatusEnum.PARTIALLY_PAID,
  )

  // All valid reasons for no active payment should have been caught before
  //  the ` calculateInstallmentAmounts ` call
  if (!active) {
    throw new ThrowerErrorGuard().InternalServerErrorException(
      CustomErrorTaxTypesEnum.INSTALLMENT_UNEXPECTED_ERROR,
      CustomErrorTaxTypesResponseEnum.INSTALLMENT_UNEXPECTED_ERROR,
    )
  }

  let paymentNote
  if (active.installmentNumber === 1) {
    paymentNote = QrPaymentNoteEnum.QR_firstInstallment
  } else if (active.installmentNumber === 2) {
    paymentNote =
      installmentDetails[0].status === InstallmentPaidStatusEnum.AFTER_DUE_DATE
        ? QrPaymentNoteEnum.QR_firstSecondInstallment
        : QrPaymentNoteEnum.QR_secondInstallment
  } else {
    paymentNote = QrPaymentNoteEnum.QR_thirdInstallment
  }

  const activeInstallment = {
    remainingAmount: active.remainingAmount,
    variableSymbol,
    qrCode: {
      amount: active.remainingAmount,
      variableSymbol,
      specificSymbol,
      paymentNote,
    },
  }

  return {
    isPossible: true,
    installments: installmentDetails,
    activeInstallment,
  }
}

const calculateOneTimePaymentDetails = (options: {
  overallPaid: number
  overallBalance: number
  dueDate?: Date
  variableSymbol: string
  specificSymbol: string
}): ReplaceQrCodeWithGeneratorDto<ResponseOneTimePaymentDetailsDto> => {
  const {
    overallPaid,
    overallBalance,
    dueDate,
    variableSymbol,
    specificSymbol,
  } = options
  if (overallBalance <= 0) {
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
    dueDate,
    qrCode: {
      amount: overallBalance,
      variableSymbol,
      specificSymbol,
      paymentNote:
        overallPaid > 0
          ? QrPaymentNoteEnum.QR_remainingAmount
          : QrPaymentNoteEnum.QR_oneTimePay,
    },
    variableSymbol,
  }
}

export const getTaxDetailPure = (options: {
  taxYear: number // daňový rok
  today: Date // aktuálny dátum
  overallAmount: number // suma na zaplatenie
  paymentCalendarThreshold: number // splátková hranica (66 Eur)
  variableSymbol: string
  dateOfValidity: Date | null // dátum právoplatnosti
  installments: { order: number; amount: number }[]
  taxDetails: TaxDetail[]
  taxConstructions: number
  taxFlat: number
  taxLand: number
  specificSymbol: string
  taxPayments: {
    amount: number
    status: PaymentStatus
  }[]
}) => {
  const {
    taxYear,
    today,
    overallAmount,
    paymentCalendarThreshold,
    variableSymbol,
    dateOfValidity,
    installments,
    taxDetails,
    taxConstructions,
    taxFlat,
    taxLand,
    specificSymbol,
    taxPayments,
  } = options

  let overallPaid = 0
  taxPayments.forEach((payment) => {
    if (payment.status === PaymentStatus.SUCCESS) {
      overallPaid += payment.amount
    }
  })

  const overallBalance = Math.max(overallAmount - overallPaid, 0)

  const dateOfValidityDayjs = dateOfValidity ? dayjs(dateOfValidity) : null
  const dueDate = calculateDueDate(dateOfValidityDayjs)

  const oneTimePayment = calculateOneTimePaymentDetails({
    overallPaid,
    overallBalance,
    dueDate: dueDate?.toDate(),
    variableSymbol,
    specificSymbol,
  })

  const installmentPayment = calculateInstallmentPaymentDetails({
    overallAmount,
    overallPaid,
    today,
    taxYear,
    paymentCalendarThreshold,
    dueDate,
    installments,
    variableSymbol,
    specificSymbol,
  })

  const itemizedDetail: ResponseTaxDetailItemizedDto = {
    apartmentTotalAmount: taxFlat,
    groundTotalAmount: taxLand,
    constructionTotalAmount: taxConstructions,
    ...generateItemizedTaxDetail(taxDetails),
  }

  return {
    overallPaid,
    overallBalance,
    overallAmount,
    oneTimePayment,
    installmentPayment,
    itemizedDetail,
  }
}
export const getTaxDetailPureForOneTimeGenerator = (options: {
  taxId: number
  overallAmount: number // suma na zaplatenie
  taxPayments: {
    amount: number
    status: PaymentStatus
  }[]
}): PaymentGateURLGeneratorDto => {
  const { taxId, overallAmount, taxPayments } = options

  let overallPaid = 0
  taxPayments.forEach((payment) => {
    if (payment.status === PaymentStatus.SUCCESS) {
      overallPaid += payment.amount
    }
  })

  const overallBalance = Math.max(overallAmount - overallPaid, 0)

  if (overallBalance <= 0) {
    throw new ThrowerErrorGuard().UnprocessableEntityException(
      CustomErrorTaxTypesEnum.ALREADY_PAID,
      CustomErrorTaxTypesResponseEnum.ALREADY_PAID,
    )
  }

  const description =
    overallPaid === 0
      ? `Platba za dane pre BA s id dane ${taxId}`
      : `Platba zostatku za dane pre BA s id dane ${taxId}`

  return {
    amount: overallBalance,
    taxId,
    description,
  }
}

export const getTaxDetailPureForInstallmentGenerator = (options: {
  taxId: number
  taxYear: number
  today: Date
  overallAmount: number
  paymentCalendarThreshold: number
  variableSymbol: string
  dateOfValidity: Date | null
  installments: { order: number; amount: number }[]
  specificSymbol: string
  taxPayments: {
    amount: number
    status: PaymentStatus
  }[]
}): PaymentGateURLGeneratorDto => {
  const {
    taxId,
    taxYear,
    today,
    overallAmount,
    paymentCalendarThreshold,
    variableSymbol,
    dateOfValidity,
    installments,
    specificSymbol,
    taxPayments,
  } = options

  // Reuse the existing tax detail calculation
  const taxDetail = getTaxDetailPure({
    taxYear,
    today,
    overallAmount,
    paymentCalendarThreshold,
    variableSymbol,
    dateOfValidity,
    installments,
    taxDetails: [], // Not needed for payment generation
    taxConstructions: 0, // Not needed for payment generation
    taxFlat: 0, // Not needed for payment generation
    taxLand: 0, // Not needed for payment generation
    specificSymbol,
    taxPayments,
  })

  // Check if installment payment is possible
  if (
    !taxDetail.installmentPayment.isPossible ||
    !taxDetail.installmentPayment.activeInstallment ||
    !taxDetail.installmentPayment.installments
  ) {
    switch (taxDetail.installmentPayment.reasonNotPossible) {
      case InstallmentPaymentReasonNotPossibleEnum.ALREADY_PAID:
        throw new ThrowerErrorGuard().UnprocessableEntityException(
          CustomErrorTaxTypesEnum.ALREADY_PAID,
          CustomErrorTaxTypesResponseEnum.ALREADY_PAID,
        )

      case InstallmentPaymentReasonNotPossibleEnum.AFTER_DUE_DATE:
        throw new ThrowerErrorGuard().UnprocessableEntityException(
          CustomErrorTaxTypesEnum.AFTER_DUE_DATE,
          CustomErrorTaxTypesResponseEnum.AFTER_DUE_DATE,
        )

      case InstallmentPaymentReasonNotPossibleEnum.BELOW_THRESHOLD:
        throw new ThrowerErrorGuard().UnprocessableEntityException(
          CustomErrorTaxTypesEnum.BELOW_THRESHOLD,
          CustomErrorTaxTypesResponseEnum.BELOW_THRESHOLD,
        )

      default:
        throw new ThrowerErrorGuard().UnprocessableEntityException(
          CustomErrorTaxTypesEnum.INSTALLMENT_UNEXPECTED_ERROR,
          CustomErrorTaxTypesResponseEnum.INSTALLMENT_UNEXPECTED_ERROR,
        )
    }
  }

  // Find the active installment details
  const activeInstallmentInfo = taxDetail.installmentPayment.installments.find(
    (installment) =>
      installment.status === InstallmentPaidStatusEnum.NOT_PAID ||
      installment.status === InstallmentPaidStatusEnum.PARTIALLY_PAID,
  )

  if (!activeInstallmentInfo) {
    throw new ThrowerErrorGuard().InternalServerErrorException(
      CustomErrorTaxTypesEnum.INSTALLMENT_UNEXPECTED_ERROR,
      CustomErrorTaxTypesResponseEnum.INSTALLMENT_UNEXPECTED_ERROR,
    )
  }

  // Create description based on the installment status
  const description =
    activeInstallmentInfo.status === InstallmentPaidStatusEnum.PARTIALLY_PAID
      ? `Platba zostatku ${activeInstallmentInfo.installmentNumber}. splátky za dane pre BA s id dane ${taxId}`
      : `Platba ${activeInstallmentInfo.installmentNumber}. splátky za dane pre BA s id dane ${taxId}`

  return {
    amount: activeInstallmentInfo.remainingAmount,
    taxId,
    description,
  }
}
