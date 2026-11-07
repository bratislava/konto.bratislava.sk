import { ErrorFactoryService } from '@bratislava/log-nest'
import { easter } from 'date-easter'

import {
  DeliveryMethodNamed,
  PaymentStatus,
  TaxType,
} from '../../generated/prisma/client'
import { PaymentGateURLGeneratorDto } from '../../payment/dtos/generator.dto'
import { QrPaymentNoteEnum } from '../../qrcode/dtos/qrcode.dto'
import { getTaxDefinitionByType } from '../../tax-definitions/getTaxDefinitionByType'
import {
  GetTaxDetailPureOptions,
  GetTaxDetailPureResponse,
  ReplaceQrCodeWithGeneratorDto,
  TaxTypeToResponseDetailItemizedDto,
} from '../../tax-definitions/taxDefinitionsTypes'
import alertReporting from '../../utils/constants/error.alerts'
import {
  isAfter,
  isWeekend,
  toBratislavaDateTime,
  toDate,
} from '../../utils/functions/temporal'
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

const INSTALLMENT_TO_QR_NOTE: Record<number, QrPaymentNoteEnum> = {
  1: QrPaymentNoteEnum.QR_firstInstallment,
  2: QrPaymentNoteEnum.QR_secondInstallment,
  3: QrPaymentNoteEnum.QR_thirdInstallment,
  4: QrPaymentNoteEnum.QR_fourthInstallment,
}

const getEasterSunday = (year: number): Temporal.PlainDate =>
  Temporal.PlainDate.from(easter(year))

const getGoodFriday = (year: number): Temporal.PlainDate =>
  getEasterSunday(year).subtract({ days: 2 })

const getEasterMonday = (year: number): Temporal.PlainDate =>
  getEasterSunday(year).add({ days: 1 })

export const stateHolidays: Partial<
  Record<number, { dates: Temporal.PlainDate[] }>
