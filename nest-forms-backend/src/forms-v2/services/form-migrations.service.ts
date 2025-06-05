import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { AuthUser } from '../../auth-v2/types/user'
import PrismaService from '../../prisma/prisma.service'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { getUserFormFields } from '../utils/get-user-form-fields'

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

  async claimMigration(user: AuthUser, formId: string) {
    return this.prismaService.$transaction(async (tx) => {
      const now = new Date()
      const migrations = await tx.formMigration.findMany({
        where: {
          cognitoAuthSub: user.cognitoJwtPayload.sub,
          expiresAt: {
            gt: now,
          },
        },
      })

      if (migrations.length === 0) {
        throw new BadRequestException(
          `No migrations found for user ${user.cognitoJwtPayload.sub}`,
        )
      }

      const form = await tx.forms.findUnique({
        where: {
          id: formId,
          cognitoGuestIdentityId: {
            in: migrations.map((migration) => migration.cognitoGuestIdentityId),
          },
        },
      })

      if (!form) {
        throw new NotFoundException(
          `Form with id ${formId} not found for user ${user.cognitoJwtPayload.sub}`,
        )
      }

      await tx.forms.update({
        where: {
          id: formId,
        },
        data: getUserFormFields(user),
      })

      this.logger.log(
        `Successfully migrated forms from guest identity ${form.cognitoGuestIdentityId} to user ${user.cognitoJwtPayload.sub}`,
      )

      return true
    })
  }

  /**
   * Checks if there's a valid (non-expired) migration for the given user and guest identity pair.
   *
   * @param cognitoAuthSub The authenticated user's Cognito sub
   * @param cognitoGuestIdentityId The guest identity ID
   * @returns true if a valid migration exists, false otherwise
   */
  async hasValidMigration(
    cognitoAuthSub: string,
    cognitoGuestIdentityId: string,
  ): Promise<boolean> {
    const now = new Date()

    const migrationsCount = await this.prismaService.formMigration.count({
      where: {
        cognitoAuthSub,
        cognitoGuestIdentityId,
        expiresAt: {
          gt: now,
        },
      },
    })

    return migrationsCount > 0
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
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
