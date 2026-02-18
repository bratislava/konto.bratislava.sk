import { Injectable } from '@nestjs/common'
import { PhysicalEntityService } from 'src/physical-entity/physical-entity.service'
import { PrismaService } from '../prisma/prisma.service'
import { UserErrorsEnum, UserErrorsResponseEnum } from '../user/user.error.enum'
import { CognitoUserAttributesEnum } from '../utils/global-dtos/cognito.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { ManuallyVerifyUserRequestDto } from './dtos/requests.admin.dto'
import { OnlySuccessDto, UserVerifyState } from './dtos/responses.admin.dto'
import { UserService } from '../user/user.service'
import { COGNITO_SYNC_CONFIG_DB_KEY } from './utils/constants'
import { toLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { VerificationService } from '../user-verification/verification.service'
import {
  DeactivateAccountResponseDto,
  MarkDeceasedAccountResponseDto,
} from '../user/dtos/user-modification-response.dto'
import { VerificationDataForUserResponseDto } from '../user-verification/dtos/verification-response.dto'

/**
 * AdminService - Thin delegation layer for administrative operations
 *
 * @description
 * This service acts as a facade between AdminController and domain services. It provides
 * a consistent interface for administrative endpoints while keeping business logic in domain modules.
 *
 * @remarks
 * **Before adding code here, please note:**
 *
 * Business logic does NOT belong in this service. Implement functionality in the appropriate
 * domain service (UserService, VerificationService, PhysicalEntityService, etc.) and delegate
 * from here.
 *
 * Methods in this service should either:
 * 1. Simply delegate to a domain service (most common)
 * 2. Implement purely administrative functionality that doesn't belong to any domain (rare exception)
 *
 * If your functionality relates to a specific domain (users, verification, entities, etc.),
 * it belongs in that domain's service, not here.
 */
@Injectable()
export class AdminService {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(AdminService.name)

  constructor(
    private cognitoSubservice: CognitoSubservice,
    private throwerErrorGuard: ThrowerErrorGuard,
    private prismaService: PrismaService,
    private physicalEntityService: PhysicalEntityService,
    private readonly userService: UserService,
    private readonly verificationService: VerificationService
  ) {}

  /**
   * Activates Cron job for sync of cognito users to db.
   * @returns void
   */
  async activateSyncCognitoToDb(): Promise<void> {
    await this.prismaService.config.update({
      where: { key: COGNITO_SYNC_CONFIG_DB_KEY },
      data: { value: { active: true } },
    })
  }

  /**
   * Gets all users from cognito and calls getOrCreate for each user.
   *
   * TODO this is only used in admin cron subservice. Refactor to cognito service and call from tasks module.
   *
   * @returns void
   */
  async syncCognitoToDb(): Promise<void> {
    const cognitoUsers = await this.cognitoSubservice.getAllCognitoUsers()
    if (!cognitoUsers) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        UserErrorsEnum.COGNITO_TYPE_ERROR,
        UserErrorsResponseEnum.COGNITO_TYPE_ERROR
      )
    }

    for (const user of cognitoUsers) {
      const accountType = user[CognitoUserAttributesEnum.ACCOUNT_TYPE]
      if (!accountType || !user.sub || !user.email) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          UserErrorsEnum.COGNITO_TYPE_ERROR,
          UserErrorsResponseEnum.COGNITO_TYPE_ERROR,
          toLogfmt(user)
        )
      }
      try {
        await this.userService.getOrCreateUserOrLegalPersonRaw(user)
      } catch (error) {
        this.logger.error(error)
      }
    }
  }

  async checkUserVerifyState(email: string): Promise<UserVerifyState> {
    return await this.verificationService.checkUserVerifyState(email)
  }

  async checkLegalPersonVerifyState(email: string): Promise<UserVerifyState> {
    return await this.verificationService.checkLegalPersonVerifyState(email)
  }

  async deactivateAccount(externalId: string): Promise<DeactivateAccountResponseDto> {
    return await this.userService.deactivateAccount(externalId)
  }

  async markAccountsAsDeceased(birthNumberList: string[]): Promise<MarkDeceasedAccountResponseDto> {
    return await this.userService.markAccountsAsDeceased(birthNumberList)
  }

  async getVerificationDataForUser(email: string): Promise<VerificationDataForUserResponseDto> {
    return await this.verificationService.getVerificationDataForUser(email)
  }

  async manuallyVerifyUser(
    email: string,
    data: ManuallyVerifyUserRequestDto
  ): Promise<OnlySuccessDto> {
    return await this.verificationService.manuallyVerifyUser(email, data)
  }

  async validateEdeskWithUriFromCognito(offset: number) {
    return await this.physicalEntityService.validateEdeskWithUriFromCognito(offset)
  }
}
