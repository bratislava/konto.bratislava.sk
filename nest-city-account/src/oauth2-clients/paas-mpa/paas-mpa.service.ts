import { ErrorEnum, ErrorFactoryService, LineLoggerSubservice } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'

import { BloomreachContactDatabaseService } from '../../bloomreach/bloomreach-contact-database.service'
import { BloomreachOutboxService } from '../../bloomreach/bloomreach-outbox.service'
import { CognitoUserAttributesTierEnum } from '../../generated/prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { CognitoGetUserData, CognitoUserAttributesEnum } from '../../utils/global-dtos/cognito.dto'
import { UserIdentitySubservice } from '../../utils/subservices/user-identity.subservice'
import { PaasMpaRegisterResponseDto, PaasMpaRegisterStatusEnum } from './dtos/paas-mpa.dto'

@Injectable()
export class PaasMpaService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly bloomreachOutboxService: BloomreachOutboxService,
    private readonly bloomreachContactDatabaseService: BloomreachContactDatabaseService,
    private readonly prisma: PrismaService,
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly userIdentitySubservice: UserIdentitySubservice
  ) {
    this.logger = new LineLoggerSubservice(PaasMpaService.name)
  }

  private isVerifiedTier(tier?: CognitoUserAttributesTierEnum): boolean {
    return (
      tier === CognitoUserAttributesTierEnum.IDENTITY_CARD ||
      tier === CognitoUserAttributesTierEnum.EID
    )
  }

  private async upsertBloomreachContactAndHandleError(
    user: CognitoGetUserData,
    birthNumber: string,
    ico?: string
  ): Promise<string | undefined> {
    try {
      return await this.bloomreachContactDatabaseService.upsert(user.email, birthNumber, ico)
    } catch (error) {
      this.logger.error(
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: `Failed to upsert bloomreach contact`,
          console: {
            userId: user.idUser,
            email: user.email,
            hasBirthNumber: !!birthNumber,
            hasIco: !!ico,
          },
          error,
        })
      )
      return undefined
    }
  }

  private async trackCustomerPhone(cognitoId: string, phoneNumber: string): Promise<void> {
    await this.bloomreachOutboxService.trackCustomer(cognitoId, phoneNumber)
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

    const { birthNumber, ico } = await this.userIdentitySubservice.getVerifiedIdentifiers(
      user.idUser,
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE]
    )

    if (!birthNumber) {
      return {
        status: PaasMpaRegisterStatusEnum.IDENTIFIERS_NOT_FOUND,
        verificationState,
      }
    }

    const bloomreachContactId = await this.upsertBloomreachContactAndHandleError(
      user,
      birthNumber,
      ico
    )

    if (!bloomreachContactId) {
      return {
        status: PaasMpaRegisterStatusEnum.BLOOMREACH_CONTACT_ID_UNAVAILABLE,
        verificationState,
      }
    }

    await this.trackCustomerPhone(user.idUser, phoneNumber)

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
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: `Unexpected error during PAAS-MPA contact registration for user: ${user.idUser}`,
          console: {
            userId: user.idUser,
            email: user.email,
            hasPhoneNumber: !!phoneNumber,
          },
          error,
        })
      )

      return {
        status: PaasMpaRegisterStatusEnum.UNEXPECTED_ERROR,
        verificationState: user[CognitoUserAttributesEnum.TIER],
      }
    }
  }
}
