import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { AuthUser } from '../../auth-v2/types/user'
import PrismaService from '../../prisma/prisma.service'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'

const MIGRATION_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

const getMigrationExpirationDate = () => {
  const now = new Date()
  return new Date(now.getTime() + MIGRATION_EXPIRATION_TIME)
}

@Injectable()
export class FormMigrationsService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly logger = new LineLoggerSubservice(FormMigrationsService.name)

  /**
   * Prepares a migration record if forms exist for the given guest identity.
   *
   * The CognitoGuestIdentityService.verifyGuestIdentityId method directly checks the status
   * of the identity with AWS Cognito. However, once a guest user logs in or converts
   * their account to a permanent one, their original guest identity might be disabled
   * or merged, making it unverifiable through that Cognito API call.
   *
   * By instead querying our Forms table for an existing form associated with the
   * guestIdentityId, we confirm that:
   * 1. The guestIdentityId was valid at some point (as it was used to create a form).
   * 2. There are actual forms to migrate for this guest identity.
   * This makes the migration preparation more robust and independent of the current
   * live status of the guest identity in Cognito, which might have changed post-authentication.
   */
  async prepareMigration(user: AuthUser, guestIdentityId: string) {
    const formCount = await this.prismaService.forms.count({
      where: {
        cognitoGuestIdentityId: guestIdentityId,
      },
    })

    if (formCount === 0) {
      return false
    }

    const expiresAt = getMigrationExpirationDate()

    await this.prismaService.formMigration.create({
      data: {
        cognitoAuthSub: user.cognitoJwtPayload.sub,
        cognitoGuestIdentityId: guestIdentityId,
        expiresAt,
      },
    })

    return true
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleExpiredMigrations() {
    this.logger.log('Running cron job to remove expired form migrations...')
    const now = new Date()
    const result = await this.prismaService.formMigration.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    })
    if (result.count > 0) {
      this.logger.log(`Removed ${result.count} expired form migrations.`)
    } else {
      this.logger.log('No expired form migrations found to remove.')
    }
  }
}
