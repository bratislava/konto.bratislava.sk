import { Injectable } from '@nestjs/common'
import { CognitoUserAttributesTierEnum } from '@prisma/client'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { ACTIVE_USER_FILTER, PrismaService } from '../prisma/prisma.service'
import { CognitoUserAccountTypesEnum } from '../utils/global-dtos/cognito.dto'

/**
 * Service responsible for orchestrating user tier changes.
 * Handles both Cognito tier updates and corresponding database synchronization.
 */
@Injectable()
export class UserTierService {
  constructor(
    private readonly cognitoSubservice: CognitoSubservice,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Changes user tier in both Cognito and the database.
   * @param userId - Cognito user ID
   * @param newTier - New tier to assign
   * @param accountType - Type of account (physical entity or legal person)
   */
  async changeTier(
    userId: string,
    newTier: CognitoUserAttributesTierEnum,
    accountType: CognitoUserAccountTypesEnum
  ): Promise<void> {
    // Update tier in Cognito
    await this.cognitoSubservice.changeTier(userId, newTier)

    // Update tier in database
    await this.updateDatabaseTier(userId, newTier, accountType)
  }

  private async updateDatabaseTier(
    userId: string,
    newTier: CognitoUserAttributesTierEnum,
    accountType: CognitoUserAccountTypesEnum
  ): Promise<void> {
    if (accountType === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
      const user = await this.prisma.user.findUnique({
        where: {
          externalId: userId,
          ...ACTIVE_USER_FILTER,
        },
      })
      if (!user) {
        return
      }

      await this.prisma.user.update({
        where: {
          externalId: userId,
        },
        data: {
          cognitoTier: newTier,
        },
      })
    } else {
      const legalPerson = await this.prisma.legalPerson.findUnique({
        where: {
          externalId: userId,
        },
      })
      if (!legalPerson) {
        return
      }

      await this.prisma.legalPerson.update({
        where: {
          externalId: userId,
        },
        data: {
          cognitoTier: newTier,
        },
      })
    }
  }
}
