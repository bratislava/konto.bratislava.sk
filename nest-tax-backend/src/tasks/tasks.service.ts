import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DeliveryMethodNamed, PaymentStatus, Prisma } from '@prisma/client'
import dayjs from 'dayjs'

import { AdminService } from '../admin/admin.service'
import { BloomreachService } from '../bloomreach/bloomreach.service'
import { CardPaymentReportingService } from '../card-payment-reporting/card-payment-reporting.service'
import { PrismaService } from '../prisma/prisma.service'
import {
  MAX_NORIS_PAYMENTS_BATCH_SELECT,
  MAX_NORIS_TAXES_TO_UPDATE,
} from '../utils/constants'
import HandleErrors from '../utils/decorators/errorHandler.decorator'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../utils/subservices/database.subservice'

@Injectable()
export class TasksService {
  private readonly logger: Logger

  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminService: AdminService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly cardPaymentReportingService: CardPaymentReportingService,
    private readonly bloomreachService: BloomreachService,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly databaseSubservice: DatabaseSubservice,
  ) {
    this.logger = new Logger('TasksService')
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async updatePaymentsFromNoris() {
    let variableSymbolsDb: {
      variableSymbol: string
      id: number
      year: number
    }[] = []
    try {
      variableSymbolsDb = await this.prismaService.$transaction(
        async (prisma) => {
          await prisma.$executeRaw`SET LOCAL statement_timeout = '120000'`

          return prisma.$queryRaw<
            { variableSymbol: string; id: number; year: number }[]
          >`
          SELECT t."variableSymbol", t."id", t."year"
          FROM "Tax" t
          LEFT JOIN "TaxPayment" tp ON t."id" = tp."taxId" AND tp.status = 'SUCCESS'
          GROUP BY t."id", t."variableSymbol", t."lastCheckedPayments"
          HAVING COALESCE(SUM(tp."amount"), 0) < t."amount"
          ORDER BY t."lastCheckedPayments" ASC
          LIMIT ${MAX_NORIS_PAYMENTS_BATCH_SELECT}
        `
        },
      )
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.meta?.code === '57014'
      ) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Query timed out after 2 minutes',
          undefined,
          undefined,
          error,
        )
      }
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Unknown error',
        undefined,
        undefined,
        error,
      )
    }

    if (variableSymbolsDb.length === 0) return

    const data = {
      variableSymbols: variableSymbolsDb.map(
        (variableSymbolDb) => variableSymbolDb.variableSymbol,
      ),
      years: [
        ...new Set(
          variableSymbolsDb.map((variableSymbolDb) => variableSymbolDb.year),
        ),
      ],
    }

    this.logger.log(
      `TasksService: Updating payments from Noris with data: ${JSON.stringify(data)}`,
    )

    const result = await this.adminService.updatePaymentsFromNoris({
      type: 'variableSymbols',
      data,
    })

    await this.prismaService.tax.updateMany({
      where: {
        id: {
          in: variableSymbolsDb.map((dbRecord) => dbRecord.id),
        },
      },
      data: {
        lastCheckedPayments: new Date(),
      },
    })

    this.logger.log(
      `TasksService: Updated payments from Noris, result: ${JSON.stringify(result)}`,
    )
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async updateTaxesFromNoris() {
    const taxes = await this.prismaService.tax.findMany({
      select: {
        id: true,
        variableSymbol: true,
        year: true,
      },
      where: {
        dateTaxRuling: null,
      },
      take: MAX_NORIS_TAXES_TO_UPDATE,
      orderBy: {
        lastCheckedUpdates: 'asc',
      },
    })

    if (taxes.length === 0) return

    this.logger.log(
      `TasksService: Updating taxes from Noris with variable symbols: ${taxes.map((t) => t.variableSymbol).join(', ')}`,
    )

    await this.adminService.updateTaxesFromNoris(taxes)

    await this.prismaService.tax.updateMany({
      where: {
        id: {
          in: taxes.map((t) => t.id),
        },
      },
      data: {
        lastCheckedUpdates: new Date(),
      },
    })
  }

  @Cron(CronExpression.EVERY_WEEKDAY)
  @HandleErrors('Cron Error')
  async reportCardPayments() {
    const config = await this.databaseSubservice.getConfigByKeys([
      'REPORTING_GENERATE_REPORT',
      'REPORTING_RECIPIENT_EMAIL',
    ])

    if (!config.REPORTING_GENERATE_REPORT) {
      return
    }

    await this.cardPaymentReportingService.generateAndSendPaymentReport(
      config.REPORTING_RECIPIENT_EMAIL,
    )
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron Error')
  async sendUnpaidTaxReminders() {
    const TWENTY_DAYS_AGO = dayjs().subtract(20, 'day').toDate()
    const taxes = await this.prismaService.tax.findMany({
      select: {
        id: true,
        year: true,
        taxPayer: {
          select: {
            birthNumber: true,
          },
        },
      },
      where: {
        bloomreachUnpaidTaxReminderSent: false,
        taxPayments: {
          none: {
            status: PaymentStatus.SUCCESS,
          },
        },
        OR: [
          {
            deliveryMethod: DeliveryMethodNamed.CITY_ACCOUNT,
            createdAt: {
              lte: TWENTY_DAYS_AGO,
            },
          },
          {
            deliveryMethod: {
              not: DeliveryMethodNamed.CITY_ACCOUNT,
            },
            dateTaxRuling: {
              lte: TWENTY_DAYS_AGO,
            },
          },
          {
            deliveryMethod: null,
            dateTaxRuling: {
              lte: TWENTY_DAYS_AGO,
            },
          },
        ],
      },
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
            { year: tax.year },
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
}
