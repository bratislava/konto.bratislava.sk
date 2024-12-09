import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Prisma } from '@prisma/client'

import { AdminService } from '../admin/admin.service'
import { PrismaService } from '../prisma/prisma.service'
import { MAX_NORIS_PAYMENTS_BATCH_SELECT } from '../utils/constants'
import { HandleErrors } from '../utils/decorators/errorHandler.decorator'

@Injectable()
export class TasksService {
  private readonly logger: Logger

  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminService: AdminService,
  ) {
    this.logger = new Logger('TasksService')
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async updatePaymentsFromNoris() {
    const year = new Date().getFullYear()

    let variableSymbolsDb: { variableSymbol: string; id: number }[] = []
    try {
      variableSymbolsDb = await this.prismaService.$transaction(
        async (prisma) => {
          await prisma.$executeRaw`SET LOCAL statement_timeout = '120000'`

          return prisma.$queryRaw<{ variableSymbol: string; id: number }[]>`
          SELECT t."variableSymbol", t."id"
          FROM "Tax" t
          LEFT JOIN "TaxPayment" tp ON t."id" = tp."taxId" AND tp.status = 'SUCCESS'
          WHERE t.year = ${year}
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
        this.logger.warn('Query timed out after 2 minutes')
        throw error
      }
      this.logger.error('Failed to fetch variable symbols from database', {
        error: error instanceof Error ? error.message : 'Unknown error',
        year,
      })
      throw error
    }

    if (variableSymbolsDb.length === 0) return

    const data = {
      year,
      variableSymbols: variableSymbolsDb.map(
        (variableSymbolDb) => variableSymbolDb.variableSymbol,
      ),
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
}
