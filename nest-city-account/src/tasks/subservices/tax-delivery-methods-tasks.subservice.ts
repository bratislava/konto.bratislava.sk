import { Injectable } from '@nestjs/common'
import { RequestUpdateNorisDeliveryMethodsDtoDataValue } from 'openapi-clients/tax'
import { ACTIVE_USER_FILTER, PrismaService } from '../../prisma/prisma.service'
import { getTaxDeadlineDate } from '../../utils/constants/tax-deadline'
import { ErrorsEnum, ErrorsResponseEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { DeliveryMethodNoris } from '../../utils/types/tax.types'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { TaxSubservice } from '../../utils/subservices/tax.subservice'
import { DeliveryMethodEnum, GDPRCategoryEnum, GDPRSubTypeEnum, GDPRTypeEnum } from '@prisma/client'
import { DeliveryMethodCodec } from '../../utils/norisCodec'
import {
  DeliveryMethodErrorsEnum,
  DeliveryMethodErrorsResponseEnum,
} from '../../utils/guards/dtos/delivery-method.error'
import { MailgunService } from '../../mailgun/mailgun.service'
import { z } from 'zod'

const UPLOAD_TAX_DELIVERY_METHOD_BATCH = 100
const LOCK_DELIVERY_METHODS_BATCH = 100
const BATCH_DELAY_MS = 1000
const DELIVERY_METHOD_EMAIL_KEY = 'SEND_DAILY_DELIVERY_METHOD_SUMMARIES'

const EmailConfigSchema = z.object({
  active: z.boolean(),
})

@Injectable()
export class TaxDeliveryMethodsTasksSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly taxSubservice: TaxSubservice,
    private readonly mailgunService: MailgunService
  ) {
    this.logger = new LineLoggerSubservice(TaxDeliveryMethodsTasksSubservice.name)
  }

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
              taxDeliveryMethodCityAccountLockDate: null,
            },
          }),

        // POSTAL users - all have undefined date
        postalUsers.length > 0 &&
          this.prismaService.user.updateMany({
            where: { birthNumber: { in: postalUsers.map((u) => u.birthNumber) } },
            data: {
              taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
              taxDeliveryMethodCityAccountLockDate: null,
            },
          }),

        // CITY_ACCOUNT users still need individual updates due to different dates
        ...cityAccountUsers.map((entry) =>
          this.prismaService.user.update({
            where: { birthNumber: entry.birthNumber },
            data: {
              taxDeliveryMethodAtLockDate: entry.deliveryMethod,
              taxDeliveryMethodCityAccountLockDate: entry.date,
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

  private getYesterdayRange() {
    const yesterdayStart = new Date()
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    yesterdayStart.setHours(0, 0, 0, 0)

    const yesterdayEnd = new Date()
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)
    yesterdayEnd.setHours(23, 59, 59, 999)

    return { yesterdayStart, yesterdayEnd }
  }

  private async checkEmailConfigActive(): Promise<boolean> {
    const configDbResult = await this.prismaService.config.findFirst({
      where: { key: DELIVERY_METHOD_EMAIL_KEY },
      select: { value: true },
    })

    if (!configDbResult) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `${DELIVERY_METHOD_EMAIL_KEY} not found in database config.`
      )
    }

    return EmailConfigSchema.parse(configDbResult.value).active
  }

  private async findUsersWithDeliveryMethodChanges(yesterdayStart: Date, yesterdayEnd: Date) {
    const [gdprChanges, edeskChanges] = await Promise.all([
      // Find all users with GDPR changes yesterday (excluding those with active eDesk)
      this.prismaService.userGdprData.findMany({
        where: {
          category: GDPRCategoryEnum.TAXES,
          type: GDPRTypeEnum.FORMAL_COMMUNICATION,
          createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
          user: {
            physicalEntity: {
              OR: [{ activeEdesk: false }, { activeEdesk: null }],
            },
          },
        },
        distinct: ['userId'],
        orderBy: { createdAt: 'desc' },
        select: { userId: true },
      }),

      // Find all users with eDesk status changes yesterday
      this.prismaService.physicalEntity.findMany({
        where: {
          edeskStatusChangedAt: { gte: yesterdayStart, lte: yesterdayEnd },
          user: { isNot: null },
        },
        include: {
          user: {
            select: { id: true, email: true, externalId: true, birthNumber: true },
          },
        },
      }),
    ])

    // Combine both sets of changes, deduplicate by userId
    const userIdsFromGdpr = new Set(gdprChanges.map((c) => c.userId))
    const userIdsFromEdesk = new Set(
      edeskChanges.map((e) => e.userId).filter((id): id is string => id !== null)
    )

    return Array.from(new Set([...userIdsFromGdpr, ...userIdsFromEdesk]))
  }

  private async sendDeliveryMethodChangedEmail(
    userId: string,
    userEmail: string,
    externalId: string,
    deliveryMethod: 'edesk' | 'postal' | 'email',
    options?: {
      birthNumber?: string
      reason?: 'edesk-deactivated' | 'gdpr-change'
    }
  ): Promise<void> {
    try {
      await this.mailgunService.sendEmail('2025-delivery-method-changed-from-user-data', {
        userEmail,
        externalId,
        deliveryMethod,
        ...(options?.birthNumber && { birthNumber: options.birthNumber }),
      })

      const deliveryMethodLabel = {
        edesk: 'eDesk',
        postal: 'postal',
        email: 'City Account',
      }[deliveryMethod]

      const logSuffix = options?.reason === 'edesk-deactivated' ? ' (eDesk deactivated)' : ''
      this.logger.log(`Sent ${deliveryMethodLabel} activation email to user ${userId}${logSuffix}`)
    } catch (err) {
      this.logger.error(`Failed to send ${deliveryMethod} email for user ${userId}`, err)
    }
  }

  private async processUserDeliveryMethodChange(
    userId: string,
    yesterdayStart: Date,
    yesterdayEnd: Date
  ): Promise<void> {
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
      return
    }

    const edeskChangedYesterday =
      user.physicalEntity?.edeskStatusChangedAt &&
      user.physicalEntity.edeskStatusChangedAt >= yesterdayStart &&
      user.physicalEntity.edeskStatusChangedAt <= yesterdayEnd

    const currentEdeskActive = user.physicalEntity?.activeEdesk

    // Handle eDesk active state
    if (currentEdeskActive === true) {
      if (!edeskChangedYesterday) {
        this.logger.log(`Skipping user ${userId}: eDesk is active but didn't change yesterday.`)
        return
      }
      await this.sendDeliveryMethodChangedEmail(userId, user.email, user.externalId, 'edesk')
      return
    }

    // Handle eDesk deactivation - check current GDPR preference
    if (edeskChangedYesterday) {
      const latestGdprState = await this.prismaService.userGdprData.findFirst({
        where: {
          userId,
          category: GDPRCategoryEnum.TAXES,
          type: GDPRTypeEnum.FORMAL_COMMUNICATION,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (latestGdprState?.subType === GDPRSubTypeEnum.subscribe) {
        await this.sendDeliveryMethodChangedEmail(userId, user.email, user.externalId, 'email', {
          birthNumber: user.birthNumber,
        })
      } else {
        await this.sendDeliveryMethodChangedEmail(userId, user.email, user.externalId, 'postal', {
          reason: 'edesk-deactivated',
        })
      }
      return
    }

    // Handle GDPR changes (when eDesk didn't change)
    const latestGdprChange = await this.prismaService.userGdprData.findFirst({
      where: {
        userId,
        category: GDPRCategoryEnum.TAXES,
        type: GDPRTypeEnum.FORMAL_COMMUNICATION,
        createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!latestGdprChange) {
      this.logger.log(`Skipping user ${userId}: No GDPR or eDesk changes yesterday.`)
      return
    }

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

    if (currentSubType === previousSubType) {
      this.logger.log(`Skipping user ${userId}: GDPR state unchanged (${currentSubType}).`)
      return
    }

    // Send appropriate email based on GDPR change
    if (currentSubType === GDPRSubTypeEnum.subscribe) {
      await this.sendDeliveryMethodChangedEmail(userId, user.email, user.externalId, 'email', {
        birthNumber: user.birthNumber,
      })
    } else {
      await this.sendDeliveryMethodChangedEmail(userId, user.email, user.externalId, 'postal', {
        reason: 'gdpr-change',
      })
    }
  }

  async sendDailyDeliveryMethodSummaries() {
    const active = await this.checkEmailConfigActive()
    if (!active) {
      return
    }

    const { yesterdayStart, yesterdayEnd } = this.getYesterdayRange()

    this.logger.log(`Processing delivery method summaries for: ${yesterdayStart.toDateString()}`)

    const allUserIds = await this.findUsersWithDeliveryMethodChanges(yesterdayStart, yesterdayEnd)

    this.logger.log(`Found ${allUserIds.length} users with delivery method changes`)

    await Promise.all(
      allUserIds.map((userId) => this.processUserDeliveryMethodChange(userId, yesterdayStart, yesterdayEnd))
    )
  }
}
