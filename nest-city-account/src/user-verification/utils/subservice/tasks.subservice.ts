import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AdminApi, Configuration } from '../../../generated-clients/nest-tax-backend'
import { PrismaService } from '../../../prisma/prisma.service'
import { addSlashToBirthNumber } from '../../../utils/birthNumbers'
import HandleErrors from '../../../utils/decorators/errorHandler.decorators'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'

const UPLOAD_BIRTHNUMBERS_BATCH = 200

@Injectable()
export class TasksSubservice {
  private readonly taxBackendAdminApi: AdminApi

  private readonly logger: LineLoggerSubservice

  private readonly config: {
    taxBackendUrl: string
    taxBackendApiKey: string
  }

  constructor(private readonly prisma: PrismaService) {
    if (!process.env.TAX_BACKEND_URL || !process.env.TAX_BACKEND_API_KEY) {
      throw new Error('Tax backend ENV vars are not set ')
    }

    /** Config */
    this.config = {
      taxBackendUrl: process.env.TAX_BACKEND_URL,
      taxBackendApiKey: process.env.TAX_BACKEND_API_KEY,
    }

    this.taxBackendAdminApi = new AdminApi(new Configuration({}), this.config.taxBackendUrl)
    this.logger = new LineLoggerSubservice(TasksSubservice.name)
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron Error')
  async deleteOldUserVerificationData() {
    const today = new Date()
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1))

    await this.prisma.userIdCardVerify.deleteMany({
      where: {
        verifyStart: {
          lt: oneMonthAgo,
        },
      },
    })

    await this.prisma.legalPersonIcoIdCardVerify.deleteMany({
      where: {
        verifyStart: {
          lt: oneMonthAgo,
        },
      },
    })
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  @HandleErrors('Cron Error')
  async loadTaxesForUsers() {
    this.logger.log('Starting loadTaxesForUsers task')

    const year = new Date().getFullYear()
    const birthNumbersFromDb = await this.prisma.user.findMany({
      select: {
        birthNumber: true,
      },
      where: {
        birthNumber: {
          not: null,
        },
        OR: [{ lastTaxYear: null }, { lastTaxYear: { not: year } }],
      },
      orderBy: {
        lastTaxBackendUploadTry: 'asc',
      },
      take: UPLOAD_BIRTHNUMBERS_BATCH,
    })
    const birthNumbers = birthNumbersFromDb
      .map((birthNumberFromDb) => birthNumberFromDb.birthNumber)
      .filter((item): item is string => item !== null)
      .map(addSlashToBirthNumber)

    if (birthNumbers.length === 0) {
      return
    }

    this.logger.log(`Found ${birthNumbers.length} birth numbers to be added to tax backend.`)

    const result = await this.taxBackendAdminApi.adminControllerLoadDataFromNorris(
      { year, birthNumbers },
      {
        headers: {
          apiKey: this.config.taxBackendApiKey,
        },
      }
    )
    const addedBirthNumbers = result.data.birthNumbers.map((birthNumber) =>
      birthNumber.replaceAll('/', '')
    )

    this.logger.log(
      `${addedBirthNumbers.length} birth numbers are succesfully added to tax backend.`
    )

    // Mark birth numbers which are in tax backend.
    await this.prisma.user.updateMany({
      where: {
        birthNumber: {
          in: addedBirthNumbers,
        },
      },
      data: {
        lastTaxYear: year,
      },
    })

    // Set current datetime as the last try for the upload of the birth number to tax backend.
    await this.prisma.user.updateMany({
      where: {
        birthNumber: {
          in: birthNumbers.map((birthNumber) => birthNumber.replaceAll('/', '')),
        },
      },
      data: {
        lastTaxBackendUploadTry: new Date(),
      },
    })
  }
}
