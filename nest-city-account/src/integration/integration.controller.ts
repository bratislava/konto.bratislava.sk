import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger'
import { AdminGuard } from '../auth/guards/admin.guard'
import { IntegrationService } from './integration.service'
import {
  RequestQueryUserByBirthNumberDto,
  RequestBatchQueryUsersByBirthNumbersDto,
  RequestBatchNewUserBirthNumbers,
} from '../admin/dtos/requests.admin.dto'
import {
  ResponseUserByBirthNumberDto,
  GetUserDataByBirthNumbersBatchResponseDto,
  GetNewVerifiedUsersBirthNumbersResponseDto,
} from '../admin/dtos/responses.admin.dto'
import {
  UserContactAndIdInfoResponseDto,
  LegalPersonContactAndIdInfoResponseDto,
} from '../user/dtos/user-contact-info.dto'
import { CognitoUserAccountTypesEnum } from '../utils/global-dtos/cognito.dto'

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
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get user data by birth number',
    description:
      'Stable API endpoint for backend integration. Returns user data for a given birth number.',
  })
  @ApiResponse({
    status: 200,
    description: 'User data retrieved successfully',
    type: ResponseUserByBirthNumberDto,
  })
  @UseGuards(AdminGuard)
  @Get('users/by-birth-number')
  async getUserByBirthNumber(
    @Query() query: RequestQueryUserByBirthNumberDto
  ): Promise<ResponseUserByBirthNumberDto> {
    return this.integrationService.getUserByBirthNumber(query.birthNumber)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get multiple users by birth numbers',
    description:
      'Stable API endpoint for backend integration. Returns user data for multiple birth numbers in batch.',
  })
  @ApiResponse({
    status: 200,
    description: 'User data retrieved successfully',
    type: GetUserDataByBirthNumbersBatchResponseDto,
  })
  @UseGuards(AdminGuard)
  @Post('users/batch-by-birth-numbers')
  async getUsersByBirthNumbers(
    @Body() query: RequestBatchQueryUsersByBirthNumbersDto
  ): Promise<GetUserDataByBirthNumbersBatchResponseDto> {
    const users = await this.integrationService.getUsersByBirthNumbers(query.birthNumbers)
    return { users }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get newly verified users',
    description:
      'Stable API endpoint for backend integration. Returns birth numbers of newly verified users since a given date.',
  })
  @ApiResponse({
    status: 200,
    description: 'Newly verified users retrieved successfully',
    type: GetNewVerifiedUsersBirthNumbersResponseDto,
  })
  @UseGuards(AdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('users/verified-batch')
  async getNewVerifiedUsers(
    @Body() data: RequestBatchNewUserBirthNumbers
  ): Promise<GetNewVerifiedUsersBirthNumbersResponseDto> {
    return this.integrationService.getNewVerifiedUsers(data.since, data.take)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get user contact and ID information',
    description:
      'Stable API endpoint for backend integration. Returns contact and ID info for a user or legal person.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact information retrieved successfully',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(UserContactAndIdInfoResponseDto) },
        { $ref: getSchemaPath(LegalPersonContactAndIdInfoResponseDto) },
      ],
      discriminator: {
        propertyName: 'accountType',
        mapping: {
          [CognitoUserAccountTypesEnum.PHYSICAL_ENTITY]: getSchemaPath(
            UserContactAndIdInfoResponseDto
          ),
          [CognitoUserAccountTypesEnum.LEGAL_ENTITY]: getSchemaPath(
            LegalPersonContactAndIdInfoResponseDto
          ),
          [CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY]: getSchemaPath(
            LegalPersonContactAndIdInfoResponseDto
          ),
        },
      },
    },
  })
  @UseGuards(AdminGuard)
  @Get('users/contact-info/:externalId')
  async getUserContactInfo(
    @Param('externalId') externalId: string
  ): Promise<UserContactAndIdInfoResponseDto | LegalPersonContactAndIdInfoResponseDto> {
    return this.integrationService.getUserContactInfo(externalId)
  }
}
