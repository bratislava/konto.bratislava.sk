import { HttpException, Injectable } from '@nestjs/common'
import { Prisma, TaxType, UnpaidReminderSent } from '@prisma/client'
import dayjs, { Dayjs } from 'dayjs'

import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { PrismaService } from '../../prisma/prisma.service'
import { parseInstallmentDueDate } from '../../tax/utils/unified-tax.util'
import { getTaxDefinitionByType } from '../../tax-definitions/getTaxDefinitionByType'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { getNextTaxType } from '../utils/tax-type-switch'
import { INSTALLMENT_DUE_DATE_TYPE } from '../utils/types'

const UNPAID_INSTALLMENT_REMINDER_BATCH_LIMIT = 50

const INSTALLMENT_NUMBERS = {
  second: 2 as const,
  third: 3 as const,
  fourth: 4 as const,
}

type InstallmentInfo = {
  installmentNumber: 2 | 3 | 4
  installmentDate: Dayjs
}

@Injectable()
export default class NotificationsEventsSubservice {
  private readonly logger: LineLoggerSubservice

  private lastInstallmentReminderTaxType: TaxType = TaxType.DZN

  constructor(
    private readonly prismaService: PrismaService,
    private readonly bloomreachService: BloomreachService,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice(NotificationsEventsSubservice.name)
  }

  private readonly isWithinNextWeek = (installmentDate: Dayjs) => {
    const now = dayjs().tz('Europe/Bratislava')
    const oneWeekFromNow = now.add(1, 'week')
    return (
      installmentDate.isAfter(now) && installmentDate.isBefore(oneWeekFromNow)
    )
  }

  private readonly isWithinPastWeek = (installmentDate: Dayjs) => {
    const now = dayjs().tz('Europe/Bratislava')
    const oneWeekAgo = now.subtract(1, 'week')
    return installmentDate.isAfter(oneWeekAgo) && installmentDate.isBefore(now)
  }

  private findInstallment(
    taxType: TaxType,
    dateInclusionPredicate: (installmentDate: Dayjs) => boolean,
  ): InstallmentInfo | null {
    const taxDefinition = getTaxDefinitionByType(taxType)
    const now = dayjs().tz('Europe/Bratislava')

    const installmentDueDates = Object.entries(
      taxDefinition.installmentDueDates,
    ) as Array<[keyof typeof taxDefinition.installmentDueDates, string]>

    const found = installmentDueDates
      .map(([key, dueDate]) => {
        const installmentDate = parseInstallmentDueDate(now.year(), dueDate)
        return { installmentNumber: INSTALLMENT_NUMBERS[key], installmentDate }
      })
      .find((installmentInfo) =>
        dateInclusionPredicate(installmentInfo.installmentDate),
      )

    return found ?? null
  }

  private async getTaxesEligibleForInstallmentReminder(
    taxType: TaxType,
    installmentNumber: number,
    reminderSentFilter: UnpaidReminderSent[],
    year: number,
  ): Promise<{ id: number }[]> {
    const reminderSentFilterSql = Prisma.join(
      reminderSentFilter.map((v) => Prisma.sql`${v}::"UnpaidReminderSent"`),
    )
    return this.prismaService.$queryRaw<{ id: number }[]>`
      WITH paid AS (
        SELECT tp."taxId", SUM(tp.amount) AS total_paid
        FROM "TaxPayment" tp
        WHERE tp.status = 'SUCCESS'::"PaymentStatus"
        GROUP BY tp."taxId"
      ),
      due AS (
        SELECT ti."taxId", SUM(ti.amount) AS total_due
        FROM "TaxInstallment" ti
        WHERE ti.order <= ${installmentNumber}
        GROUP BY ti."taxId"
      )
      SELECT t."id"
      FROM "Tax" t
      JOIN "TaxInstallment" ti_check
        ON ti_check."taxId" = t.id
        AND ti_check.order = ${installmentNumber}
        AND ti_check."bloomreachUnpaidReminderSent" IN (${reminderSentFilterSql})
      LEFT JOIN paid p ON p."taxId" = t.id
      LEFT JOIN due d ON d."taxId" = t.id
      WHERE t.type = ${taxType}::"TaxType"
        AND t."year" = ${year}
        AND t."isCancelled" = false
        AND COALESCE(p.total_paid, 0) < COALESCE(d.total_due, 0)
      LIMIT ${UNPAID_INSTALLMENT_REMINDER_BATCH_LIMIT}
    `
  }

