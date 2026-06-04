import { Injectable } from '@nestjs/common'
import { DeliveryMethodEnum, DeliveryMethodUserPreferenceEnum } from '@prisma/client'
import pLimit from 'p-limit'
import { z } from 'zod'

import { MailgunService } from '../../mailgun/mailgun.service'
import {
  NorisDeliveryMethodService,
  UpdateNorisDeliveryMethodsData,
} from '../../noris/services/noris-delivery-method.service'
import { DeliveryMethod } from '../../noris/types/noris.enums'
import { PdfGeneratorService } from '../../pdf-generator/pdf-generator.service'
import { ACTIVE_USER_FILTER, PrismaService } from '../../prisma/prisma.service'
import { getTaxDeadlineDate } from '../../utils/constants/tax-deadline'
import {
  DeliveryMethodErrorsEnum,
  DeliveryMethodErrorsResponseEnum,
} from '../../utils/guards/dtos/delivery-method.error'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { DeliveryMethodCodec } from '../../utils/norisCodec'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

const UPLOAD_TAX_DELIVERY_METHOD_BATCH = 100
const LOCK_DELIVERY_METHODS_BATCH = 100
const BATCH_DELAY_MS = 1000
const DELIVERY_METHOD_EMAIL_KEY = 'SEND_DAILY_DELIVERY_METHOD_SUMMARIES'
const DELIVERY_METHOD_EMAIL_CONCURRENCY = 5

const EmailConfigSchema = z.object({
  active: z.boolean(),
})

