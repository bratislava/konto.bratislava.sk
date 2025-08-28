import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { RequestUpdateNorisDeliveryMethodsDtoDataValue } from 'openapi-clients/tax'
import { ACTIVE_USER_FILTER, PrismaService } from '../prisma/prisma.service'
import { addSlashToBirthNumber } from '../utils/birthNumbers'
import { getTaxDeadlineDate } from '../utils/constants/tax-deadline'
import HandleErrors from '../utils/decorators/errorHandler.decorators'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { DeliveryMethodNoris } from '../utils/types/tax.types'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { TaxSubservice } from '../utils/subservices/tax.subservice'
import { PhysicalEntityService } from '../physical-entity/physical-entity.service'
import {
  DeliveryMethodEnum,
  GDPRCategoryEnum,
  GDPRSubTypeEnum,
  GDPRTypeEnum,
  PhysicalEntity,
} from '@prisma/client'
import { DeliveryMethodCodec } from '../utils/norisCodec'

import {
  DeliveryMethodErrorsEnum,
  DeliveryMethodErrorsResponseEnum,
} from '../utils/guards/dtos/delivery-method.error'

const UPLOAD_BIRTHNUMBERS_BATCH = 100
const UPLOAD_TAX_DELIVERY_METHOD_BATCH = 100

const LOCK_DELIVERY_METHODS_BATCH = 100
const BATCH_DELAY_MS = 1000

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
        lastTaxBackendUploadTry: {
          sort: 'asc',
          nulls: 'first',
        },
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
        taxDeliveryMethodAtLockDate: {
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
      select: {
        id: true,
        birthNumber: true,
        taxDeliveryMethodAtLockDate: true,
        taxDeliveryMethodCityAccountLockDate: true,
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
        const deliveryMethod = DeliveryMethodCodec.decode(user.taxDeliveryMethodAtLockDate)
        const date: string | undefined = user.taxDeliveryMethodCityAccountLockDate
          ? user.taxDeliveryMethodCityAccountLockDate.toISOString().substring(0, 10)
          : undefined
        if (date) {
          acc[birthNumber] = { deliveryMethod, date }
        } else {
          if (deliveryMethod === DeliveryMethodNoris.CITY_ACCOUNT) {
            throw this.throwerErrorGuard.InternalServerErrorException(
              DeliveryMethodErrorsEnum.CITY_ACCOUNT_DELIVERY_METHOD_WITHOUT_DATE,
              DeliveryMethodErrorsResponseEnum.CITY_ACCOUNT_DELIVERY_METHOD_WITHOUT_DATE,
              undefined,
              user
            )
          }

          acc[birthNumber] = { deliveryMethod }
        }
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

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  @HandleErrors('CronError')
  async alertFailingEdeskUpdate(): Promise<void> {
    const entitiesFailedToUpdate = await this.prismaService.physicalEntity.findMany({
      where: { activeEdeskUpdateFailCount: { gte: 7 } },
      select: {
        id: true,
        birthNumber: true,
        activeEdeskUpdateFailCount: true,
      },
    })

    if (entitiesFailedToUpdate.length === 0) {
      return
    }

    this.logger.error('Entities that failed to update at least 7 times in a row: ', {
      entities: entitiesFailedToUpdate,
      alert: 1,
    })
  }

  @Cron('0 0 1 4 *')
  @HandleErrors('Cron')
  async lockDeliveryMethods(): Promise<void> {
    this.logger.log('Starting lockDeliveryMethods task')
    const jobStartTime = new Date()

    let skip = 0
    let processedCount = 0
    let batchNumber = 1

    while (true) {
      const users = await this.prismaService.user.findMany({
        where: {
          birthNumber: { not: null },
          // Ignore users who may sign up as this job runs
          createdAt: { lt: jobStartTime },
        },
        include: {
          userGdprData: {
            orderBy: {
              createdAt: 'desc',
            },
            where: {
              category: GDPRCategoryEnum.TAXES,
              type: GDPRTypeEnum.FORMAL_COMMUNICATION,
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
        skip,
        take: LOCK_DELIVERY_METHODS_BATCH,
        orderBy: {
          id: 'asc', // Ensure consistent ordering
        },
      })

      if (users.length === 0) {
        break
      }

      this.logger.log(`Processing batch ${batchNumber} with ${users.length} users`)

      const data = users.map((user) => {
        // We know that birthNumber is not null from the query.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const birthNumber: string = user.birthNumber!

        if (user.physicalEntity?.activeEdesk) {
          return { birthNumber, deliveryMethod: DeliveryMethodEnum.EDESK, date: undefined }
        }
        if (user.userGdprData?.[0]?.subType === GDPRSubTypeEnum.subscribe) {
          return {
            birthNumber,
            deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
            date: user.userGdprData[0].createdAt,
          }
        }
        return { birthNumber, deliveryMethod: DeliveryMethodEnum.POSTAL, date: undefined }
      })

      // Group users by delivery method
      const edeskUsers = data.filter((entry) => entry.deliveryMethod === DeliveryMethodEnum.EDESK)
      const postalUsers = data.filter((entry) => entry.deliveryMethod === DeliveryMethodEnum.POSTAL)
      const cityAccountUsers = data.filter(
        (entry) => entry.deliveryMethod === DeliveryMethodEnum.CITY_ACCOUNT
      )

      // Batch updates for users with same delivery method
      const updatePromises = [
        // EDESK users - all have undefined date
        edeskUsers.length > 0 &&
          this.prismaService.user.updateMany({
            where: { birthNumber: { in: edeskUsers.map((u) => u.birthNumber) } },
            data: {
              taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
              taxDeliveryMethodCityAccountDate: null,
            },
          }),

        // POSTAL users - all have undefined date
        postalUsers.length > 0 &&
          this.prismaService.user.updateMany({
            where: { birthNumber: { in: postalUsers.map((u) => u.birthNumber) } },
            data: {
              taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
              taxDeliveryMethodCityAccountDate: null,
            },
          }),

        // CITY_ACCOUNT users still need individual updates due to different dates
        ...cityAccountUsers.map((entry) =>
          this.prismaService.user.update({
            where: { birthNumber: entry.birthNumber },
            data: {
              taxDeliveryMethodAtLockDate: entry.deliveryMethod,
              taxDeliveryMethodCityAccountDate: entry.date,
            },
          })
        ),
        // If postalUsers.length > 0 or edeskUsers.length > 0 evaluates to false, we want to filter out this result
      ].filter(Boolean)

      await Promise.all(updatePromises)

      processedCount += users.length
      skip += LOCK_DELIVERY_METHODS_BATCH

      this.logger.log(`Completed batch ${batchNumber}. Total processed: ${processedCount} users`)

      // Break between batches (except for the last one)
      if (users.length === LOCK_DELIVERY_METHODS_BATCH) {
        this.logger.log(`Waiting ${BATCH_DELAY_MS}ms before next batch...`)
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
        batchNumber++
      }
      // let's break when zero users are
    }

    this.logger.log(`Completed lockDeliveryMethods task. Total processed: ${processedCount} users`)
  }
}
