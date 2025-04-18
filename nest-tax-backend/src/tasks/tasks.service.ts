import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Prisma } from '@prisma/client'

import { AdminService } from '../admin/admin.service'
import { CardPaymentReportingService } from '../card-payment-reporting/card-payment-reporting.service'
import { PrismaService } from '../prisma/prisma.service'
import {
  MAX_NORIS_PAYMENTS_BATCH_SELECT,
  MAX_NORIS_TAXES_TO_UPDATE,
} from '../utils/constants'
import { HandleErrors } from '../utils/decorators/errorHandler.decorator'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'

@Injectable()
export class TasksService {
  private readonly logger: Logger

  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminService: AdminService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly cardPaymentReportingService: CardPaymentReportingService,
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
      if (error instanceof Error) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          error.message,
          undefined,
          undefined,
          error,
        )
      }
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Unknown error',
        undefined,
        <string>error,
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
    await this.cardPaymentReportingService.generateAndSendPaymentReport()
  }
}
