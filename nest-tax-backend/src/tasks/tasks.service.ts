import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PaymentStatus, Prisma } from '@prisma/client'

import { AdminService } from '../admin/admin.service'
import { PrismaService } from '../prisma/prisma.service'
import { MAX_NORIS_PAYMENTS_BATCH_SELECT } from '../utils/constants'

@Injectable()
export class TasksService {
  private readonly logger: Logger

  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminService: AdminService,
  ) {
    this.logger = new Logger('TasksService')
  }

  @Cron(CronExpression.EVERY_15_MINUTES)
  async updatePaymentsFromNoris() {
    const year = new Date().getFullYear()

    let variableSymbolsDb: { variableSymbol: string; id: number }[] = []
    try {
      variableSymbolsDb = await this.prismaService.$queryRaw<
        { variableSymbol: string; id: number }[]
      >(Prisma.sql`
      SET LOCAL statement_timeout = 600000;
      WITH total_payments AS (
        SELECT "taxId", SUM("amount") AS totalPayments
        FROM "TaxPayment"
        WHERE "status" = ${PaymentStatus.SUCCESS}::"PaymentStatus"
        GROUP BY "taxId"
      )
      SELECT t."variableSymbol", t."id"
      FROM "Tax" t
      LEFT JOIN total_payments tp ON t."id" = tp."taxId"
      WHERE
        COALESCE(tp.totalPayments, 0) < t."amount"
        AND t.year = ${year}
      ORDER BY t."lastCheckedPayments" ASC
      LIMIT ${MAX_NORIS_PAYMENTS_BATCH_SELECT}
      `)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === '57014') {
          this.logger.warn('Query timed out after 10 minutes')
          return
        }
      }

      this.logger.error('Failed to fetch variable symbols from database', {
        error: error instanceof Error ? error.message : 'Unknown error',
        year,
      })
      return
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
