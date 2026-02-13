import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import {
  GetNewVerifiedUsersBirthNumbersResponseDto,
  ResponseUserByBirthNumberDto,
} from './dtos/integration-response.dto'

/**
 * IntegrationService - Thin delegation layer for backend-to-backend integration APIs
 *
 * This service exposes stable integration endpoints by delegating to domain services.
 * It exists to provide a clean separation between integration APIs and internal domain logic.
 */
@Injectable()
export class IntegrationService {
  constructor(private readonly userService: UserService) {}

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

  async getNewVerifiedUsersBirthNumbers(
    since: Date,
    take?: number
  ): Promise<GetNewVerifiedUsersBirthNumbersResponseDto> {
    return await this.userService.getNewVerifiedUsersBirthNumbers(since, take)
  }
}