@Injectable()
export class TaxDeliveryMethodsTasksSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly norisDeliveryMethodService: NorisDeliveryMethodService,
    private readonly mailgunService: MailgunService,
    private readonly pdfGeneratorService: PdfGeneratorService
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

    const data = users.reduce<UpdateNorisDeliveryMethodsData>((acc, user) => {
      // We know that birthNumber is not null from the query.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const birthNumber: string = user.birthNumber!
      const deliveryMethod = DeliveryMethodCodec.decode(user.taxDeliveryMethodAtLockDate)
      const date: string | undefined = user.taxDeliveryMethodCityAccountLockDate
        ? user.taxDeliveryMethodCityAccountLockDate.toISOString().substring(0, 10)
        : undefined

      if (deliveryMethod === DeliveryMethod.CITY_ACCOUNT) {
        if (!date) {
          throw this.throwerErrorGuard.InternalServerErrorException(
            DeliveryMethodErrorsEnum.CITY_ACCOUNT_DELIVERY_METHOD_WITHOUT_DATE,
            DeliveryMethodErrorsResponseEnum.CITY_ACCOUNT_DELIVERY_METHOD_WITHOUT_DATE,
            undefined,
            user
          )
        }
        acc[birthNumber] = { deliveryMethod, date }
      } else {
        acc[birthNumber] = { deliveryMethod }
      }
      return acc
    }, {})

    // Sorted acquisition prevents deadlocks: keys along any wait-chain T1->T2->...->Tn are strictly
    // increasing, so the chain cannot cycle back to T1.
    const sortedBirthNumbers = Object.keys(data).sort((a, b) => a.localeCompare(b))

    // Advisory lock approach: hold a per-birth-number PostgreSQL advisory xact lock from
    // the moment we re-check whether each user is still active until the Noris write
    // completes. A concurrent deactivation either:
    //   (a) set birthNumber=null before our re-check: we skip, deactivation removes from Noris
    //   (b) runs after our lock is acquired: it blocks, waits for our write, then removes from Noris
    // The lock is automatically released when the transaction commits.
    const norisUpdateResponse = await this.prismaService.$transaction(
      async (tx) => {
        for (const bn of sortedBirthNumbers) {
          // eslint-disable-next-line no-await-in-loop -- locks must be acquired sequentially in sorted order to prevent deadlocks
          await NorisDeliveryMethodService.acquireDeliveryMethodLock(tx, bn)
        }

        // Re-check which users are still active now that we hold the locks.
        const stillActiveUsers = await tx.user.findMany({
          where: {
            id: { in: users.map((u) => u.id) },
            birthNumber: { not: null },
            ...ACTIVE_USER_FILTER,
          },
          select: { birthNumber: true },
        })
        const activeBirthNumbers = new Set(
          stillActiveUsers.map((u) => u.birthNumber).filter((bn): bn is string => bn !== null)
        )
        const activeData = Object.fromEntries(
          Object.entries(data).filter(([bn]) => activeBirthNumbers.has(bn))
        )

        if (Object.keys(activeData).length === 0) return null

        // call to Noris happens while the locks are still held.
        return this.norisDeliveryMethodService.updateDeliveryMethods({ data: activeData })
      },
      { timeout: 30_000 }
    )

    // Update the try-timestamp for all users in the batch regardless of outcome.
    await this.prismaService.user.updateMany({
      where: {
        id: { in: users.map((user) => user.id) },
      },
      data: {
        lastTaxDeliveryMethodsUpdateTry: new Date(),
      },
    })

    if (!norisUpdateResponse) return

    const updatedBirthNumbers = norisUpdateResponse.birthNumbers.map((birthNumber) =>
      birthNumber.replaceAll('/', '')
    )

    await this.prismaService.user.updateMany({
      where: {
        birthNumber: { in: updatedBirthNumbers },
      },
      data: {
        lastTaxDeliveryMethodsUpdateYear: currentYear,
      },
    })
  }

  async lockDeliveryMethods(): Promise<void> {
    this.logger.log('Starting lockDeliveryMethods task')
    const jobStartTime = new Date()

    let skip = 0
    let processedCount = 0
    let batchNumber = 1

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this is intentional to process batches sequentially
    while (true) {
      // eslint-disable-next-line no-await-in-loop -- this is intentional to process batches sequentially
      const users = await this.prismaService.user.findMany({
        where: {
          birthNumber: { not: null },
          // Ignore users who may sign up as this job runs
          createdAt: { lt: jobStartTime },
        },
        include: {
          deliveryMethodUserHistory: {
            where: { method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true },
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
        if (user.taxDeliveryMethod === DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT) {
          return {
            birthNumber,
            deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
            date: user.deliveryMethodUserHistory[0]?.createdAt,
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

      // Batch updates for users with same delivery method (only Promises so Promise.all is safe)
      const updatePromises: Promise<unknown>[] = []
      if (edeskUsers.length > 0) {
        updatePromises.push(
          this.prismaService.user.updateMany({
            where: { birthNumber: { in: edeskUsers.map((u) => u.birthNumber) } },
            data: {
              taxDeliveryMethodAtLockDate: DeliveryMethodEnum.EDESK,
              taxDeliveryMethodCityAccountLockDate: null,
            },
          })
        )
      }
      if (postalUsers.length > 0) {
        updatePromises.push(
          this.prismaService.user.updateMany({
            where: { birthNumber: { in: postalUsers.map((u) => u.birthNumber) } },
            data: {
              taxDeliveryMethodAtLockDate: DeliveryMethodEnum.POSTAL,
              taxDeliveryMethodCityAccountLockDate: null,
            },
          })
        )
      }
      updatePromises.push(
        ...cityAccountUsers.map(async (entry) =>
          this.prismaService.user.update({
            where: { birthNumber: entry.birthNumber },
            data: {
              taxDeliveryMethodAtLockDate: entry.deliveryMethod,
              taxDeliveryMethodCityAccountLockDate: entry.date,
            },
          })
        )
      )

      // eslint-disable-next-line no-await-in-loop -- this is intentional to process batches sequentially
      await Promise.all(updatePromises)

      processedCount += users.length
      skip += LOCK_DELIVERY_METHODS_BATCH

      this.logger.log(`Completed batch ${batchNumber}. Total processed: ${processedCount} users`)

      // Break between batches (except for the last one)
      if (users.length === LOCK_DELIVERY_METHODS_BATCH) {
        this.logger.log(`Waiting ${BATCH_DELAY_MS}ms before next batch...`)
        // eslint-disable-next-line no-await-in-loop -- this is intentional to process batches sequentially
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

  private async findUsersWithDeliveryMethodChanges(
    yesterdayStart: Date,
    yesterdayEnd: Date
  ): Promise<string[]> {
    const [deliveryMethodChanges, edeskChanges] = await Promise.all([
      this.prismaService.deliveryMethodPreferenceHistory.findMany({
        where: {
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
    const userIdsFromUserMethod = new Set(deliveryMethodChanges.map((c) => c.userId))
    const userIdsFromEdesk = new Set(
      edeskChanges.map((e) => e.userId).filter((id): id is string => id !== null)
    )

    return Array.from(new Set([...userIdsFromUserMethod, ...userIdsFromEdesk]))
  }

  private async fetchUsersWithPhysicalEntityData(userIds: string[]) {
    return this.prismaService.user.findMany({
      where: { id: { in: userIds } },
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
  }

  private async fetchDeliveryMethodChangesForUsers(
    userIds: string[],
    yesterdayStart: Date,
    yesterdayEnd: Date
  ) {
    const [latestDeliveryMethod, previousDeliveryMethod, yesterdayDeliveryMethodChange] =
      await Promise.all([
        // Latest delivery-method change for each user (all time).
        this.prismaService.deliveryMethodPreferenceHistory.findMany({
          where: { userId: { in: userIds } },
          orderBy: { createdAt: 'desc' },
          distinct: ['userId'],
          select: { userId: true, method: true, createdAt: true },
        }),

        // Previous state (before yesterday) for each user.
        this.prismaService.deliveryMethodPreferenceHistory.findMany({
          where: { userId: { in: userIds }, createdAt: { lt: yesterdayStart } },
          orderBy: { createdAt: 'desc' },
          distinct: ['userId'],
          select: { userId: true, method: true, createdAt: true },
        }),

        // Changes that happened yesterday only.
        this.prismaService.deliveryMethodPreferenceHistory.findMany({
          where: {
            userId: { in: userIds },
            createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
          },
          orderBy: { createdAt: 'desc' },
          distinct: ['userId'],
          select: { userId: true, method: true, createdAt: true },
        }),
      ])

    const toMap = (
      rows: { userId: string; method: DeliveryMethodUserPreferenceEnum; createdAt: Date }[]
    ) => new Map(rows.map((r) => [r.userId, { method: r.method, createdAt: r.createdAt }]))

    return {
      latestDeliveryMethod: toMap(latestDeliveryMethod),
      previousDeliveryMethod: toMap(previousDeliveryMethod),
      yesterdayDeliveryMethodChange: toMap(yesterdayDeliveryMethodChange),
    }
  }

  private async sendDeliveryMethodChangedEmail(
    userId: string,
    userEmail: string,
    externalId: string,
    deliveryMethod: 'edesk' | 'postal' | 'email',
    options?: {
      birthNumber?: string
      reason?: 'edesk-deactivated' | 'delivery-method-preference-change'
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

      const logSuffixMap = {
        'edesk-deactivated': ' (eDesk deactivated)',
        'delivery-method-preference-change': ' (Delivery preference change)',
      } as const satisfies Record<'edesk-deactivated' | 'delivery-method-preference-change', string>
      const logSuffix = options?.reason ? logSuffixMap[options.reason] : ''
      this.logger.log(`Sent ${deliveryMethodLabel} activation email to user ${userId}${logSuffix}`)
    } catch (err) {
      this.logger.error(`Failed to send ${deliveryMethod} email for user ${userId}`, err)
    }
  }

  private async processUserDeliveryMethodChange(
    user: {
      id: string
      email: string | null
      externalId: string | null
      birthNumber: string | null
      physicalEntity: {
        activeEdesk: boolean | null
        edeskStatusChangedAt: Date | null
      } | null
    },
    latestDeliveryMethod:
      | { method: DeliveryMethodUserPreferenceEnum | null; createdAt: Date }
      | undefined,
    previousDeliveryMethod:
      | { method: DeliveryMethodUserPreferenceEnum | null; createdAt: Date }
      | undefined,
    yesterdayDeliveryMethod:
      | { method: DeliveryMethodUserPreferenceEnum | null; createdAt: Date }
      | undefined,
    yesterdayStart: Date,
    yesterdayEnd: Date
  ): Promise<void> {
    if (!user.email || !user.externalId || !user.birthNumber) {
      this.logger.warn(`Skipping user ${user.id}: Missing email, externalId or birth number.`)
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
        this.logger.log(`Skipping user ${user.id}: eDesk is active but didn't change yesterday.`)
        return
      }
      await this.sendDeliveryMethodChangedEmail(user.id, user.email, user.externalId, 'edesk')
      return
    }

    // Handle eDesk deactivation - check current delivery preference
    if (edeskChangedYesterday) {
      if (latestDeliveryMethod?.method === DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT) {
        await this.sendDeliveryMethodChangedEmail(user.id, user.email, user.externalId, 'email', {
          birthNumber: user.birthNumber,
        })
      } else {
        await this.sendDeliveryMethodChangedEmail(user.id, user.email, user.externalId, 'postal', {
          reason: 'edesk-deactivated',
        })
      }
      return
    }

    // Handle Delivery method changes (when eDesk didn't change)

    if (!yesterdayDeliveryMethod) {
      this.logger.log(
        `Skipping user ${user.id}: No user delivery preference or eDesk changes yesterday.`
      )
      return
    }

    const currentMethod = yesterdayDeliveryMethod.method
    const previousMethod = previousDeliveryMethod?.method

    if (currentMethod === previousMethod) {
      this.logger.log(
        `Skipping user ${user.id}: delivery preference state unchanged (${currentMethod}).`
      )
      return
    }

    // Send appropriate email based on Delivery preference change
    if (currentMethod === DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT) {
      await this.sendDeliveryMethodChangedEmail(user.id, user.email, user.externalId, 'email', {
        birthNumber: user.birthNumber,
      })
    } else {
      await this.sendDeliveryMethodChangedEmail(user.id, user.email, user.externalId, 'postal', {
        reason: 'delivery-method-preference-change',
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

    // Fetch all userIds with detected delivery method change during the previous day.
    const allUserIds = await this.findUsersWithDeliveryMethodChanges(yesterdayStart, yesterdayEnd)

    this.logger.log(`Found ${allUserIds.length} users with delivery method changes`)

    // Batch fetch all required data
    const [users, { latestDeliveryMethod, previousDeliveryMethod, yesterdayDeliveryMethodChange }] =
      await Promise.all([
        this.fetchUsersWithPhysicalEntityData(allUserIds),
        this.fetchDeliveryMethodChangesForUsers(allUserIds, yesterdayStart, yesterdayEnd),
      ])

    // Process all users with in-memory data.
    await this.pdfGeneratorService.withSharedBrowser(async () => {
      const limit = pLimit(DELIVERY_METHOD_EMAIL_CONCURRENCY)
      await Promise.all(
        users.map(async (user) =>
          limit(async () => {
            await this.processUserDeliveryMethodChange(
              user,
              latestDeliveryMethod.get(user.id),
              previousDeliveryMethod.get(user.id),
              yesterdayDeliveryMethodChange.get(user.id),
              yesterdayStart,
              yesterdayEnd
            )
          })
        )
      )
    })
  }
}
