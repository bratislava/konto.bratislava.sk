import { TaxDetail } from '@prisma/client'
import dayjs, { Dayjs } from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

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
  ResponseTaxSummaryDetailDto,
} from '../dtos/response.tax.dto'
import { generateItemizedTaxDetail } from './helpers/tax.helper'

dayjs.extend(utc)
dayjs.extend(timezone)

type ReplaceQrCodeWithGeneratorDto<T extends object> = {
  [K in keyof T]: K extends 'qrCode' ? QrCodeGeneratorDto : T[K]
}

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
  return stateHolidays.some((holiday) => holiday.isSame(date, 'day'))
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

const calculateDueDate = (dateOfValidity: Date | null): Dayjs | null => {
  // We will not provide due date if date of validity for the first payment is not set.
  if (!dateOfValidity) return null

  // We add one more day to get midnight - start of the next day
  const dueDateBase = dayjs
    .tz(dateOfValidity, bratislavaTimeZone)
    .startOf('day')
    .add(21, 'day')
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

    let status
    if (toPay === 0) {
      status = InstallmentPaidStatusEnum.PAID
    } else if (toPay === amount) {
      status = InstallmentPaidStatusEnum.NOT_PAID
    } else {
      status = InstallmentPaidStatusEnum.PARTIALLY_PAID
    }

    return { toPay, paid, status }
  })
}

const calculateInstallmentPaymentDetails = (
  overallAmount: number,
  overallPaid: number,
  today: Date,
  taxYear: number,
  payment_calendar_threshold: number,
  dueDate: Dayjs | null,
  installments: { order: string | null; amount: number }[],
  variableSymbol: string,
): Omit<ResponseInstallmentPaymentDetailDto, 'activeInstallment'> & {
  activeInstallment?: ReplaceQrCodeWithGeneratorDto<ResponseActiveInstallmentDto>
} => {
  // Midnight start of the next day
  const secondPaymentDueDate = dayjs
    .tz(new Date(`${taxYear}-08-31`), bratislavaTimeZone)
    .startOf('day')
    .add(1, 'day')

  if (overallAmount - overallPaid <= 0) {
    return {
      isPossible: false,
      reasonNotPossible: InstallmentPaymentReasonNotPossibleEnum.ALREADY_PAID,
    }
  }

  if (dayjs(today) > secondPaymentDueDate) {
    return {
      isPossible: false,
      reasonNotPossible: InstallmentPaymentReasonNotPossibleEnum.AFTER_DUE_DATE,
    }
  }

  if (overallAmount < payment_calendar_threshold) {
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

  const installmentDetails: ResponseInstallmentItemDto[] =
    !dueDate || dueDate > dayjs(today)
      ? [
          {
            installmentNumber: 1,
            dueDate: dueDate?.toDate(),
            status: installmentAmounts[0].status,
            remainingAmount: installmentAmounts[0].toPay,
          },
          {
            installmentNumber: 2,
            dueDate: dayjs.tz(`${taxYear}-09-01`, bratislavaTimeZone).toDate(),
            status: installmentAmounts[1].status,
            remainingAmount: installmentAmounts[1].toPay,
          },
          {
            installmentNumber: 3,
            dueDate: dayjs.tz(`${taxYear}-11-01`, bratislavaTimeZone).toDate(),
            status: installmentAmounts[2].status,
            remainingAmount: installmentAmounts[2].toPay,
          },
        ]
      : [
          {
            installmentNumber: 1,
            dueDate: dueDate?.toDate(),
            status: InstallmentPaidStatusEnum.AFTER_DUE_DATE,
            remainingAmount: 0,
          },
          {
            installmentNumber: 2,
            dueDate: dayjs.tz(`${taxYear}-09-01`, bratislavaTimeZone).toDate(),
            status: installmentAmounts[0].status,
            remainingAmount:
              installmentAmounts[1].toPay + installmentAmounts[0].toPay,
          },
          {
            installmentNumber: 3,
            dueDate: dayjs.tz(`${taxYear}-11-01`, bratislavaTimeZone).toDate(),
            status: installmentAmounts[2].status,
            remainingAmount: installmentAmounts[2].toPay,
          },
        ]

  const active = installmentDetails.find(
    (installment) =>
      installment.status === InstallmentPaidStatusEnum.NOT_PAID ||
      installment.status === InstallmentPaidStatusEnum.PARTIALLY_PAID,
  )

  if (!active) {
    return {
      isPossible: false,
      reasonNotPossible: InstallmentPaymentReasonNotPossibleEnum.ALREADY_PAID,
    }
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
    remainingAmount: active?.remainingAmount,
    variableSymbol,
    qrCode: {
      amount: active.remainingAmount,
      variableSymbol,
      specificSymbol: '2025200000', // TODO
      paymentNote,
    },
  }

  return {
    isPossible: true,
    installments: installmentDetails,
    activeInstallment,
  }
}

const calculateOneTimePaymentDetails = (
  overallPaid: number,
  overallBalance: number,
  dueDate: Date | undefined,
  variableSymbol: string,
): ReplaceQrCodeWithGeneratorDto<ResponseOneTimePaymentDetailsDto> => {
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
    dueDate,
    qrCode: {
      amount: overallBalance,
      variableSymbol,
      specificSymbol: '2025200000',
      paymentNote:
        overallPaid > 0
          ? QrPaymentNoteEnum.QR_remainingAmount
          : QrPaymentNoteEnum.QR_oneTimePay,
    },
    variableSymbol,
  }
}

export const getTaxDetailPure = (
  overallPaid: number, // zaplatená suma
  taxYear: number, // daňový rok
  today: Date, // aktuálny dátum
  overallAmount: number, // suma na zaplatenie
  payment_calendar_threshold: number, // splátková hranica (66 Eur)
  variableSymbol: string,
  dateOfValidity: Date | null, // dátum právoplatnosti
  installments: { order: string | null; amount: number }[],
  taxDetails: TaxDetail[],
  taxConstructions: number,
  taxFlat: number,
  taxLand: number,
): Omit<
  // TODO use generated types. This is just verbose version while this code is still WIP
  ResponseTaxSummaryDetailDto,
  'oneTimePayment' | 'installmentPayment'
> & {
  oneTimePayment: ReplaceQrCodeWithGeneratorDto<ResponseOneTimePaymentDetailsDto>
  installmentPayment: Omit<
    ResponseInstallmentPaymentDetailDto,
    'activeInstallment'
  > & {
    activeInstallment?: ReplaceQrCodeWithGeneratorDto<ResponseActiveInstallmentDto>
  }
} => {
  const overallBalance = Math.max(overallAmount - overallPaid, 0)

  const dueDate = calculateDueDate(dateOfValidity)

  const oneTimePayment = calculateOneTimePaymentDetails(
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
    dueDate,
    installments,
    variableSymbol,
  )

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
