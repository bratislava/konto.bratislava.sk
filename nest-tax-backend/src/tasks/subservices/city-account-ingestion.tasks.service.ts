import {
  ErrorEnum,
  ErrorFactoryService,
  LineLoggerService,
} from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../prisma/prisma.service'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../../utils/subservices/database.subservice'

@Injectable()
export default class CityAccountIngestionTasksService {
  private readonly LOAD_USER_BIRTHNUMBERS_BATCH = 100

  private readonly RECHECK_USER_MISSING_BATCH = 100

  constructor(
    private readonly prismaService: PrismaService,
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly cityAccountSubservice: CityAccountSubservice,
    private readonly databaseSubservice: DatabaseSubservice,
    private readonly logger: LineLoggerService,
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

    await this.prismaService.taxPayer.updateMany({
      where: {
        birthNumber: { in: data.birthNumbers },
        cityAccountUserMissingSince: { not: null },
      },
      data: { cityAccountUserMissingSince: null },
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
      throw this.errorFactoryService.InternalServerErrorException({
        errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
        message:
          'Database used to contain `LOADING_NEW_USERS_FROM_CITY_ACCOUNT` key in Config table at the start of this task, but it no longer exists. This really should not happen.',
        console: `New \`nextSince\` was supposed to be set: ${data.nextSince.toISOString()}`,
      })
    }
  }

  async recheckCityAccountUserMissing() {
    let lastTaxPayerId = 0
    let unmarkedCount = 0
    let taxPayers: { id: number; birthNumber: string }[]

    do {
      // eslint-disable-next-line no-await-in-loop -- batches are processed sequentially to keep the load on city account steady
      taxPayers = await this.prismaService.taxPayer.findMany({
        where: {
          cityAccountUserMissingSince: { not: null },
          id: { gt: lastTaxPayerId },
        },
        select: { id: true, birthNumber: true },
        orderBy: { id: 'asc' },
        take: this.RECHECK_USER_MISSING_BATCH,
      })
      if (taxPayers.length === 0) {
        break
      }
      lastTaxPayerId = taxPayers[taxPayers.length - 1].id

      const birthNumbers = taxPayers.map((taxPayer) => taxPayer.birthNumber)
      const userData =
        // eslint-disable-next-line no-await-in-loop -- batches are processed sequentially to keep the load on city account steady
        await this.cityAccountSubservice.getUserDataAdminBatch(birthNumbers)
      const birthNumbersBackInCityAccount = birthNumbers.filter(
        (birthNumber) => userData[birthNumber],
      )

      if (birthNumbersBackInCityAccount.length > 0) {
        // eslint-disable-next-line no-await-in-loop -- batches are processed sequentially to keep the load on city account steady
        const { count } = await this.prismaService.taxPayer.updateMany({
          where: {
            birthNumber: { in: birthNumbersBackInCityAccount },
            cityAccountUserMissingSince: { not: null },
          },
          data: { cityAccountUserMissingSince: null },
        })
        unmarkedCount += count
      }
    } while (taxPayers.length === this.RECHECK_USER_MISSING_BATCH)

    this.logger.log(
      `Unmarked ${unmarkedCount} tax payers whose user is back in city account.`,
    )
  }
}
