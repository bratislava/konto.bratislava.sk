import { Injectable } from '@nestjs/common'
import { PhysicalEntityService } from 'src/physical-entity/physical-entity.service'
import { PrismaService } from '../prisma/prisma.service'
import { UserErrorsEnum, UserErrorsResponseEnum } from '../user/user.error.enum'
import { CognitoUserAttributesEnum } from '../utils/global-dtos/cognito.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { ManuallyVerifyUserRequestDto } from './dtos/requests.admin.dto'
import {
  GetNewVerifiedUsersBirthNumbersResponseDto,
  OnlySuccessDto,
  ResponseUserByBirthNumberDto,
  UserVerifyState,
} from './dtos/responses.admin.dto'
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
 * This service delegates to domain services (UserService, VerificationService, PhysicalEntityService).
 * It provides a consistent interface for AdminController while keeping business logic in domain modules.
 *
 * Note: This service has been refactored from a 695-line "God Service" to a thin delegation layer.
 * Functionality has been moved to appropriate domain services:
 * - User lookup/batch/deactivation → UserService ✅
 * - Verification state/data/manual → VerificationService ✅
 * - Edesk validation → PhysicalEntityService (TODO)
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

  // ========== User Lookup (delegates to UserService) ==========
  async getUserDataByBirthNumber(birthNumber: string): Promise<ResponseUserByBirthNumberDto> {
    return await this.userService.getUserDataByBirthNumber(birthNumber)
  }

  /**
   * Similar to function getUserDataByBirthNumber, returns data about users based on their birth number, but instead of separately, it does it in batch in one request.
   * @param birthNumbers Array of birth numbers without slash, for which users should be retrieved from database.
   * @returns A map of birth numbers (those which were found in database) to user information.
   */
  async getUsersDataByBirthNumbers(
    birthNumbers: string[]
  ): Promise<Record<string, ResponseUserByBirthNumberDto>> {
    return await this.userService.getUsersDataByBirthNumbers(birthNumbers)
  }

  // ========== Cognito Sync (Admin-specific functionality) ==========
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

  // ========== Verification State (delegates to VerificationService) ==========
  async checkLegalPersonVerifyState(email: string): Promise<UserVerifyState> {
    return await this.verificationService.checkLegalPersonVerifyState(email)
  }

  // ========== Account Deactivation (delegates to UserService) ==========
  async deactivateAccount(externalId: string): Promise<DeactivateAccountResponseDto> {
    return await this.userService.deactivateAccount(externalId)
  }

  async markAccountsAsDeceased(birthNumberList: string[]): Promise<MarkDeceasedAccountResponseDto> {
    return await this.userService.markAccountsAsDeceased(birthNumberList)
  }

  // ========== Verification Data (delegates to VerificationService) ==========
  async getVerificationDataForUser(email: string): Promise<VerificationDataForUserResponseDto> {
    return await this.verificationService.getVerificationDataForUser(email)
  }

  // ========== Manual Verification (delegates to VerificationService) ==========
  async manuallyVerifyUser(
    email: string,
    data: ManuallyVerifyUserRequestDto
  ): Promise<OnlySuccessDto> {
    return await this.verificationService.manuallyVerifyUser(email, data)
  }

  // ========== Edesk Validation (TODO: move to PhysicalEntityService) ==========
  async validateEdeskWithUriFromCognito(offset: number) {
    return await this.physicalEntityService.validateEdeskWithUriFromCognito(offset)
  }

  // ========== New Verified Users (delegates to UserService) ==========

  async getNewVerifiedUsersBirthNumbers(
    since: Date,
    take?: number
  ): Promise<GetNewVerifiedUsersBirthNumbersResponseDto> {
    return await this.userService.getNewVerifiedUsersBirthNumbers(since, take)
  }
}
