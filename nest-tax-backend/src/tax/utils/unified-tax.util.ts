import { PaymentStatus, TaxType } from '@prisma/client'
import dayjs, { Dayjs } from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { PaymentGateURLGeneratorDto } from '../../payment/dtos/generator.dto'
import { getTaxDefinitionByType } from '../../tax-definitions/getTaxDefinitionByType'
import {
  GetTaxDetailPureOptions,
  GetTaxDetailPureResponse,
  ReplaceQrCodeWithGeneratorDto,
  TaxTypeToResponseDetailItemizedDto,
} from '../../tax-definitions/taxDefinitionsTypes'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { QrPaymentNoteEnum } from '../../utils/subservices/dtos/qrcode.dto'
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
} from '../dtos/response.tax.dto'

dayjs.extend(utc)
dayjs.extend(timezone)

const bratislavaTimeZone = 'Europe/Bratislava'

const INSTALLMENT_TO_QR_NOTE: Record<number, QrPaymentNoteEnum> = {
  1: QrPaymentNoteEnum.QR_firstInstallment,
  2: QrPaymentNoteEnum.QR_secondInstallment,
  3: QrPaymentNoteEnum.QR_thirdInstallment,
  4: QrPaymentNoteEnum.QR_fourthInstallment,
}

export const stateHolidays = [
  {
    year: 2023,
    dates: [
      dayjs.tz('2023-01-01', bratislavaTimeZone),
      dayjs.tz('2023-01-06', bratislavaTimeZone),
      dayjs.tz('2023-04-07', bratislavaTimeZone),
      dayjs.tz('2023-04-10', bratislavaTimeZone),
      dayjs.tz('2023-05-01', bratislavaTimeZone),
      dayjs.tz('2023-05-08', bratislavaTimeZone),
      dayjs.tz('2023-07-05', bratislavaTimeZone),
      dayjs.tz('2023-08-29', bratislavaTimeZone),
      dayjs.tz('2023-09-01', bratislavaTimeZone),
      dayjs.tz('2023-09-15', bratislavaTimeZone),
      dayjs.tz('2023-11-01', bratislavaTimeZone),
      dayjs.tz('2023-11-17', bratislavaTimeZone),
      dayjs.tz('2023-12-24', bratislavaTimeZone),
      dayjs.tz('2023-12-25', bratislavaTimeZone),
      dayjs.tz('2023-12-26', bratislavaTimeZone),
    ],
  },
  {
    year: 2024,
    dates: [
      dayjs.tz('2024-01-01', bratislavaTimeZone),
      dayjs.tz('2024-01-06', bratislavaTimeZone),
      dayjs.tz('2024-03-29', bratislavaTimeZone),
      dayjs.tz('2024-04-01', bratislavaTimeZone),
      dayjs.tz('2024-05-01', bratislavaTimeZone),
      dayjs.tz('2024-05-08', bratislavaTimeZone),
      dayjs.tz('2024-07-05', bratislavaTimeZone),
      dayjs.tz('2024-08-29', bratislavaTimeZone),
      dayjs.tz('2024-09-15', bratislavaTimeZone),
      dayjs.tz('2024-11-01', bratislavaTimeZone),
      dayjs.tz('2024-11-17', bratislavaTimeZone),
      dayjs.tz('2024-12-24', bratislavaTimeZone),
      dayjs.tz('2024-12-25', bratislavaTimeZone),
      dayjs.tz('2024-12-26', bratislavaTimeZone),
    ],
  },
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

/**
 * Calculates installment payment amounts and their statuses based on overall paid amount.
 *
 * IMPORTANT: The sum of all installments should always equal the total tax amount.
 * This function distributes payments sequentially across installments (1st, then 2nd, then 3rd, then 4th).
 */
const calculateInstallmentAmounts = (
  installments: { order: number; amount: number }[],
  overallPaid: number,
  numberOfInstallments: number,
) => {
  if (installments.length !== numberOfInstallments) {
    throw new ThrowerErrorGuard().InternalServerErrorException(
      CustomErrorTaxTypesEnum.INSTALLMENT_INCORRECT_COUNT,
      CustomErrorTaxTypesResponseEnum.INSTALLMENT_INCORRECT_COUNT,
    )
  }

  const installmentOrders = Array.from(
    { length: numberOfInstallments },
    (_, i) => i + 1,
  )
  const amounts = installmentOrders.map((order) => {
    const installment = installments.find((item) => item.order === order)
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
    total: number
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

    result.push({ toPay, paid, total: amount, status })
    remainingPaid -= paid
  })

  return result
}

/**
 * Determines installment statuses based on due dates and payment status.
 * Each installment is independent and pays one after another.
 */
const calculateInstallmentStatus = (
  today: Date,
  installmentAmounts: {
    toPay: number
    paid: number
    total: number
    status: InstallmentPaidStatusEnum
  }[],
  installmentDueDates: [
    dayjs.Dayjs | undefined,
    dayjs.Dayjs,
    dayjs.Dayjs,
    ...dayjs.Dayjs[],
  ],
): {
  status: InstallmentPaidStatusEnum
  remainingAmount: number
}[] => {
  const installmentCount = installmentAmounts.length
  const result: {
    status: InstallmentPaidStatusEnum
    remainingAmount: number
  }[] = []

  for (let i = 0; i < installmentCount; i += 1) {
    const installmentDueDate = installmentDueDates[i]
    // If due date is undefined, we can't determine if it's late, so use the original status
    const isDueDateInFuture =
      installmentDueDate !== undefined && installmentDueDate > dayjs(today)
    const isLateInstallment =
      !isDueDateInFuture &&
      installmentAmounts[i].status !== InstallmentPaidStatusEnum.PAID &&
      installmentAmounts[i].status !== InstallmentPaidStatusEnum.OVER_PAID

    result.push({
      status: isLateInstallment
        ? InstallmentPaidStatusEnum.AFTER_DUE_DATE
        : installmentAmounts[i].status,
      remainingAmount: installmentAmounts[i].toPay,
    })
  }

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
  installmentDueDates: {
    second: string
    third: string
    fourth?: string
  }
  numberOfInstallments: number
  iban: string
}): Omit<ResponseInstallmentPaymentDetailDto, 'activeInstallment'> & {
  activeInstallment?: ReplaceQrCodeWithGeneratorDto<ResponseActiveInstallmentDto>
} => {
  const {
    overallAmount,
    overallPaid,
    today,
    taxYear,
    installmentDueDates,
    paymentCalendarThreshold,
    dueDate,
    installments,
    variableSymbol,
    numberOfInstallments,
    iban,
  } = options

  // Calculate due dates for all installments
  // First installment due date is calculated from dateOfValidity (may be undefined)
  const parseInstallmentDueDate = (dateString: string): Dayjs =>
    dayjs.tz(`${taxYear}-${dateString}`, bratislavaTimeZone)

  const installmentDueDatesParsed: [
    dayjs.Dayjs | undefined,
    dayjs.Dayjs,
    dayjs.Dayjs,
    ...dayjs.Dayjs[],
  ] = [
    // First installment due date is calculated from dateOfValidity
    dueDate,
    // Second installment:
    parseInstallmentDueDate(installmentDueDates.second),
    // Third installment:
    parseInstallmentDueDate(installmentDueDates.third),
    // Fourth installment (if exists):
    ...(installmentDueDates.fourth
      ? [parseInstallmentDueDate(installmentDueDates.fourth)]
      : []),
  ]

  const dueDateLastPayment = installmentDueDatesParsed.at(-1)
  if (!dueDateLastPayment) {
    throw new ThrowerErrorGuard().InternalServerErrorException(
      CustomErrorTaxTypesEnum.INSTALLMENT_UNEXPECTED_ERROR,
      CustomErrorTaxTypesResponseEnum.INSTALLMENT_UNEXPECTED_ERROR,
    )
  }

  if (overallAmount - overallPaid <= 0) {
    return {
      isPossible: false,
      reasonNotPossible: InstallmentPaymentReasonNotPossibleEnum.ALREADY_PAID,
      dueDateLastPayment: dueDateLastPayment.toDate(),
    }
  }

  if (dayjs(today) > dueDateLastPayment) {
    return {
      isPossible: false,
      reasonNotPossible: InstallmentPaymentReasonNotPossibleEnum.AFTER_DUE_DATE,
      dueDateLastPayment: dueDateLastPayment.toDate(),
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
    numberOfInstallments,
  )

  const installmentStatuses = calculateInstallmentStatus(
    today,
    installmentAmounts,
    installmentDueDatesParsed,
  )

  const installmentDetails: ResponseInstallmentItemDto[] =
    installmentStatuses.map((statusInfo, index) => ({
      installmentNumber: index + 1,
      dueDate: installmentDueDatesParsed[index]?.toDate(),
      status: statusInfo.status,
      remainingAmount: statusInfo.remainingAmount,
      totalInstallmentAmount: installmentAmounts[index].total,
    }))

  const active = installmentDetails.find(
    (installment) =>
      installment.status === InstallmentPaidStatusEnum.NOT_PAID ||
      installment.status === InstallmentPaidStatusEnum.PARTIALLY_PAID ||
      installment.status === InstallmentPaidStatusEnum.AFTER_DUE_DATE,
  )

  // All valid reasons for no active payment should have been caught before
  //  the ` calculateInstallmentAmounts ` call
  if (!active) {
    throw new ThrowerErrorGuard().InternalServerErrorException(
      CustomErrorTaxTypesEnum.INSTALLMENT_UNEXPECTED_ERROR,
      CustomErrorTaxTypesResponseEnum.INSTALLMENT_UNEXPECTED_ERROR,
    )
  }

  const paymentNote =
    INSTALLMENT_TO_QR_NOTE[active.installmentNumber] ??
    QrPaymentNoteEnum.QR_fourthInstallment

  const activeInstallment = {
    remainingAmount: active.remainingAmount,
    variableSymbol,
    qrCode: {
      amount: active.remainingAmount,
      variableSymbol,
      paymentNote,
      iban,
    },
  }

  return {
    isPossible: true,
    dueDateLastPayment: dueDateLastPayment.toDate(),
    installments: installmentDetails,
    activeInstallment,
  }
}

const calculateOneTimePaymentDetails = (options: {
  overallPaid: number
  overallBalance: number
  dueDate?: Date
  variableSymbol: string
  iban: string
}): ReplaceQrCodeWithGeneratorDto<ResponseOneTimePaymentDetailsDto> => {
  const { overallPaid, overallBalance, dueDate, variableSymbol, iban } = options
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
      paymentNote:
        overallPaid > 0
          ? QrPaymentNoteEnum.QR_remainingAmount
          : QrPaymentNoteEnum.QR_oneTimePay,
      iban,
    },
    variableSymbol,
  }
}

