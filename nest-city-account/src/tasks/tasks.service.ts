import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DateTime } from 'luxon'
import { RequestUpdateNorisDeliveryMethodsDtoDataValue } from 'openapi-clients/tax'
import { ACTIVE_USER_FILTER, PrismaService } from '../prisma/prisma.service'
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
import { MailgunService } from '../mailgun/mailgun.service'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { PdfGeneratorService } from '../pdf-generator/pdf-generator.service'
import { z } from 'zod'

const UPLOAD_TAX_DELIVERY_METHOD_BATCH = 100

const LOCK_DELIVERY_METHODS_BATCH = 100
const BATCH_DELAY_MS = 1000

const EDESK_UPDATE_LOOK_BACK_HOURS = 96

const DELIVERY_METHOD_EMAIL_KEY = 'SEND_DAILY_DELIVERY_METHOD_SUMMARIES'

const EmailConfigSchema = z.object({
  active: z.boolean(),
})

@Injectable()
export class TasksService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly taxSubservice: TaxSubservice,
    private readonly physicalEntityService: PhysicalEntityService,
    private readonly mailgunService: MailgunService,
    private readonly cognitoSubsevice: CognitoSubservice,
    private readonly pdfGeneratorService: PdfGeneratorService
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

  @Cron(`*/5 * 2-31 ${process.env.MUNICIPAL_TAX_LOCK_MONTH}-12 *`) // Every 5 minutes from MUNICIPAL_TAX_LOCK_MONTH (February), starting from 2nd.
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
      orderBy: {
        lastTaxDeliveryMethodsUpdateTry: 'asc',
      },
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

    const updateResponse = await this.taxSubservice.updateDeliveryMethodsInNoris({ data })
    const updatedBirthNumbers = updateResponse.data.birthNumbers.map((birthNumber) =>
      birthNumber.replaceAll('/', '')
    )

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
        birthNumber: {
          in: updatedBirthNumbers,
        },
      },
      data: {
        lastTaxDeliveryMethodsUpdateYear: currentYear,
      },
    })

    // For all users, not only those who were updated, we should set the last timestamp of trying to update delivery methods in Noris.
    await this.prismaService.user.updateMany({
      where: {
        id: {
          in: users.map((user) => user.id),
        },
      },
      data: {
        lastTaxDeliveryMethodsUpdateTry: new Date(),
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
      
      ORDER BY greatest("activeEdeskUpdatedAt", "activeEdeskUpdateFailedAt") NULLS FIRST
      LIMIT 5;
    `

    if (entitiesToUpdate.length === 0) {
      this.logger.log('No physical entities to update edesk.')
      return
    }

    await this.physicalEntityService.updateEdeskFromUpvs(entitiesToUpdate)
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

  @Cron(CronExpression.EVERY_5_MINUTES)
  @HandleErrors('CronError')
  async cleanupExpiredAuthorizationCodes(): Promise<void> {
    const fiveMinutesAgo = DateTime.now().minus({ minutes: 5 }).toJSDate()

    const expiredRecords = await this.prismaService.oAuth2Data.findMany({
      where: {
        authorizationCodeCreatedAt: {
          not: null,
          lt: fiveMinutesAgo,
        },
        refreshTokenEnc: {
          not: null,
        },
      },
      select: {
        id: true,
        authorizationCode: true,
      },
    })

    if (expiredRecords.length === 0) {
      return
    }

    for (const record of expiredRecords) {
      this.logger.warn(
        `Cleaning up expired oAuth2 tokens with id: ${record.id} and authorization code: ${record.authorizationCode}`
      )
    }

    await this.prismaService.oAuth2Data.updateMany({
      where: {
        id: {
          in: expiredRecords.map((record) => record.id),
        },
      },
      data: {
        accessTokenEnc: null,
        idTokenEnc: null,
        refreshTokenEnc: null,
      },
    })

    this.logger.debug(
      `Cleaned up expired authorization codes for ${expiredRecords.length} oAuth2 records.`
    )
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  @HandleErrors('CronError')
  async deleteOldOAuth2Data(): Promise<void> {
    const oneMonthAgo = DateTime.now().minus({ months: 1 }).toJSDate()

    const oldRecords = await this.prismaService.oAuth2Data.findMany({
      where: {
        OR: [
          {
            authorizationCodeCreatedAt: {
              not: null,
              lt: oneMonthAgo,
            },
          },
          {
            authorizationCodeCreatedAt: null,
            createdAt: {
              lt: oneMonthAgo,
            },
          },
        ],
      },
      select: {
        id: true,
        authorizationCode: true,
      },
    })

    if (oldRecords.length === 0) {
      return
    }

    const recordsInfo = oldRecords.map((r) => `${r.id}/${r.authorizationCode}`).join(', ')
    this.logger.log(`Deleting ${oldRecords.length} old oAuth2 records: ${recordsInfo}`)

    await this.prismaService.oAuth2Data.deleteMany({
      where: {
        id: {
          in: oldRecords.map((record) => record.id),
        },
      },
    })
  }

  @Cron(`0 0 ${process.env.MUNICIPAL_TAX_LOCK_DAY} ${process.env.MUNICIPAL_TAX_LOCK_MONTH} *`)
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
    }

    this.logger.log(`Completed lockDeliveryMethods task. Total processed: ${processedCount} users`)
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('Cron')
  async sendDailyDeliveryMethodSummaries() {
    const configDbResult = await this.prismaService.config.findFirst({
      where: {
        key: DELIVERY_METHOD_EMAIL_KEY,
      },
      select: {
        value: true,
      },
    })
    if (!configDbResult) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `${DELIVERY_METHOD_EMAIL_KEY} not found in database config.`
      )
    }
    const active = EmailConfigSchema.parse(configDbResult.value).active
    if (!active) {
      return
    }

    const yesterdayStart = new Date()
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    yesterdayStart.setHours(0, 0, 0, 0)

    const yesterdayEnd = new Date()
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)
    yesterdayEnd.setHours(23, 59, 59, 999)

    this.logger.log(`Processing delivery method summaries for: ${yesterdayStart.toDateString()}`)

    // Find all users with GDPR changes yesterday (excluding those with active eDesk)
    const gdprChanges = await this.prismaService.userGdprData.findMany({
      where: {
        category: GDPRCategoryEnum.TAXES,
        type: GDPRTypeEnum.FORMAL_COMMUNICATION,
        createdAt: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
        user: {
          physicalEntity: {
            OR: [{ activeEdesk: false }, { activeEdesk: null }],
          },
        },
      },
      distinct: ['userId'],
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        userId: true,
      },
    })

    // Find all users with eDesk status changes yesterday
    const edeskChanges = await this.prismaService.physicalEntity.findMany({
      where: {
        edeskStatusChangedAt: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
        user: {
          isNot: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            externalId: true,
            birthNumber: true,
          },
        },
      },
    })

    // Combine both sets of changes, deduplicate by userId
    const userIdsFromGdpr = new Set(gdprChanges.map((c) => c.userId))
    const userIdsFromEdesk = new Set(
      edeskChanges.map((e) => e.userId).filter((id): id is string => id !== null)
    )
    const allUserIds = Array.from(new Set([...userIdsFromGdpr, ...userIdsFromEdesk]))

    this.logger.log(`Found ${allUserIds.length} users with delivery method changes`)

    for (const userId of allUserIds) {
      // Get full user data with current state
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          externalId: true,
          birthNumber: true,
          physicalEntity: {
            select: {
              activeEdesk: true,
              edeskStatusChangedAt: true,
            },
          },
        },
      })

      if (!user || !user.email || !user.externalId || !user.birthNumber) {
        this.logger.warn(`Skipping user ${userId}: Missing email, externalId or birth number.`)
        continue
      }

      // Check if eDesk is currently active
      const currentEdeskActive = user.physicalEntity?.activeEdesk

      // If eDesk is currently active, it overrides everything - only check eDesk changes
      if (currentEdeskActive === true) {
        // Check if eDesk changed yesterday
        const edeskChangedYesterday =
          user.physicalEntity?.edeskStatusChangedAt &&
          user.physicalEntity.edeskStatusChangedAt >= yesterdayStart &&
          user.physicalEntity.edeskStatusChangedAt <= yesterdayEnd

        if (!edeskChangedYesterday) {
          this.logger.log(`Skipping user ${userId}: eDesk is active but didn't change yesterday.`)
          continue
        }

        // eDesk was activated yesterday, send eDesk activation email
        try {
          const cognitoData = await this.cognitoSubsevice.getDataFromCognito(user.externalId)
          const firstName = cognitoData.given_name

          await this.mailgunService.sendEmail('placeholder-edesk-activated', {
            to: user.email,
            variables: { firstName: firstName ?? null },
          })

          this.logger.log(`Sent eDesk activation email to user ${userId}`)
        } catch (err) {
          this.logger.error(`Failed to send eDesk activation email for user ${userId}`, err)
        }
        continue
      }

      // eDesk is not active (false or null) - check if it changed yesterday
      // The trigger skips null->false changes, so if edeskStatusChangedAt changed, it's meaningful
      const edeskChangedYesterday =
        user.physicalEntity?.edeskStatusChangedAt &&
        user.physicalEntity.edeskStatusChangedAt >= yesterdayStart &&
        user.physicalEntity.edeskStatusChangedAt <= yesterdayEnd

      if (edeskChangedYesterday) {
        // eDesk was deactivated (true -> false/null), send postal email
        try {
          const cognitoData = await this.cognitoSubsevice.getDataFromCognito(user.externalId)
          const firstName = cognitoData.given_name

          await this.mailgunService.sendEmail('placeholder-postal-activated', {
            to: user.email,
            variables: { firstName: firstName ?? null },
          })

          this.logger.log(`Sent postal activation email to user ${userId} (eDesk deactivated)`)
        } catch (err) {
          this.logger.error(`Failed to send postal activation email for user ${userId}`, err)
        }
        continue
      }

      // eDesk is not active and didn't change - check GDPR changes
      const latestGdprChange = await this.prismaService.userGdprData.findFirst({
        where: {
          userId,
          category: GDPRCategoryEnum.TAXES,
          type: GDPRTypeEnum.FORMAL_COMMUNICATION,
          createdAt: {
            gte: yesterdayStart,
            lte: yesterdayEnd,
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      if (!latestGdprChange) {
        this.logger.log(`Skipping user ${userId}: No GDPR or eDesk changes yesterday.`)
        continue
      }

      // Check previous GDPR state
      const previousGdprState = await this.prismaService.userGdprData.findFirst({
        where: {
          userId,
          category: GDPRCategoryEnum.TAXES,
          type: GDPRTypeEnum.FORMAL_COMMUNICATION,
          createdAt: { lt: yesterdayStart },
        },
        orderBy: { createdAt: 'desc' },
      })

      const currentSubType = latestGdprChange.subType
      const previousSubType = previousGdprState?.subType

      // No change in GDPR state
      if (currentSubType === previousSubType) {
        this.logger.log(`Skipping user ${userId}: GDPR state unchanged (${currentSubType}).`)
        continue
      }

      // Determine which email to send based on the change
      try {
        const cognitoData = await this.cognitoSubsevice.getDataFromCognito(user.externalId)
        const firstName = cognitoData.given_name
        const fullName = `${cognitoData.given_name ?? ''} ${cognitoData.family_name ?? ''}`.trim()

        if (currentSubType === GDPRSubTypeEnum.subscribe) {
          // Changed to City Account
          const pdfFile = await this.pdfGeneratorService.generateFromTemplate(
            'delivery-method-set-to-notification',
            'oznamenie.pdf',
            {
              email: user.email,
              name: fullName,
              birthNumber: user.birthNumber,
              date: new Date().toLocaleDateString('sk'),
            },
            user.birthNumber
          )

          await this.mailgunService.sendEmail('2025-delivery-method-changed-notify', {
            to: user.email,
            variables: { firstName: firstName ?? null },
            attachment: pdfFile,
          })

          this.logger.log(`Sent City Account activation email to user ${userId}`)
        } else {
          // Changed to unsubscribe (Postal)
          await this.mailgunService.sendEmail('placeholder-postal-activated', {
            to: user.email,
            variables: { firstName: firstName ?? null },
          })

          this.logger.log(`Sent postal activation email to user ${userId}`)
        }
      } catch (err) {
        this.logger.error(`Failed to send email for user ${userId}`, err)
      }
    }
  }
}
