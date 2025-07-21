import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { RequestUpdateNorisDeliveryMethodsDtoDataValue } from 'openapi-clients/tax'
import { ACTIVE_USER_FILTER, PrismaService } from '../prisma/prisma.service'
import { GdprCategory, GdprSubType, GdprType } from '../user/dtos/gdpr.user.dto'
import { addSlashToBirthNumber } from '../utils/birthNumbers'
import { getTaxDeadlineDate } from '../utils/constants/tax-deadline'
import HandleErrors from '../utils/decorators/errorHandler.decorators'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { DeliveryMethod } from '../utils/types/tax.types'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { TaxSubservice } from '../utils/subservices/tax.subservice'
import { PhysicalEntityService } from '../physical-entity/physical-entity.service'
import { PhysicalEntity } from '@prisma/client'

const UPLOAD_BIRTHNUMBERS_BATCH = 100
const UPLOAD_TAX_DELIVERY_METHOD_BATCH = 100

const EDESK_UPDATE_LOOK_BACK_HOURS = 96

@Injectable()
export class TasksService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly taxSubservice: TaxSubservice,
    private readonly physicalEntityService: PhysicalEntityService
  ) {
    this.logger = new LineLoggerSubservice(TasksService.name)
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron Error')
  async deleteOldUserVerificationData() {
    const today = new Date()
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1))

    await this.prismaService.userIdCardVerify.deleteMany({
      where: {
        verifyStart: {
          lt: oneMonthAgo,
        },
      },
    })

    await this.prismaService.legalPersonIcoIdCardVerify.deleteMany({
      where: {
        verifyStart: {
          lt: oneMonthAgo,
        },
      },
    })
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @HandleErrors('Cron Error')
  async loadTaxesForUsers() {
    this.logger.log('Starting loadTaxesForUsers task')

    const year = new Date().getFullYear()
    const birthNumbersFromDb = await this.prismaService.user.findMany({
      select: {
        birthNumber: true,
      },
      where: {
        birthNumber: {
          not: null,
        },
        OR: [{ lastTaxYear: null }, { lastTaxYear: { not: year } }],
        ...ACTIVE_USER_FILTER,
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

    const result = await this.taxSubservice.loadDataFromNoris({ year, birthNumbers })
    const addedBirthNumbers = result.data.birthNumbers.map((birthNumber) =>
      birthNumber.replaceAll('/', '')
    )

    this.logger.log(
      `${addedBirthNumbers.length} birth numbers are successfully added to tax backend.`
    )

    // Mark birth numbers which are in the tax backend.
    await this.prismaService.user.updateMany({
      where: {
        birthNumber: {
          in: addedBirthNumbers,
        },
        ...ACTIVE_USER_FILTER,
      },
      data: {
        lastTaxYear: year,
      },
    })

    // Set current datetime as the last try for the upload of the birth number to tax backend.
    await this.prismaService.user.updateMany({
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

  @Cron('*/5 * 2-30 4 *') // Every 5 minutes in April, starting from 2nd.
  @HandleErrors('Cron Error')
  async updateDeliveryMethodsInNoris() {
    const currentYear = new Date().getFullYear()
    const taxDeadlineDate = getTaxDeadlineDate()

    const users = await this.prismaService.user.findMany({
      where: {
        birthNumber: {
          not: null,
        },
        OR: [
          {
            lastTaxDeliveryMethodsUpdateYear: {
              not: currentYear,
            },
          },
          {
            lastTaxDeliveryMethodsUpdateYear: null,
          },
        ],
        lastVerificationIdentityCard: {
          not: null,
          lt: taxDeadlineDate,
        },
        ...ACTIVE_USER_FILTER,
      },
      include: {
        userGdprData: {
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            category: GdprCategory.TAXES,
            type: GdprType.FORMAL_COMMUNICATION,
            createdAt: {
              lt: taxDeadlineDate,
            },
          },
          take: 1,
          select: {
            subType: true,
            createdAt: true,
          },
        },
        physicalEntity: {
          select: {
            activeEdesk: true,
          },
        },
      },
      take: UPLOAD_TAX_DELIVERY_METHOD_BATCH,
    })

    if (users.length === 0) {
      return
    }

    const data = users.reduce<{ [key: string]: RequestUpdateNorisDeliveryMethodsDtoDataValue }>(
      (acc, user) => {
        // We know that birthNumber is not null from the query.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const birthNumber: string = user.birthNumber!

        if (user.physicalEntity?.activeEdesk) {
          acc[birthNumber] = { deliveryMethod: DeliveryMethod.EDESK }
          return acc
        }
        if (user.userGdprData?.[0]?.subType === GdprSubType.SUB) {
          acc[birthNumber] = {
            deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
            date: user.userGdprData[0].createdAt.toISOString().slice(0, 10),
          }
          return acc
        }
        acc[birthNumber] = { deliveryMethod: DeliveryMethod.POSTAL }
        return acc
      },
      {}
    )

    await this.taxSubservice.updateDeliveryMethodsInNoris({ data })

    // Now we should check if some user was not deactivated during his update in Noris.
    // This would be a problem, since if we update the delivery method in Noris after removing the delivery method, we should manually remove them. However, it is an edge case.
    const deactivated = await this.prismaService.user.findMany({
      select: {
        id: true,
      },
      where: {
        id: {
          in: users.map((user) => user.id),
        },
        birthNumber: null,
      },
    })
    // If someone was deactivated, we should log the error with their birth numbers.
    if (deactivated.length > 0) {
      const deactivatedIds = deactivated.map((user) => user.id)
      const birthNumbersOfDeactivateUsers = users
        .filter((user) => deactivatedIds.includes(user.id))
        .map((user) => user.birthNumber)
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        `Some users were deactivated during the update of the delivery methods in Noris. Their birth numbers are: ${birthNumbersOfDeactivateUsers.join(
          ', '
        )}. Remove their delivery methods in Noris manually.`
      )
    }

    // If OK, we should set the Users to have updated delivery methods in Noris for the current year. Otherwise the error will be thrown.
    await this.prismaService.user.updateMany({
      where: {
        id: {
          in: users.map((user) => user.id),
        },
      },
      data: {
        lastTaxDeliveryMethodsUpdateYear: currentYear,
      },
    })
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  @HandleErrors('CronError')
  async updateEdesk(): Promise<void> {
    const lookBackDate = new Date()
    lookBackDate.setHours(lookBackDate.getHours() - EDESK_UPDATE_LOOK_BACK_HOURS)

    const entitiesToUpdate = await this.prismaService.$queryRaw<PhysicalEntity[]>`
      SELECT e.*
      FROM "PhysicalEntity" e
      WHERE "userId" IS NOT NULL
        AND "uri" IS NOT NULL
        AND ("activeEdeskUpdatedAt" IS NULL OR "activeEdeskUpdatedAt" < ${lookBackDate})
        AND ("activeEdeskUpdateFailedAt" IS NULL OR
             "activeEdeskUpdateFailCount" = 0 OR
             ("activeEdeskUpdateFailedAt" + (POWER(2, least("activeEdeskUpdateFailCount", 7)) * INTERVAL '1 hour') < ${lookBackDate}))
      
      ORDER BY "activeEdeskUpdatedAt" NULLS FIRST
      LIMIT 5;
    `

    if (entitiesToUpdate.length === 0) {
      this.logger.log('No physical entities to update edesk.')
      return
    }

    const entityIdArray = entitiesToUpdate.map((entity) => entity.id)

    await this.physicalEntityService.updateEdeskFromUpvs({ id: { in: entityIdArray } })
  }
}
