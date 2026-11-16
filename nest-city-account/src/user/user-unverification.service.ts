import { LineLoggerService } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'

import { BloomreachUnVerificationReasonEnum } from '../bloomreach/bloomreach.types'
import { BloomreachOutboxService } from '../bloomreach/bloomreach-outbox.service'
import {
  CognitoUserAttributesTierEnum,
  DeliveryMethodEnum,
  DeliveryMethodUserPreferenceEnum,
} from '../generated/prisma/enums'
import { NorisDeliveryMethodService } from '../noris/services/noris-delivery-method.service'
import { PrismaService } from '../prisma/prisma.service'
import {
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import {
  UNVERIFY_USERS_WITH_FAILING_EDESK_UPDATE_DEFAULT_LIMIT,
  UNVERIFY_USERS_WITH_FAILING_EDESK_UPDATE_DEFAULT_MIN_FAIL_COUNT,
  UnverifyFailedUserDto,
  UnverifySkippedUserDto,
  UnverifySkipReasonEnum,
  UnverifyUsersWithFailingEdeskUpdateRequestDto,
  UnverifyUsersWithFailingEdeskUpdateResponseDto,
} from './dtos/unverify-users-with-failing-edesk-update.dto'
import { UserTierService } from './user-tier.service'

export interface UnverifyCandidate {
  id: string
  externalId: string
  birthNumber: string
  taxDeliveryMethod: DeliveryMethodUserPreferenceEnum | null
  taxDeliveryMethodAtLockDate: DeliveryMethodEnum | null
  physicalEntityId: string
  hasUri: boolean
}

/**
 * Revokes the verification of users verified by RFO whose eDesk update keeps failing, so we don't
 * know their eDesk status (bratislava/private-konto.bratislava.sk#1806).
 */
@Injectable()
export class UserUnverificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cognitoSubservice: CognitoSubservice,
    private readonly userTierService: UserTierService,
    private readonly norisDeliveryMethodService: NorisDeliveryMethodService,
    private readonly bloomreachOutboxService: BloomreachOutboxService,
    private readonly logger: LineLoggerService
  ) {}

  async unverifyUsersWithFailingEdeskUpdate({
    dryRun = true,
    limit = UNVERIFY_USERS_WITH_FAILING_EDESK_UPDATE_DEFAULT_LIMIT,
    afterUserId,
    minFailCount = UNVERIFY_USERS_WITH_FAILING_EDESK_UPDATE_DEFAULT_MIN_FAIL_COUNT,
  }: UnverifyUsersWithFailingEdeskUpdateRequestDto): Promise<UnverifyUsersWithFailingEdeskUpdateResponseDto> {
    const candidates = await this.selectCandidates({
      limit,
      afterUserId,
      minFailCount,
    })

    const toUnverify: UnverifyCandidate[] = []
    const skipped: UnverifySkippedUserDto[] = []
    const failed: UnverifyFailedUserDto[] = []

    // Sequentially, to keep the load on Cognito and Noris low.
    for (const candidate of candidates) {
      const { externalId } = candidate
      try {
        // eslint-disable-next-line no-await-in-loop -- intentionally sequential
        const skipReason = await this.getSkipReason(externalId)
        if (skipReason) {
          skipped.push({ externalId, reason: skipReason })
          continue
        }

        if (!dryRun) {
          // eslint-disable-next-line no-await-in-loop -- intentionally sequential
          await this.unverifyUser(candidate)
        }
        toUnverify.push(candidate)
      } catch (error) {
        this.logger.error(
          'Failed to un-verify user with failing eDesk update',
          { externalId },
          error
        )
        failed.push({
          externalId,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    this.logger.log('Un-verification of users with failing eDesk update finished', {
      dryRun,
      candidates: candidates.length,
      unverified: toUnverify.length,
      skipped: skipped.length,
      failed: failed.length,
    })

    return {
      dryRun,
      unverified: toUnverify.map((candidate) => candidate.externalId),
      stats: {
        withUri: toUnverify.filter((candidate) => candidate.hasUri).length,
        withoutUri: toUnverify.filter((candidate) => !candidate.hasUri).length,
        cityAccountPreference: toUnverify.filter(
          (candidate) =>
            candidate.taxDeliveryMethod === DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT
        ).length,
        cityAccountLocked: toUnverify.filter(
          (candidate) => candidate.taxDeliveryMethodAtLockDate === DeliveryMethodEnum.CITY_ACCOUNT
        ).length,
      },
      skipped,
      failed,
      nextAfterUserId: candidates.length === limit ? candidates.at(-1)?.id : undefined,
    }
  }

  /**
   * Users who still have a birth number and whose linked PhysicalEntity failed the eDesk update at
   * least `minFailCount` times in a row, with or without a URI. Only linked entities are checked,
   * the eDesk update only runs for those.
   */
  private async selectCandidates({
    limit,
    afterUserId,
    minFailCount,
  }: {
    limit: number
    afterUserId: string | undefined
    minFailCount: number
  }): Promise<UnverifyCandidate[]> {
    //language=postgresql
    return this.prisma.$queryRaw<UnverifyCandidate[]>`SELECT u."id",
         u."externalId",
         u."birthNumber",
         u."taxDeliveryMethod",
         u."taxDeliveryMethodAtLockDate",
         pe."id"               AS "physicalEntityId",
         (pe."uri" IS NOT NULL) AS "hasUri"
     FROM
         "User" u
         JOIN "PhysicalEntity" pe ON pe."userId" = u."id"
     WHERE
         u."birthNumber" IS NOT NULL
         AND u."isDeceased" = FALSE
         AND pe."activeEdeskUpdateFailCount" >= ${minFailCount}
         AND (${afterUserId ?? null}::uuid IS NULL OR u."id" > ${afterUserId ?? null}::uuid)
     ORDER BY
         u."id"
     LIMIT ${limit}
    `
  }

  /**
   * Cognito is the source of truth for the tier, `User.cognitoTier` can be stale. Only users
   * verified by ID card (RFO) are un-verified, eID users are skipped.
   */
  private async getSkipReason(externalId: string): Promise<UnverifySkipReasonEnum | null> {
    const cognitoUser = await this.cognitoSubservice.getDataFromCognito(externalId)

    if (
      cognitoUser[CognitoUserAttributesEnum.ACCOUNT_TYPE] !==
      CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    ) {
      return UnverifySkipReasonEnum.NOT_PHYSICAL_ENTITY
    }
    if (
      cognitoUser[CognitoUserAttributesEnum.TIER] !== CognitoUserAttributesTierEnum.IDENTITY_CARD
    ) {
      return UnverifySkipReasonEnum.COGNITO_TIER_NOT_IDENTITY_CARD
    }
    return null
  }

  private async unverifyUser({
    id,
    externalId,
    birthNumber,
    physicalEntityId,
  }: UnverifyCandidate): Promise<void> {
    // Holds the same per-birth-number lock as the Noris delivery method sync, so the sync can't
    // write the delivery method back after we remove it. The sync skips users without a birth
    // number, so once this commits, it leaves the user alone.
    await this.prisma.$transaction(async (tx) => {
      await NorisDeliveryMethodService.acquireDeliveryMethodLock(tx, birthNumber)
      await this.norisDeliveryMethodService.removeDeliveryMethodsFromNoris(birthNumber)

      await tx.user.update({
        where: { id },
        data: {
          birthNumber: null,
          ifo: null,
          taxDeliveryMethod: null,
          // Must be cleared together, a DB CHECK requires the lock date for a CITY_ACCOUNT lock.
          taxDeliveryMethodAtLockDate: null,
          taxDeliveryMethodCityAccountLockDate: null,
          lastTaxDeliveryMethodsUpdateYear: null,
          userIdCardVerify: { deleteMany: {} },
        },
      })

      // The PhysicalEntity row is kept, but unlinked and reset. Re-verification relinks it by birth
      // number, and the reset makes it look up the URI and eDesk status from scratch.
      await tx.physicalEntity.update({
        where: { id: physicalEntityId },
        data: {
          userId: null,
          uri: null,
          uriPossiblyOutdated: false,
          activeEdesk: null,
          activeEdeskUpdatedAt: null,
          activeEdeskUpdateFailedAt: null,
          activeEdeskUpdateFailCount: 0,
        },
      })
      // Otherwise the URI lookup skips the entity after re-verification.
      await tx.identityLookupRejection.deleteMany({ where: { physicalEntityId } })
    })

    await this.userTierService.changeTier(
      externalId,
      CognitoUserAttributesTierEnum.NEW,
      CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    )

    await this.bloomreachOutboxService.trackCustomer(externalId)
    await this.bloomreachOutboxService.trackUnVerification(
      externalId,
      BloomreachUnVerificationReasonEnum.IAM_NOT_FOUND
    )

    this.logger.log('Un-verified user with failing eDesk update', { externalId, userId: id })
  }
}