  private async processInstallmentReminders(
    installment: { installmentNumber: 2 | 3 | 4; installmentDate: Dayjs },
    taxType: TaxType,
    dueDateType: INSTALLMENT_DUE_DATE_TYPE,
    year: number,
  ) {
    const { installmentNumber, installmentDate } = installment
    const reminderSentFilter: UnpaidReminderSent[] =
      dueDateType === INSTALLMENT_DUE_DATE_TYPE.NEXT
        ? [UnpaidReminderSent.NONE]
        : [UnpaidReminderSent.NONE, UnpaidReminderSent.BEFORE_DUE]

    const taxIds = await this.getTaxesEligibleForInstallmentReminder(
      taxType,
      installmentNumber,
      reminderSentFilter,
      year,
    )
    const taxes = await this.prismaService.tax.findMany({
      where: { id: { in: taxIds.map((t) => t.id) } },
      include: { taxPayer: true },
    })

    const userDataFromCityAccount =
      await this.cityAccountSubservice.getUserDataAdminBatch(
        taxes.map((t) => t.taxPayer.birthNumber),
      )

    const dueDateMonth = installmentDate.month() + 1
    const dueDateDay = installmentDate.date()

    const sentResults = await Promise.all(
      taxes.map(async (tax): Promise<number | undefined> => {
        const user = userDataFromCityAccount[tax.taxPayer.birthNumber]
        const externalId = user?.externalId
        if (!externalId) {
          return undefined
        }
        const eventData = {
          year: tax.year,
          tax_type: tax.type,
          order: tax.order!,
          installment_order: installmentNumber,
          due_date_type: dueDateType,
          due_date_month: dueDateMonth,
          due_date_day: dueDateDay,
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
          return tax.id
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
    const taxIdsSent = sentResults.filter(
      (id): id is number => id !== undefined,
    )

    if (taxIdsSent.length === 0) {
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
      taxId: { in: taxIdsSent },
      order: installmentNumber,
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
  }

  async sendUnpaidTaxInstallmentReminders() {
    this.lastInstallmentReminderTaxType = getNextTaxType(
      this.lastInstallmentReminderTaxType,
    )
    const year = dayjs().year()

    const taxType = this.lastInstallmentReminderTaxType
    this.logger.log(
      `Starting sendUnpaidTaxInstallmentReminders task for TaxType: ${taxType}`,
    )

    const nextInstallment = this.findInstallment(taxType, this.isWithinNextWeek)
    if (nextInstallment) {
      this.logger.log(
        `Processing next installment: ${nextInstallment.installmentNumber} ${nextInstallment.installmentDate.format('YYYY-MM-DD')}`,
      )
      await this.processInstallmentReminders(
        nextInstallment,
        taxType,
        INSTALLMENT_DUE_DATE_TYPE.NEXT,
        year,
      )
    }

    const pastInstallment = this.findInstallment(taxType, this.isWithinPastWeek)
    if (!pastInstallment) {
      return
    }
    this.logger.log(
      `Processing past installment: ${pastInstallment.installmentNumber} ${pastInstallment.installmentDate.format('YYYY-MM-DD')}`,
    )
    await this.processInstallmentReminders(
      pastInstallment,
      taxType,
      INSTALLMENT_DUE_DATE_TYPE.PAST,
      year,
    )
  }
}
