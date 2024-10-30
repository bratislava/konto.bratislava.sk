import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Prisma } from '@prisma/client'

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

  @Cron(CronExpression.EVERY_10_MINUTES)
  async updatePaymentsFromNoris() {
    const year = new Date().getFullYear()

    const variableSymbolsDb = await this.prismaService.$queryRaw<
      { variableSymbol: string; id: number }[]
    >(Prisma.sql`
    SELECT t."variableSymbol", t."id"
    FROM "Tax" t
    LEFT JOIN "TotalPaymentsView" tp ON t."id" = tp."taxId"
    WHERE 
      COALESCE(tp.totalPayments, 0) < t."amount"
      AND t.year = ${year}
    ORDER BY t."lastCheckedPayments" ASC
    LIMIT ${MAX_NORIS_PAYMENTS_BATCH_SELECT}
    `)

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
