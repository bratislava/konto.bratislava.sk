import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'
import { IntegrationService } from './integration.service'
import {
  LegalPersonContactAndIdInfoResponseDto,
  UserContactAndIdInfoResponseDto,
} from '../user/dtos/user-contact-info.dto'
import { AdminGuard } from '../auth/guards/admin.guard'
import {
  RequestBatchNewUserBirthNumbers,
  RequestBatchQueryUsersByBirthNumbersDto,
  RequestQueryUserByBirthNumberDto,
} from './dtos/integration-request.dto'
import {
  GetNewVerifiedUsersBirthNumbersResponseDto,
  GetUserDataByBirthNumbersBatchResponseDto,
  ResponseUserByBirthNumberDto,
} from './dtos/integration-response.dto'

/**
 * IntegrationController - Backend-to-Backend Integration APIs
 *
 * This controller exposes stable API endpoints for programmatic access by other backend services.
 * These endpoints are versioned and maintained for stability.
 *
 * Route prefix: /integration
 */
@ApiTags('Backend Integration API')
@ApiSecurity('apiKey')
@ApiExtraModels(UserContactAndIdInfoResponseDto, LegalPersonContactAndIdInfoResponseDto)
@UseGuards(AdminGuard)
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get user data',
    description: 'Get user data by birthnumber',
  })
  @ApiNotFoundResponse({
    description: 'User by birth number not found',
    type: HttpException,
  })
  @Get('userdata')
  async getUserDataByBirthNumber(
    @Query() query: RequestQueryUserByBirthNumberDto
  ): Promise<ResponseUserByBirthNumberDto> {
    const result = await this.integrationService.getUserDataByBirthNumber(query.birthNumber)
    return result
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get user data',
    description: 'Get user data by birthnumbers in batch.',
  })
  @ApiResponse({
    status: 200,
    description: 'Success.',
    type: GetUserDataByBirthNumbersBatchResponseDto,
  })
  @Post('userdata-batch')
  async getUserDataByBirthNumbersBatch(
    @Body() query: RequestBatchQueryUsersByBirthNumbersDto
  ): Promise<GetUserDataByBirthNumbersBatchResponseDto> {
    const result = await this.integrationService.getUsersDataByBirthNumbers(query.birthNumbers)
    return { users: result }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get birth numbers of newly verified users.',
    description:
      'Retrieves birth numbers for up to `take` newly verified users since the specified date. Returns paginated results with a `nextSince` timestamp for subsequent requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of birth numbers for new verified users.',
    type: GetNewVerifiedUsersBirthNumbersResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('get-verified-users-birth-numbers-batch')
  async getNewVerifiedUsersBirthNumbers(
    @Body() data: RequestBatchNewUserBirthNumbers
  ): Promise<GetNewVerifiedUsersBirthNumbersResponseDto> {
    const result = await this.integrationService.getNewVerifiedUsersBirthNumbers(
      data.since,
      data.take
    )
    return result
  }
}
