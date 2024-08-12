import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { AdminService } from '../admin/admin.service'
import { PrismaService } from '../prisma/prisma.service'
import { MAX_NORIS_BATCH_SELECT } from '../utils/constants'

@Injectable()
export class TasksService {
  private readonly logger: Logger

  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminService: AdminService,
  ) {
    this.logger = new Logger('TasksService')
  }

  @Cron(CronExpression.EVERY_HOUR)
  async createDataFromNorisBatchTask() {
    this.logger.log('Running createDataFromNorisBatchTask')

    const year = new Date().getFullYear()
    const birthNumbersFromDb = await this.prismaService.taxPayer.findMany({
      select: {
        birthNumber: true,
      },
      where: {
        taxes: {
          none: {
            year,
          },
        },
      },
      orderBy: {
        norisLastCalled: 'asc',
      },
      take: MAX_NORIS_BATCH_SELECT,
    })
    const birthNumbers = birthNumbersFromDb.map((bn) => bn.birthNumber)

    if (birthNumbers.length === 0) {
      return
    }

    await this.adminService.loadDataFromNoris({
      year,
      birthNumbers,
    })

    await this.prismaService.taxPayer.updateMany({
      where: {
        birthNumber: {
          in: birthNumbers,
        },
      },
      data: {
        norisLastCalled: new Date(),
      },
    })
  }
}
