import { Injectable } from '@nestjs/common'
import { Prisma, TaxType, UnpaidReminderSent } from '@prisma/client'
import dayjs, { Dayjs } from 'dayjs'

import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { PrismaService } from '../../prisma/prisma.service'
import { parseInstallmentDueDate } from '../../tax/utils/unified-tax.util'
import { getTaxDefinitionByType } from '../../tax-definitions/getTaxDefinitionByType'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

const UNPAID_INSTALLMENT_REMINDER_BATCH_LIMIT = 50

const INSTALLMENT_NUMBERS = {
  second: 2 as const,
  third: 3 as const,
  fourth: 4 as const,
}

export enum DUE_DATE_TIMING {
  BEFORE = 'before',
  AFTER = 'after',
}

@Injectable()
export default class NotificationsEventsSubservice {
  private readonly logger: LineLoggerSubservice

  private lastInstallmentReminderTaxType: TaxType = TaxType.DZN

  constructor(
    private readonly prismaService: PrismaService,
    private readonly bloomreachService: BloomreachService,
    private readonly cityAccountSubservice: CityAccountSubservice,
  ) {
    this.logger = new LineLoggerSubservice(NotificationsEventsSubservice.name)
  }

  private getNextInstallment(
    taxType: TaxType,
  ): { installmentNumber: 2 | 3 | 4; installmentDate: Dayjs } | null {
    const taxDefinition = getTaxDefinitionByType(taxType)
    const now = dayjs().tz('Europe/Bratislava')

    const installmentKeys = ['second', 'third', 'fourth'] as const
    // eslint-disable-next-line no-restricted-syntax
    for (const installmentKey of installmentKeys) {
      const dueDate = taxDefinition.installmentDueDates[installmentKey]
      if (dueDate) {
        const installmentDate = parseInstallmentDueDate(now.year(), dueDate)
        if (
          installmentDate.isAfter(now) &&
          installmentDate.isBefore(now.add(1, 'week'))
        ) {
          return {
            installmentNumber: INSTALLMENT_NUMBERS[installmentKey],
            installmentDate,
          }
        }
      }
    }

    return null
  }

  private getPastInstallment(
    taxType: TaxType,
  ): { installmentNumber: 2 | 3 | 4; installmentDate: Dayjs } | null {
    const taxDefinition = getTaxDefinitionByType(taxType)
    const now = dayjs().tz('Europe/Bratislava')

    const installmentKeys = ['fourth', 'third', 'second'] as const
    // eslint-disable-next-line no-restricted-syntax
    for (const installmentKey of installmentKeys) {
      const dueDate = taxDefinition.installmentDueDates[installmentKey]
      if (dueDate) {
        const installmentDate = parseInstallmentDueDate(now.year(), dueDate)
        if (installmentDate.add(1, 'week').isBefore(now)) {
          return {
            installmentNumber: INSTALLMENT_NUMBERS[installmentKey],
            installmentDate,
          }
        }
      }
    }

    return null
  }

  private async getTaxesEligibleForInstallmentReminder(
    taxType: TaxType,
    installmentNumber: number,
    reminderSentFilter: UnpaidReminderSent[],
    year: number,
  ): Promise<{ id: number }[]> {
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
        AND ti_check."bloomreachUnpaidReminderSent"::text IN (${Prisma.join(reminderSentFilter)})
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
    dueDateTiming: DUE_DATE_TIMING,
    year: number,
  ) {
    const { installmentNumber, installmentDate } = installment
    const reminderSentFilter: UnpaidReminderSent[] =
      dueDateTiming === DUE_DATE_TIMING.BEFORE
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
    const taxIdsSent: number[] = []

    await Promise.all(
      taxes.map(async (tax) => {
        const user = userDataFromCityAccount[tax.taxPayer.birthNumber]
        const externalId = user?.externalId
        if (!externalId) {
          return
        }
        await this.bloomreachService.trackEventUnpaidTaxInstallmentReminder(
          {
            year: tax.year,
            tax_type: tax.type,
            order: tax.order!,
            installment_order: installmentNumber,
            due_date_timing: dueDateTiming,
            due_date_month: dueDateMonth,
            due_date_day: dueDateDay,
          },
          externalId,
        )
        taxIdsSent.push(tax.id)
      }),
    )

    if (taxIdsSent.length === 0) {
      return
    }

    const newReminderSent: UnpaidReminderSent =
      dueDateTiming === DUE_DATE_TIMING.BEFORE
        ? UnpaidReminderSent.BEFORE_DUE
        : UnpaidReminderSent.AFTER_DUE

    const alreadyOtherSent =
      dueDateTiming === DUE_DATE_TIMING.BEFORE
        ? UnpaidReminderSent.AFTER_DUE
        : UnpaidReminderSent.BEFORE_DUE
    await this.prismaService.$executeRaw`
      UPDATE "TaxInstallment"
      SET "bloomreachUnpaidReminderSent" = CASE
        WHEN "bloomreachUnpaidReminderSent" = ${alreadyOtherSent} THEN ${UnpaidReminderSent.BOTH}
        ELSE ${newReminderSent}
      END
      WHERE "taxId" IN (${Prisma.join(taxIdsSent)})
        AND "order" = ${installmentNumber}
    `
  }

  private async processNextInstallment(
    installment: { installmentNumber: 2 | 3 | 4; installmentDate: Dayjs },
    taxType: TaxType,
    year: number,
  ) {
    await this.processInstallmentReminders(
      installment,
      taxType,
      DUE_DATE_TIMING.BEFORE,
      year,
    )
  }

  private async processPastInstallment(
    installment: { installmentNumber: 2 | 3 | 4; installmentDate: Dayjs },
    taxType: TaxType,
    year: number,
  ) {
    await this.processInstallmentReminders(
      installment,
      taxType,
      DUE_DATE_TIMING.AFTER,
      year,
    )
  }

  async sendUnpaidTaxInstallmentReminders() {
    this.lastInstallmentReminderTaxType =
      this.lastInstallmentReminderTaxType === TaxType.KO
        ? TaxType.DZN
        : TaxType.KO

    const year = dayjs().year()

    const taxType = this.lastInstallmentReminderTaxType
    this.logger.log(
      `Starting sendUnpaidTaxInstallmentReminders task for TaxType: ${taxType}`,
    )

    const nextInstallment = this.getNextInstallment(taxType)
    if (nextInstallment) {
      this.logger.log(
        `Processing next installment: ${nextInstallment.installmentNumber} ${nextInstallment.installmentDate.format('YYYY-MM-DD')}`,
      )
      await this.processNextInstallment(nextInstallment, taxType, year)
    }

    const pastInstallment = this.getPastInstallment(taxType)
    if (pastInstallment) {
      this.logger.log(
        `Processing past installment: ${pastInstallment.installmentNumber} ${pastInstallment.installmentDate.format('YYYY-MM-DD')}`,
      )
      await this.processPastInstallment(pastInstallment, taxType, year)
    }
  }
}