export const getTaxDetailPure = <TTaxType extends TaxType>(
  options: GetTaxDetailPureOptions<TTaxType>,
): GetTaxDetailPureResponse<TTaxType> => {
  const {
    type,
    taxYear,
    today,
    overallAmount,
    paymentCalendarThreshold,
    variableSymbol,
    dateOfValidity,
    installments,
    taxDetails,
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

  const taxDefinition = getTaxDefinitionByType(type)

  const oneTimePayment = calculateOneTimePaymentDetails({
    overallPaid,
    overallBalance,
    dueDate: dueDate?.toDate(),
    variableSymbol,
    iban: taxDefinition.iban,
  })

  const installmentPayment = calculateInstallmentPaymentDetails({
    overallAmount,
    overallPaid,
    today,
    taxYear,
    installmentDueDates: taxDefinition.installmentDueDates,
    paymentCalendarThreshold,
    dueDate,
    installments,
    variableSymbol,
    numberOfInstallments: taxDefinition.numberOfInstallments,
    iban: taxDefinition.iban,
  })

  const itemizedDetail: TaxTypeToResponseDetailItemizedDto[TTaxType] =
    taxDefinition.generateItemizedTaxDetail(taxDetails)

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
  overallAmount: number
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
  taxType: TaxType
  taxId: number
  taxYear: number
  today: Date
  overallAmount: number
  variableSymbol: string
  dateOfValidity: Date | null
  installments: { order: number; amount: number }[]
  taxPayments: {
    amount: number
    status: PaymentStatus
  }[]
}): PaymentGateURLGeneratorDto => {
  const {
    taxType,
    taxId,
    taxYear,
    today,
    overallAmount,
    variableSymbol,
    dateOfValidity,
    installments,
    taxPayments,
  } = options
  const {
    paymentCalendarThreshold,
    installmentDueDates,
    numberOfInstallments,
    iban,
  } = getTaxDefinitionByType(taxType)

  let overallPaid = 0
  taxPayments.forEach((payment) => {
    if (payment.status === PaymentStatus.SUCCESS) {
      overallPaid += payment.amount
    }
  })

  const dateOfValidityDayjs = dateOfValidity ? dayjs(dateOfValidity) : null
  const dueDate = calculateDueDate(dateOfValidityDayjs)

  const installmentPayment = calculateInstallmentPaymentDetails({
    overallAmount,
    overallPaid,
    today,
    taxYear,
    paymentCalendarThreshold,
    dueDate,
    installments,
    variableSymbol,
    installmentDueDates,
    numberOfInstallments,
    iban,
  })

  // Check if installment payment is possible
  if (
    !installmentPayment.isPossible ||
    !installmentPayment.activeInstallment ||
    !installmentPayment.installments
  ) {
    switch (installmentPayment.reasonNotPossible) {
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
  const activeInstallmentInfo = installmentPayment.installments.find(
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
  // data that goes to payment gateway should not contain diacritics
  const description =
    activeInstallmentInfo.status === InstallmentPaidStatusEnum.PARTIALLY_PAID
      ? `Platba zostatku ${activeInstallmentInfo.installmentNumber}. splatky za dane pre BA s id dane ${taxId}`
      : `Platba ${activeInstallmentInfo.installmentNumber}. splatky za dane pre BA s id dane ${taxId}`

  return {
    amount: activeInstallmentInfo.remainingAmount,
    taxId,
    description,
  }
}
