import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { PrismaService } from '../../prisma/prisma.service'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

@Injectable()
export class CleanupTasksSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(private readonly prismaService: PrismaService) {
    this.logger = new LineLoggerSubservice(CleanupTasksSubservice.name)
  }

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
}
