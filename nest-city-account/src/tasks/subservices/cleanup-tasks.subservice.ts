import { LineLoggerSubservice } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'

import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class CleanupTasksSubservice {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LineLoggerSubservice
  ) {}

  async deleteOldUserVerificationData() {
    const today = new Date()
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1))

    const deletedUserVerifications = await this.prismaService.userIdCardVerify.deleteMany({
      where: {
        verifyStart: {
          lt: oneMonthAgo,
        },
      },
    })

    const deletedLegalPersonVerifications =
      await this.prismaService.legalPersonIcoIdCardVerify.deleteMany({
        where: {
          verifyStart: {
            lt: oneMonthAgo,
          },
        },
      })

    this.logger.log('Deleted old user verification data', {
      cutoff: oneMonthAgo,
      deletedUserIdCardVerifyCount: deletedUserVerifications.count,
      deletedLegalPersonIcoIdCardVerifyCount: deletedLegalPersonVerifications.count,
    })
  }

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
        authorizationCodeCreatedAt: true,
      },
    })

    if (expiredRecords.length === 0) {
      return
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

    // Logged only after the update succeeded. The codes can no longer be exchanged, so logging them
    // lets us tell a late request with a cleaned-up code apart from a made-up one.
    for (const record of expiredRecords) {
      this.logger.warn(`Cleaned up expired oAuth2 tokens with id: ${record.id}`, {
        authorizationCode: record.authorizationCode,
        authorizationCodeCreatedAt: record.authorizationCodeCreatedAt,
      })
    }

    this.logger.debug(
      `Cleaned up expired authorization codes for ${expiredRecords.length} oAuth2 records.`,
      { cutoff: fiveMinutesAgo }
    )
  }

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

    await this.prismaService.oAuth2Data.deleteMany({
      where: {
        id: {
          in: oldRecords.map((record) => record.id),
        },
      },
    })

    // Logged only after the delete succeeded, so the codes are gone for good. See
    // cleanupExpiredAuthorizationCodes for why the codes themselves are logged.
    const recordsInfo = oldRecords.map((r) => `${r.id}/${r.authorizationCode}`).join(', ')
    this.logger.log(`Deleted ${oldRecords.length} old oAuth2 records: ${recordsInfo}`, {
      cutoff: oneMonthAgo,
      recordCount: oldRecords.length,
    })
  }
}
