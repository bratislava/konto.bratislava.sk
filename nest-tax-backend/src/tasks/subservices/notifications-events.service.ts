import { HttpException, Injectable } from '@nestjs/common'
import {
  DeliveryMethodNamed,
  PaymentStatus,
  Prisma,
  UnpaidReminderSent,
} from '@prisma/client'
import dayjs, { Dayjs } from 'dayjs'
import pLimit from 'p-limit'

import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { PaymentService } from '../../payment/payment.service'
import { PrismaService } from '../../prisma/prisma.service'
import {
  bratislavaTimeZone,
  DUE_DATE_OFFSET,
} from '../../tax/utils/unified-tax.util'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { TaxPaymentWithTaxAndTaxPayer } from '../../utils/types/types.prisma'
import { INSTALLMENT_DUE_DATE_TYPE } from '../utils/types'

const UNPAID_INSTALLMENT_REMINDER_BATCH_LIMIT = 50

@Injectable()
export default class NotificationsEventsService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly bloomreachService: BloomreachService,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly paymentService: PaymentService,
  ) {
    this.logger = new LineLoggerSubservice(NotificationsEventsService.name)
  }

  private async getTaxInstallmentsEligibleForReminder(
    reminderSentFilter: UnpaidReminderSent[],
    year: number,
    window: {
      start: Dayjs
      end: Dayjs
    },
  ): Promise<{ taxId: number; dueDate: Date; order: number; id: number }[]> {
    const reminderSentFilterSql = Prisma.join(
      reminderSentFilter.map((v) => Prisma.sql`${v}::"UnpaidReminderSent"`),
    )
    return this.prismaService.$queryRaw<
      { taxId: number; dueDate: Date; order: number; id: number }[]
    >`
      WITH paid AS (
        SELECT tp."taxId", SUM(tp.amount) AS total_paid
        FROM "TaxPayment" tp
        WHERE tp.status = 'SUCCESS'::"PaymentStatus"
        GROUP BY tp."taxId"
      ),
      due AS (
        SELECT
          ti."taxId",
          ti."order" AS thru_order,
          SUM(ti2.amount) AS total_due
        FROM "TaxInstallment" ti
        INNER JOIN "TaxInstallment" ti2
          ON ti2."taxId" = ti."taxId"
          AND ti2."order" <= ti."order"
        GROUP BY ti."taxId", ti."order"
      )
      SELECT t."id" as taxId, ti_check."dueDate" as dueDate, ti_check."order" as order, ti_check."id" as id
      FROM "Tax" t
      JOIN "TaxInstallment" ti_check
        ON ti_check."taxId" = t.id
        AND ti_check.dueDate BETWEEN ${window.start} AND ${window.end}
        AND ti_check."bloomreachUnpaidReminderSent" IN (${reminderSentFilterSql})
      LEFT JOIN paid p ON p."taxId" = t.id
      LEFT JOIN due d ON d."taxId" = t.id AND d.thru_order = ti_check."order"
      WHERE t."year" = ${year}
        AND t."isCancelled" = false
        AND t."paymentMethodIsInkaso" = false
        AND COALESCE(p.total_paid, 0) < COALESCE(d.total_due, 0)
      LIMIT ${UNPAID_INSTALLMENT_REMINDER_BATCH_LIMIT}
    `
  }

  private async processInstallmentReminders(
    dueDateType: INSTALLMENT_DUE_DATE_TYPE,
    year: number,
  ) {
    const reminderSentFilter: UnpaidReminderSent[] =
      dueDateType === INSTALLMENT_DUE_DATE_TYPE.NEXT
        ? [UnpaidReminderSent.NONE]
        : [UnpaidReminderSent.NONE, UnpaidReminderSent.BEFORE_DUE]

    const window = {
      start: dayjs().tz(bratislavaTimeZone).startOf('day'),
      end: dayjs().tz(bratislavaTimeZone).endOf('day'),
    }
    if (dueDateType === INSTALLMENT_DUE_DATE_TYPE.NEXT) {
      window.end = window.end.add(1, 'week')
    } else {
      window.start = window.start.subtract(1, 'week')
    }

    const taxInstallmentInfo = await this.getTaxInstallmentsEligibleForReminder(
      reminderSentFilter,
      year,
      window,
    )
    const taxes = await this.prismaService.tax.findMany({
      where: { id: { in: taxInstallmentInfo.map((t) => t.taxId) } },
      include: { taxPayer: true },
    })
    const taxIdToInstallmentInfo = new Map<
      number,
      { dueDate: Date; order: number; id: number }
    >()
    taxInstallmentInfo.forEach((t) => {
      taxIdToInstallmentInfo.set(t.taxId, {
        dueDate: t.dueDate,
        order: t.order,
        id: t.id,
      })
    })

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        taxes.map((t) => t.taxPayer.birthNumber),
      )

    const sentResults = await Promise.all(
      taxes.map(async (tax): Promise<number | undefined> => {
        const user = userDataFromCityAccount[tax.taxPayer.birthNumber]
        const externalId = user?.externalId
        if (!externalId) {
          return undefined
        }
        const installmentInfo = taxIdToInstallmentInfo.get(tax.id)
        if (!installmentInfo) {
          return undefined
        }
        const eventData = {
          year: tax.year,
          tax_type: tax.type,
          order: tax.order!,
          installment_order: installmentInfo.order,
          due_date_type: dueDateType,
          due_date_month: installmentInfo.dueDate.getMonth() + 1,
          due_date_day: installmentInfo.dueDate.getDate(),
        }
        try {
          const result =
            await this.bloomreachService.trackEventUnpaidTaxInstallmentReminder(
              eventData,
              externalId,
            )
          if (!result) {
            throw this.throwerErrorGuard.InternalServerErrorException(
              ErrorsEnum.INTERNAL_SERVER_ERROR,
              `Failed to track event in Bloomreach for taxId: ${tax.id} and externalId: ${externalId}, eventData: ${JSON.stringify(eventData)}`,
            )
          }
          return installmentInfo.id
        } catch (error) {
          this.logger.error(
            error instanceof HttpException
              ? error
              : this.throwerErrorGuard.InternalServerErrorException(
                  ErrorsEnum.INTERNAL_SERVER_ERROR,
                  `Failed to process installment reminder for taxId: ${tax.id} and externalId: ${externalId}, eventData: ${JSON.stringify(eventData)}`,
                  undefined,
                  undefined,
                  error,
                ),
          )
          return undefined
        }
      }),
    )
    const taxInstallmentIdsSent = sentResults.filter(
      (id): id is number => id !== undefined,
    )

    if (taxInstallmentIdsSent.length === 0) {
      this.logger.log(
        `No reminders sent for installment dueDateType: ${dueDateType}.`,
      )
      return
    }

    const newReminderSent: UnpaidReminderSent =
      dueDateType === INSTALLMENT_DUE_DATE_TYPE.NEXT
        ? UnpaidReminderSent.BEFORE_DUE
        : UnpaidReminderSent.AFTER_DUE

    const alreadyOtherSent =
      dueDateType === INSTALLMENT_DUE_DATE_TYPE.NEXT
        ? UnpaidReminderSent.AFTER_DUE
        : UnpaidReminderSent.BEFORE_DUE

    const baseWhere = {
      id: { in: taxInstallmentIdsSent },
    }
    await this.prismaService.taxInstallment.updateMany({
      where: { ...baseWhere, bloomreachUnpaidReminderSent: alreadyOtherSent },
      data: { bloomreachUnpaidReminderSent: UnpaidReminderSent.BOTH },
    })
    await this.prismaService.taxInstallment.updateMany({
      where: {
        ...baseWhere,
        bloomreachUnpaidReminderSent: { not: alreadyOtherSent },
      },
      data: { bloomreachUnpaidReminderSent: newReminderSent },
    })

    this.logger.log(
      `Updated ${taxInstallmentIdsSent.length} installments for dueDateType: ${dueDateType}, tax installment IDs: ${taxInstallmentIdsSent.join(', ')}`,
    )
  }

  async sendUnpaidTaxInstallmentReminders() {
    const year = dayjs().year()

    this.logger.log(`Starting sendUnpaidTaxInstallmentReminders task`)

    await this.processInstallmentReminders(INSTALLMENT_DUE_DATE_TYPE.NEXT, year)

    await this.processInstallmentReminders(INSTALLMENT_DUE_DATE_TYPE.PAST, year)
  }

  async sendUnpaidTaxReminders() {
    const DUE_DATE_OFFSET_DATE = dayjs()
      .tz('Europe/Bratislava')
      .subtract(DUE_DATE_OFFSET, 'day')
      .toDate()
    const taxes = await this.prismaService.tax.findMany({
      select: {
        id: true,
        year: true,
        type: true,
        order: true,
        taxPayer: {
          select: {
            birthNumber: true,
          },
        },
      },
      where: {
        bloomreachUnpaidTaxReminderSent: false,
        isCancelled: false,
        paymentMethodIsInkaso: false, // Such taxes are not paid directly by the tax payer, therefore we do not send reminders for them
        taxPayments: {
          none: {
            status: PaymentStatus.SUCCESS,
          },
        },
        OR: [
          {
            deliveryMethod: DeliveryMethodNamed.CITY_ACCOUNT,
            createdAt: {
              lte: DUE_DATE_OFFSET_DATE,
            },
          },
          {
            deliveryMethod: {
              not: DeliveryMethodNamed.CITY_ACCOUNT,
            },
            dateTaxRuling: {
              lte: DUE_DATE_OFFSET_DATE,
            },
          },
          {
            deliveryMethod: null,
            dateTaxRuling: {
              lte: DUE_DATE_OFFSET_DATE,
            },
          },
        ],
      },
      // need to spread this because of getUserDataAdminBatch will timeout if used on 700 records
      // 50 * 6 * 24 h = 7200 is max number of konto visitors in dayhours
      take: 50,
    })

    if (taxes.length === 0) {
      return
    }
    this.logger.log(
      `TasksService: Sending unpaid tax reminder events for taxes: ${JSON.stringify(
        taxes.map((tax) => ({
          id: tax.id,
        })),
      )}`,
    )

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        taxes.map((taxData) => taxData.taxPayer.birthNumber),
      )

    await Promise.all(
      taxes.map(async (tax) => {
        const userFromCityAccount =
          userDataFromCityAccount[tax.taxPayer.birthNumber] || null
        if (userFromCityAccount && userFromCityAccount.externalId) {
          await this.bloomreachService.trackEventUnpaidTaxReminder(
            { year: tax.year, tax_type: tax.type, order: tax.order! },
            userFromCityAccount.externalId,
          )
        }
      }),
    )

    await this.prismaService.tax.updateMany({
      where: {
        id: {
          in: taxes.map((tax) => tax.id),
        },
      },
      data: {
        bloomreachUnpaidTaxReminderSent: true,
      },
    })
  }

  async resendBloomreachEvents() {
    this.logger.log('Starting resendBloomreachEvents task')
    const payments = await this.prismaService.taxPayment.findMany({
      where: {
        status: PaymentStatus.SUCCESS,
        bloomreachEventSent: false,
      },
      include: {
        tax: {
          include: {
            taxPayer: true,
          },
        },
      },
    })

    if (payments.length === 0) {
      this.logger.log('No payments to resend bloomreach events for')
      return
    }

    const concurrency = Number(process.env.DB_CONCURRENCY ?? 10)
    const concurrencyLimit = pLimit(concurrency)

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        payments.map((payment) => payment.tax.taxPayer.birthNumber),
      )

    const trackPaymentWithConcurrencyLimit = async (
      payment: TaxPaymentWithTaxAndTaxPayer,
    ): Promise<boolean> => {
      try {
        await concurrencyLimit(async () => {
          const userFromCityAccount =
            userDataFromCityAccount[payment.tax.taxPayer.birthNumber] || null
          await this.paymentService.trackPaymentInBloomreach(
            payment,
            userFromCityAccount?.externalId ?? undefined,
          )
        })
        return true
      } catch (error) {
        // Throwing would cause the whole task to fail, so we just log the error
        this.logger.error(error)
        return false
      }
    }

    const results = await Promise.all(
      payments.map(async (payment) => {
        const success = await trackPaymentWithConcurrencyLimit(payment)
        return success
      }),
    )

    this.logger.log(
      `TasksService: Resent ${results.filter(Boolean).length} bloomreach payment events. Failed to resend ${results.filter((result) => !result).length} bloomreach payment events.`,
    )
  }
}
