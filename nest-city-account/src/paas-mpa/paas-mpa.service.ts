import { Injectable } from '@nestjs/common'
import { CognitoUserAttributesTierEnum } from '@prisma/client'
import { BloomreachService } from '../bloomreach/bloomreach.service'
import { BloomreachContactDatabaseService } from '../bloomreach/bloomreach-contact-database.service'
import { ACTIVE_USER_FILTER, PrismaService } from '../prisma/prisma.service'
import { CognitoGetUserData, CognitoUserAccountTypesEnum } from '../utils/global-dtos/cognito.dto'
import { CognitoUserAttributesEnum } from '../utils/global-dtos/cognito.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import { PaasMpaRegisterResponseDto, PaasMpaRegisterStatusEnum } from './dtos/paas-mpa.dto'

@Injectable()
export class PaasMpaService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly bloomreachService: BloomreachService,
    private readonly bloomreachContactDatabaseService: BloomreachContactDatabaseService,
    private readonly prisma: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.logger = new LineLoggerSubservice(PaasMpaService.name)
  }

  private isVerifiedTier(tier?: CognitoUserAttributesTierEnum): boolean {
    return (
      tier === CognitoUserAttributesTierEnum.IDENTITY_CARD ||
      tier === CognitoUserAttributesTierEnum.EID
    )
  }

  // TODO: Refactor - duplicate exists in bloomreach/bloomreach.service.ts
  private async getVerifiedIdentifiers(user: CognitoGetUserData): Promise<{
    birthNumber?: string
    ico?: string
  }> {
    const accountType = user[CognitoUserAttributesEnum.ACCOUNT_TYPE]

    if (accountType === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
      const foundUser = await this.prisma.user.findUnique({
        where: {
          externalId: user.idUser,
          ...ACTIVE_USER_FILTER,
        },
        select: {
          birthNumber: true,
        },
      })

      return { birthNumber: foundUser?.birthNumber ?? undefined }
    }

    if (
      accountType === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      accountType === CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      const legalPerson = await this.prisma.legalPerson.findUnique({
        where: {
          externalId: user.idUser,
        },
        select: {
          birthNumber: true,
          ico: true,
        },
      })

      return {
        birthNumber: legalPerson?.birthNumber ?? undefined,
        ico: legalPerson?.ico ?? undefined,
      }
    }

    return {}
  }

  private async getExistingBloomreachContactIdWithRetry(
    email: string,
    birthNumber: string,
    ico?: string
  ): Promise<string | undefined> {
    for (let tries = 1; tries <= 2; tries++) {
      try {
        return await this.bloomreachContactDatabaseService.upsert(email, birthNumber, ico)
      } catch (error) {
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            `Failed to read bloomreach contact uuid on try: ${tries}`,
            undefined,
            error
          )
        )
      }
    }
    return undefined
  }

  private async trackCustomerPhoneWithRetry(
    cognitoId: string,
    phoneNumber: string
  ): Promise<boolean> {
    for (let tries = 1; tries <= 2; tries++) {
      const trackedInBloomreach = await this.bloomreachService.trackCustomer(cognitoId, phoneNumber)

      if (trackedInBloomreach) {
        return trackedInBloomreach
      }
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Failed to sync phone to bloomreach on try: ${tries}`
        )
      )
    }
    return false
  }

  private async handleRegisterPhoneAndGetContactId(
    user: CognitoGetUserData,
    phoneNumber: string
  ): Promise<PaasMpaRegisterResponseDto> {
    const verificationState = user[CognitoUserAttributesEnum.TIER]

    if (!this.isVerifiedTier(verificationState)) {
      return {
        status: PaasMpaRegisterStatusEnum.NOT_VERIFIED,
        verificationState,
      }
    }

    const { birthNumber, ico } = await this.getVerifiedIdentifiers(user)

    if (!birthNumber) {
      return {
        status: PaasMpaRegisterStatusEnum.IDENTIFIERS_NOT_FOUND,
        verificationState,
      }
    }

    const bloomreachContactId = await this.getExistingBloomreachContactIdWithRetry(
      user.email,
      birthNumber,
      ico
    )

    if (!bloomreachContactId) {
      return {
        status: PaasMpaRegisterStatusEnum.BLOOMREACH_CONTACT_ID_UNAVAILABLE,
        verificationState,
      }
    }

    const trackedInBloomreach = await this.trackCustomerPhoneWithRetry(user.idUser, phoneNumber)

    if (trackedInBloomreach === false) {
      return {
        status: PaasMpaRegisterStatusEnum.BLOOMREACH_SYNC_FAILED,
        verificationState,
        bloomreachContactId,
      }
    }

    return {
      status: PaasMpaRegisterStatusEnum.SUCCESS,
      verificationState,
      bloomreachContactId,
    }
  }

  async registerPhoneAndGetContactId(
    user: CognitoGetUserData,
    phoneNumber: string
  ): Promise<PaasMpaRegisterResponseDto> {
    try {
      return await this.handleRegisterPhoneAndGetContactId(user, phoneNumber)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Unexpected error during PAAS-MPA contact registration for user: ${user.idUser}`,
          undefined,
          error
        )
      )

      return {
        status: PaasMpaRegisterStatusEnum.UNEXPECTED_ERROR,
        verificationState: user[CognitoUserAttributesEnum.TIER],
      }
    }
  }
}
