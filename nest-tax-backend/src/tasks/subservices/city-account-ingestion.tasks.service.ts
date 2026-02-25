import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { PaymentService } from '../../payment/payment.service'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../../utils/subservices/database.subservice'
import { NorisSyncTasksService } from './noris-sync.tasks.service'
import { ReportingTasksService } from './reporting.tasks.service'
import { TaxImportOrchestratorTasksService } from './tax-import-orchestrator.tasks.service'

@Injectable()
export class CityAccountIngestionTasksService {
  private readonly LOAD_USER_BIRTHNUMBERS_BATCH = 100

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly databaseSubservice: DatabaseSubservice,
  ) {}

  async loadNewUsersFromCityAccount() {
    // Get latest date from config
    const config = await this.databaseSubservice.getConfigByKeys([
      'LOADING_NEW_USERS_FROM_CITY_ACCOUNT',
    ])

    const since = new Date(config.LOADING_NEW_USERS_FROM_CITY_ACCOUNT)
    // Get birth numbers from nest-city account

    const data =
      await this.cityAccountSubservice.getNewUserBirtNumbersAdminBatch(
        since,
        this.LOAD_USER_BIRTHNUMBERS_BATCH,
      )

    // Create TaxPayers in database by birthumber if they do not exist. Only value set should be birth number
    await this.prismaService.taxPayer.createMany({
      data: data.birthNumbers.map((bn) => {
        return { birthNumber: bn }
      }),
      skipDuplicates: true,
    })

    const latestRecord = await this.prismaService.config.findFirst({
      where: {
        key: 'LOADING_NEW_USERS_FROM_CITY_ACCOUNT',
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
    if (latestRecord) {
      await this.prismaService.config.update({
        where: {
          id: latestRecord.id,
        },
        data: {
          value: data.nextSince.toISOString(),
        },
      })
    } else {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        // eslint-disable-next-line no-secrets/no-secrets
        'Database used to contain `LOADING_NEW_USERS_FROM_CITY_ACCOUNT` key in Config table at the start of this task, but it no longer exists. This really should not happen.',
        undefined,
        `New \`nextSince\` was supposed to be set: ${data.nextSince.toISOString()}`,
      )
    }
  }
}