> = {
  2020: {
    dates: [
      Temporal.PlainDate.from('2020-01-01'),
      Temporal.PlainDate.from('2020-01-06'),
      getGoodFriday(2020),
      getEasterMonday(2020),
      Temporal.PlainDate.from('2020-05-01'),
      Temporal.PlainDate.from('2020-05-08'),
      Temporal.PlainDate.from('2020-07-05'),
      Temporal.PlainDate.from('2020-08-29'),
      Temporal.PlainDate.from('2020-09-01'),
      Temporal.PlainDate.from('2020-09-15'),
      Temporal.PlainDate.from('2020-11-01'),
      Temporal.PlainDate.from('2020-11-17'),
      Temporal.PlainDate.from('2020-12-24'),
      Temporal.PlainDate.from('2020-12-25'),
      Temporal.PlainDate.from('2020-12-26'),
    ],
  },
  2021: {
    dates: [
      Temporal.PlainDate.from('2021-01-01'),
      Temporal.PlainDate.from('2021-01-06'),
      getGoodFriday(2021),
      getEasterMonday(2021),
      Temporal.PlainDate.from('2021-05-01'),
      Temporal.PlainDate.from('2021-05-08'),
      Temporal.PlainDate.from('2021-07-05'),
      Temporal.PlainDate.from('2021-08-29'),
      Temporal.PlainDate.from('2021-09-01'),
      Temporal.PlainDate.from('2021-09-15'),
      Temporal.PlainDate.from('2021-11-01'),
      Temporal.PlainDate.from('2021-11-17'),
      Temporal.PlainDate.from('2021-12-24'),
      Temporal.PlainDate.from('2021-12-25'),
      Temporal.PlainDate.from('2021-12-26'),
    ],
  },
  2022: {
    dates: [
      Temporal.PlainDate.from('2022-01-01'),
      Temporal.PlainDate.from('2022-01-06'),
      getGoodFriday(2022),
      getEasterMonday(2022),
      Temporal.PlainDate.from('2022-05-01'),
      Temporal.PlainDate.from('2022-05-08'),
      Temporal.PlainDate.from('2022-07-05'),
      Temporal.PlainDate.from('2022-08-29'),
      Temporal.PlainDate.from('2022-09-01'),
      Temporal.PlainDate.from('2022-09-15'),
      Temporal.PlainDate.from('2022-11-01'),
      Temporal.PlainDate.from('2022-11-17'),
      Temporal.PlainDate.from('2022-12-24'),
      Temporal.PlainDate.from('2022-12-25'),
      Temporal.PlainDate.from('2022-12-26'),
    ],
  },
  2023: {
    dates: [
      Temporal.PlainDate.from('2023-01-01'),
      Temporal.PlainDate.from('2023-01-06'),
      getGoodFriday(2023),
      getEasterMonday(2023),
      Temporal.PlainDate.from('2023-05-01'),
      Temporal.PlainDate.from('2023-05-08'),
      Temporal.PlainDate.from('2023-07-05'),
      Temporal.PlainDate.from('2023-08-29'),
      Temporal.PlainDate.from('2023-09-01'),
      Temporal.PlainDate.from('2023-09-15'),
      Temporal.PlainDate.from('2023-11-01'),
      Temporal.PlainDate.from('2023-11-17'),
      Temporal.PlainDate.from('2023-12-24'),
      Temporal.PlainDate.from('2023-12-25'),
      Temporal.PlainDate.from('2023-12-26'),
    ],
  },
  2024: {
    dates: [
      Temporal.PlainDate.from('2024-01-01'),
      Temporal.PlainDate.from('2024-01-06'),
      getGoodFriday(2024),
      getEasterMonday(2024),
      Temporal.PlainDate.from('2024-05-01'),
      Temporal.PlainDate.from('2024-05-08'),
      Temporal.PlainDate.from('2024-07-05'),
      Temporal.PlainDate.from('2024-08-29'),
      Temporal.PlainDate.from('2024-09-15'),
      Temporal.PlainDate.from('2024-11-01'),
      Temporal.PlainDate.from('2024-11-17'),
      Temporal.PlainDate.from('2024-12-24'),
      Temporal.PlainDate.from('2024-12-25'),
      Temporal.PlainDate.from('2024-12-26'),
    ],
  },
  2025: {
    dates: [
      Temporal.PlainDate.from('2025-01-01'),
      Temporal.PlainDate.from('2025-01-06'),
      getGoodFriday(2025),
      getEasterMonday(2025),
      Temporal.PlainDate.from('2025-05-01'),
      Temporal.PlainDate.from('2025-05-08'),
      Temporal.PlainDate.from('2025-07-05'),
      Temporal.PlainDate.from('2025-08-29'),
      Temporal.PlainDate.from('2025-09-15'),
      Temporal.PlainDate.from('2025-11-01'),
      Temporal.PlainDate.from('2025-11-17'),
      Temporal.PlainDate.from('2025-12-24'),
      Temporal.PlainDate.from('2025-12-25'),
      Temporal.PlainDate.from('2025-12-26'),
    ],
  },
  2026: {
    dates: [
      Temporal.PlainDate.from('2026-01-01'),
      Temporal.PlainDate.from('2026-01-06'),
      getGoodFriday(2026),
      getEasterMonday(2026),
      Temporal.PlainDate.from('2026-05-01'),
      Temporal.PlainDate.from('2026-05-08'),
      Temporal.PlainDate.from('2026-07-05'),
      Temporal.PlainDate.from('2026-08-29'),
      Temporal.PlainDate.from('2026-09-15'),
      Temporal.PlainDate.from('2026-11-01'),
      Temporal.PlainDate.from('2026-11-17'),
      Temporal.PlainDate.from('2026-12-24'),
      Temporal.PlainDate.from('2026-12-25'),
      Temporal.PlainDate.from('2026-12-26'),
    ],
  },
  2027: {
    dates: [
      Temporal.PlainDate.from('2027-01-01'),
      Temporal.PlainDate.from('2027-01-06'),
      getGoodFriday(2027),
      getEasterMonday(2027),
      Temporal.PlainDate.from('2027-05-01'),
      Temporal.PlainDate.from('2027-05-08'),
      Temporal.PlainDate.from('2027-07-05'),
      Temporal.PlainDate.from('2027-08-29'),
      Temporal.PlainDate.from('2027-09-15'),
      Temporal.PlainDate.from('2027-11-01'),
      Temporal.PlainDate.from('2027-11-17'),
      Temporal.PlainDate.from('2027-12-24'),
      Temporal.PlainDate.from('2027-12-25'),
      Temporal.PlainDate.from('2027-12-26'),
    ],
  },
  2028: {
    dates: [
      Temporal.PlainDate.from('2028-01-01'),
      Temporal.PlainDate.from('2028-01-06'),
      getGoodFriday(2028),
      getEasterMonday(2028),
      Temporal.PlainDate.from('2028-05-01'),
      Temporal.PlainDate.from('2028-05-08'),
      Temporal.PlainDate.from('2028-07-05'),
      Temporal.PlainDate.from('2028-08-29'),
      Temporal.PlainDate.from('2028-09-15'),
      Temporal.PlainDate.from('2028-11-01'),
      Temporal.PlainDate.from('2028-11-17'),
      Temporal.PlainDate.from('2028-12-24'),
      Temporal.PlainDate.from('2028-12-25'),
      Temporal.PlainDate.from('2028-12-26'),
    ],
  },
}

export const DUE_DATE_OFFSET = 15

const isStateHoliday = (date: Temporal.ZonedDateTime): boolean => {
  const { year } = date
  const yearHolidays = stateHolidays[year]

  if (!yearHolidays) {
    throw new ErrorFactoryService({
      alertReporting,
    }).InternalServerErrorException({
      errorEnum: CustomErrorTaxTypesEnum.STATE_HOLIDAY_NOT_EXISTS,
      message: CustomErrorTaxTypesResponseEnum.STATE_HOLIDAY_NOT_EXISTS,
      console: { year, date: date.toString() },
    })
  }

  const plainDate = date.toPlainDate()
  return yearHolidays.dates.some((holiday) => holiday.equals(plainDate))
}

const ensureWorkingDay = (
  date: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime => {
  let workingDay = date

  while (isWeekend(workingDay) || isStateHoliday(workingDay)) {
    workingDay = workingDay.add({ days: 1 })
  }

  return workingDay
}

export const calculateDueDate = (
  dateOfValidity: Date | null,
  deliveryMethod: DeliveryMethodNamed | null,
  createdAt: Date,
): Temporal.ZonedDateTime | undefined => {
  if (deliveryMethod && deliveryMethod === DeliveryMethodNamed.CITY_ACCOUNT) {
    const dueDateBase = toBratislavaDateTime(createdAt)
      .startOfDay()
      .add({ days: DUE_DATE_OFFSET })
    return ensureWorkingDay(dueDateBase)
  }

  // We will not provide due date if date of validity for the first payment is not set.
  if (!dateOfValidity) {
    return undefined
  }

  // We add one more day to get midnight - start of the next day
  const dueDateBase = toBratislavaDateTime(dateOfValidity)
    .startOfDay()
    .add({ days: DUE_DATE_OFFSET })
  return ensureWorkingDay(dueDateBase)
}

/**
 * Calculates installment payment amounts and their statuses based on overall paid amount.
 *
 * IMPORTANT: The sum of all installments should always equal the total tax amount.
 * This function distributes payments sequentially across installments (1st, then 2nd, then 3rd, then 4th).
 */
export const calculateInstallmentAmounts = (
  installments: { order: number; amount: number }[],
  overallPaid: number,
  numberOfInstallments?: number,
  logContext?: Record<string, unknown>,
) => {
  if (installments.length === 0) {
    throw new ErrorFactoryService({
      alertReporting,
    }).InternalServerErrorException({
      errorEnum: CustomErrorTaxTypesEnum.INSTALLMENT_INCORRECT_COUNT,
      message: 'No installments found for the tax.',
      console: {
        ...logContext,
        expectedInstallmentCount: numberOfInstallments,
      },
    })
  }

  if (numberOfInstallments && installments.length !== numberOfInstallments) {
    throw new ErrorFactoryService({
      alertReporting,
    }).InternalServerErrorException({
      errorEnum: CustomErrorTaxTypesEnum.INSTALLMENT_INCORRECT_COUNT,
      message: CustomErrorTaxTypesResponseEnum.INSTALLMENT_INCORRECT_COUNT,
      console: {
        ...logContext,
        installmentCount: installments.length,
        expectedInstallmentCount: numberOfInstallments,
      },
    })
  }

  const installmentOrders = Array.from(
    { length: installments.length },
    (_, i) => i + 1,
  )
  const amounts = installmentOrders.map((order) => {
    const installment = installments.find((item) => item.order === order)
    if (!installment) {
      throw new ErrorFactoryService({
        alertReporting,
      }).InternalServerErrorException({
        errorEnum: CustomErrorTaxTypesEnum.MISSING_INSTALLMENT_AMOUNTS,
        message: CustomErrorTaxTypesResponseEnum.MISSING_INSTALLMENT_AMOUNTS,
        console: {
          ...logContext,
          missingOrder: order,
          installmentOrders: installments.map((item) => item.order),
        },
      })
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
 * Due dates aligned with UI installment rows: index 0 = validity-based first due date;
 * further indices = NORIS due dates for installments with order 2, 3, … (order 1 is omitted).
 */
type InstallmentDueDatesRow = [
  Temporal.ZonedDateTime | undefined,
  ...Temporal.ZonedDateTime[],
]

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
  installmentDueDates: InstallmentDueDatesRow,
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
      installmentDueDate === undefined || isAfter(installmentDueDate, today)
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

export const parseInstallmentDueDate = (
  dueDate: Date,
): Temporal.ZonedDateTime => toBratislavaDateTime(dueDate)

const findActiveInstallment = (
  installments: ResponseInstallmentItemDto[],
): ResponseInstallmentItemDto | undefined =>
  installments.find(
    (installment) =>
      installment.status === InstallmentPaidStatusEnum.NOT_PAID ||
      installment.status === InstallmentPaidStatusEnum.PARTIALLY_PAID ||
      installment.status === InstallmentPaidStatusEnum.AFTER_DUE_DATE,
  )

const calculateInstallmentPaymentDetails = (options: {
  overallAmount: number
  overallPaid: number
  today: Date
  paymentCalendarThreshold: number
  dueDate?: Temporal.ZonedDateTime
  installments: { order: number; amount: number; dueDate: Date }[]
  variableSymbol: string
  numberOfInstallments?: number
  iban: string
  isCancelled: boolean
  logContext?: Record<string, unknown>
}): Omit<ResponseInstallmentPaymentDetailDto, 'activeInstallment'> & {
  activeInstallment?: ReplaceQrCodeWithGeneratorDto<ResponseActiveInstallmentDto>
} => {
  const {
    overallAmount,
    overallPaid,
    today,
    paymentCalendarThreshold,
    dueDate,
    installments,
    variableSymbol,
    numberOfInstallments,
    iban,
    isCancelled,
    logContext,
  } = options

  if (overallAmount <= paymentCalendarThreshold) {
    return {
      isPossible: false,
      reasonNotPossible:
        InstallmentPaymentReasonNotPossibleEnum.BELOW_THRESHOLD,
    }
  }

  const installmentsByOrder = [...installments].sort(
    (a, b) => a.order - b.order,
  )

  if (installmentsByOrder.length === 1) {
    return {
      isPossible: false,
      reasonNotPossible:
        InstallmentPaymentReasonNotPossibleEnum.JUST_ONE_INSTALLMENT,
    }
  }

  const installmentDatesFromNoris = installmentsByOrder
    .slice(1) // Omit order 1 - this is the validity-based due date
    .map((installment) => parseInstallmentDueDate(installment.dueDate))
  const installmentDueDatesParsed: InstallmentDueDatesRow = [
    dueDate,
    ...installmentDatesFromNoris,
  ]

  const dueDateLastPayment =
    installmentDueDatesParsed[installmentDueDatesParsed.length - 1]
  if (!dueDateLastPayment) {
    throw new ErrorFactoryService({
      alertReporting,
    }).InternalServerErrorException({
      errorEnum: CustomErrorTaxTypesEnum.INSTALLMENT_UNEXPECTED_ERROR,
      message: CustomErrorTaxTypesResponseEnum.INSTALLMENT_UNEXPECTED_ERROR,
      console: {
        ...logContext,
        reason: 'Missing due date of the last installment',
        installmentCount: installmentsByOrder.length,
      },
    })
  }

  if (isCancelled) {
    return {
      isPossible: false,
      reasonNotPossible:
        InstallmentPaymentReasonNotPossibleEnum.TAX_IS_CANCELLED,
      dueDateLastPayment: toDate(dueDateLastPayment),
    }
  }

  if (overallAmount - overallPaid <= 0) {
    return {
      isPossible: false,
      reasonNotPossible: InstallmentPaymentReasonNotPossibleEnum.ALREADY_PAID,
      dueDateLastPayment: toDate(dueDateLastPayment),
    }
  }

  if (isAfter(today, dueDateLastPayment)) {
    return {
      isPossible: false,
      reasonNotPossible: InstallmentPaymentReasonNotPossibleEnum.AFTER_DUE_DATE,
      dueDateLastPayment: toDate(dueDateLastPayment),
    }
  }

  const installmentAmounts = calculateInstallmentAmounts(
    installments,
    overallPaid,
    numberOfInstallments,
    logContext,
  )

  const installmentStatuses = calculateInstallmentStatus(
    today,
    installmentAmounts,
    installmentDueDatesParsed,
  )

  const installmentDetails: ResponseInstallmentItemDto[] =
    installmentStatuses.map((statusInfo, index) => {
      const installmentDueDate = installmentDueDatesParsed[index]
      return {
        installmentNumber: index + 1,
        dueDate: installmentDueDate && toDate(installmentDueDate),
        status: statusInfo.status,
        remainingAmount: statusInfo.remainingAmount,
        totalInstallmentAmount: installmentAmounts[index].total,
      }
    })

  const active = findActiveInstallment(installmentDetails)

  // All valid reasons for no active payment should have been caught before
  //  the ` calculateInstallmentAmounts ` call
  if (!active) {
    throw new ErrorFactoryService({
      alertReporting,
    }).InternalServerErrorException({
      errorEnum: CustomErrorTaxTypesEnum.INSTALLMENT_UNEXPECTED_ERROR,
      message: CustomErrorTaxTypesResponseEnum.INSTALLMENT_UNEXPECTED_ERROR,
      console: {
        ...logContext,
        reason: 'No active installment',
        installmentStatuses: installmentDetails.map((item) => item.status),
      },
    })
  }

  const paymentNote =
    INSTALLMENT_TO_QR_NOTE[active.installmentNumber] ??
    QrPaymentNoteEnum.QR_fourthInstallment

  const activeInstallment = {
    remainingAmount: active.remainingAmount,
    variableSymbol,
    dueDate: active.dueDate,
    qrCode: {
      amount: active.remainingAmount,
      variableSymbol,
      paymentNote,
      iban,
    },
  }

  return {
    isPossible: true,
    dueDateLastPayment: toDate(dueDateLastPayment),
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
  isCancelled: boolean
}): ReplaceQrCodeWithGeneratorDto<ResponseOneTimePaymentDetailsDto> => {
  const {
    overallPaid,
    overallBalance,
    dueDate,
    variableSymbol,
    iban,
    isCancelled,
  } = options
  if (overallBalance <= 0) {
    return {
      isPossible: false,
      reasonNotPossible: OneTimePaymentReasonNotPossibleEnum.ALREADY_PAID,
    }
  }
  if (isCancelled) {
    return {
      isPossible: false,
      reasonNotPossible: OneTimePaymentReasonNotPossibleEnum.TAX_IS_CANCELLED,
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

/**
 * @param logContext - non-PII ids (e.g. taxId) attached to error logs
 */
export const getTaxDetailPure = <TTaxType extends TaxType>(
  options: GetTaxDetailPureOptions<TTaxType>,
  logContext?: Record<string, unknown>,
): GetTaxDetailPureResponse<TTaxType> => {
  const {
    type,
    today,
    overallAmount,
    paymentCalendarThreshold,
    variableSymbol,
    dateOfValidity,
    installments,
    taxDetails,
    taxPayments,
    deliveryMethod,
    createdAt,
    isCancelled,
  } = options

  let overallPaid = 0
  taxPayments.forEach((payment) => {
    if (payment.status === PaymentStatus.SUCCESS) {
      overallPaid += payment.amount
    }
  })

  const overallBalance = Math.max(overallAmount - overallPaid, 0)

  const dueDate = calculateDueDate(dateOfValidity, deliveryMethod, createdAt)

  const taxDefinition = getTaxDefinitionByType(type)

  const oneTimePayment = calculateOneTimePaymentDetails({
    overallPaid,
    overallBalance,
    dueDate: dueDate && toDate(dueDate),
    variableSymbol,
    iban: taxDefinition.iban,
    isCancelled,
  })

  const installmentPayment = calculateInstallmentPaymentDetails({
    overallAmount,
    overallPaid,
    today,
    paymentCalendarThreshold,
    dueDate,
    installments,
    variableSymbol,
    numberOfInstallments: taxDefinition.numberOfInstallments,
    iban: taxDefinition.iban,
    isCancelled,
    logContext,
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
  taxType: TaxType
  overallAmount: number
  taxPayments: {
    amount: number
    status: PaymentStatus
  }[]
}): PaymentGateURLGeneratorDto => {
  const { taxId, taxType, overallAmount, taxPayments } = options

  let overallPaid = 0
  taxPayments.forEach((payment) => {
    if (payment.status === PaymentStatus.SUCCESS) {
      overallPaid += payment.amount
    }
  })

  const overallBalance = Math.max(overallAmount - overallPaid, 0)

  if (overallBalance <= 0) {
    throw new ErrorFactoryService({
      alertReporting,
    }).UnprocessableEntityException({
      errorEnum: CustomErrorTaxTypesEnum.ALREADY_PAID,
      message: CustomErrorTaxTypesResponseEnum.ALREADY_PAID,
      console: { taxId, taxType },
    })
  }

  const description =
    overallPaid === 0
      ? `Platba za dane pre BA s id dane ${taxId}`
      : `Platba zostatku za dane pre BA s id dane ${taxId}`

  return {
    amount: overallBalance,
    taxId,
    description,
    taxType,
  }
}

export const getTaxDetailPureForInstallmentGenerator = (options: {
  taxType: TaxType
  taxId: number
  today: Date
  overallAmount: number
  variableSymbol: string
  dateOfValidity: Date | null
  installments: { order: number; amount: number; dueDate: Date }[]
  taxPayments: {
    amount: number
    status: PaymentStatus
  }[]
  deliveryMethod: DeliveryMethodNamed | null
  createdAt: Date
  isCancelled: boolean
}): PaymentGateURLGeneratorDto => {
  const {
    taxType,
    taxId,
    today,
    overallAmount,
    variableSymbol,
    dateOfValidity,
    installments,
    taxPayments,
    deliveryMethod,
    createdAt,
    isCancelled,
  } = options
  const { paymentCalendarThreshold, numberOfInstallments, iban } =
    getTaxDefinitionByType(taxType)

  let overallPaid = 0
  taxPayments.forEach((payment) => {
    if (payment.status === PaymentStatus.SUCCESS) {
      overallPaid += payment.amount
    }
  })

  const dueDate = calculateDueDate(dateOfValidity, deliveryMethod, createdAt)

  const installmentPayment = calculateInstallmentPaymentDetails({
    overallAmount,
    overallPaid,
    today,
    paymentCalendarThreshold,
    dueDate,
    installments,
    variableSymbol,
    numberOfInstallments,
    iban,
    isCancelled,
    logContext: { taxId, taxType },
  })

  const logContext = {
    taxId,
    taxType,
    reasonNotPossible: installmentPayment.reasonNotPossible,
  }

  // Check if installment payment is possible
  if (
    !installmentPayment.isPossible ||
    !installmentPayment.activeInstallment ||
    !installmentPayment.installments
  ) {
    switch (installmentPayment.reasonNotPossible) {
      case InstallmentPaymentReasonNotPossibleEnum.ALREADY_PAID:
        throw new ErrorFactoryService({
          alertReporting,
        }).UnprocessableEntityException({
          errorEnum: CustomErrorTaxTypesEnum.ALREADY_PAID,
          message: CustomErrorTaxTypesResponseEnum.ALREADY_PAID,
          console: logContext,
        })

      case InstallmentPaymentReasonNotPossibleEnum.AFTER_DUE_DATE:
        throw new ErrorFactoryService({
          alertReporting,
        }).UnprocessableEntityException({
          errorEnum: CustomErrorTaxTypesEnum.AFTER_DUE_DATE,
          message: CustomErrorTaxTypesResponseEnum.AFTER_DUE_DATE,
          console: logContext,
        })

      case InstallmentPaymentReasonNotPossibleEnum.BELOW_THRESHOLD:
        throw new ErrorFactoryService({
          alertReporting,
        }).UnprocessableEntityException({
          errorEnum: CustomErrorTaxTypesEnum.BELOW_THRESHOLD,
          message: CustomErrorTaxTypesResponseEnum.BELOW_THRESHOLD,
          console: logContext,
        })

      case InstallmentPaymentReasonNotPossibleEnum.TAX_IS_CANCELLED:
        throw new ErrorFactoryService({
          alertReporting,
        }).UnprocessableEntityException({
          errorEnum: CustomErrorTaxTypesEnum.TAX_IS_CANCELLED,
          message: CustomErrorTaxTypesResponseEnum.TAX_IS_CANCELLED,
          console: logContext,
        })

      case InstallmentPaymentReasonNotPossibleEnum.JUST_ONE_INSTALLMENT:
        throw new ErrorFactoryService({
          alertReporting,
        }).UnprocessableEntityException({
          errorEnum: CustomErrorTaxTypesEnum.JUST_ONE_INSTALLMENT,
          message: CustomErrorTaxTypesResponseEnum.JUST_ONE_INSTALLMENT,
          console: logContext,
        })

      case undefined:
      default:
        throw new ErrorFactoryService({
          alertReporting,
        }).UnprocessableEntityException({
          errorEnum: CustomErrorTaxTypesEnum.INSTALLMENT_UNEXPECTED_ERROR,
          message: CustomErrorTaxTypesResponseEnum.INSTALLMENT_UNEXPECTED_ERROR,
          console: logContext,
        })
    }
  }

  // Find the active installment details
  const activeInstallmentInfo = findActiveInstallment(
    installmentPayment.installments,
  )

  if (!activeInstallmentInfo) {
    throw new ErrorFactoryService({
      alertReporting,
    }).InternalServerErrorException({
      errorEnum: CustomErrorTaxTypesEnum.INSTALLMENT_UNEXPECTED_ERROR,
      message: CustomErrorTaxTypesResponseEnum.INSTALLMENT_UNEXPECTED_ERROR,
      console: logContext,
    })
  }
  // Create description based on the installment status
  // data that goes to payment gateway should not contain diacritics
  const isPartialPayment =
    activeInstallmentInfo.status === InstallmentPaidStatusEnum.PARTIALLY_PAID ||
    (activeInstallmentInfo.status ===
      InstallmentPaidStatusEnum.AFTER_DUE_DATE &&
      activeInstallmentInfo.remainingAmount <
        activeInstallmentInfo.totalInstallmentAmount)
  const description = isPartialPayment
    ? `Platba zostatku ${activeInstallmentInfo.installmentNumber}. splatky za dane pre BA s id dane ${taxId}`
    : `Platba ${activeInstallmentInfo.installmentNumber}. splatky za dane pre BA s id dane ${taxId}`

  return {
    amount: activeInstallmentInfo.remainingAmount,
    taxId,
    description,
    taxType,
  }
}
