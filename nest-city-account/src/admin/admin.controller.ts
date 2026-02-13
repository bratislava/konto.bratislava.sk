import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger'

import { PhysicalEntityService } from 'src/physical-entity/physical-entity.service'
import { AdminGuard } from '../auth/guards/admin.guard'
import { AdminService } from './admin.service'
import {
  ManuallyVerifyUserRequestDto,
  MarkDeceasedAccountRequestDto,
  RequestBatchNewUserBirthNumbers,
  RequestBatchQueryUsersByBirthNumbersDto,
  RequestBodyValidateEdeskForUserIdsDto,
  RequestQueryUserByBirthNumberDto,
  RequestValidatePhysicalEntityRfoDto,
} from './dtos/requests.admin.dto'
import {
  GetNewVerifiedUsersBirthNumbersResponseDto,
  GetUserDataByBirthNumbersBatchResponseDto,
  OnlySuccessDto,
  ResponseUserByBirthNumberDto,
  ResponseValidatePhysicalEntityRfoDto,
  UserVerifyState,
  ValidateEdeskForUserIdsResponseDto,
} from './dtos/responses.admin.dto'
import {
  DeactivateAccountResponseDto,
  MarkDeceasedAccountResponseDto,
} from '../user/dtos/user-modification-response.dto'
import { VerificationDataForUserResponseDto } from '../user-verification/dtos/verification-response.dto'

@ApiTags('ADMIN')
@Controller('admin')
@ApiSecurity('apiKey')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly physicalEntityService: PhysicalEntityService
  ) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get user data',
    description: 'Get user data by birthnumber',
  })
  @ApiNotFoundResponse({
    description: 'User by birth number not found',
    type: HttpException,
  })
  @UseGuards(AdminGuard)
  @Get('userdata')
  // FIXME: used in Tax Backend
  async getUserDataByBirthNumber(
    @Query() query: RequestQueryUserByBirthNumberDto
  ): Promise<ResponseUserByBirthNumberDto> {
    const result = await this.adminService.getUserDataByBirthNumber(query.birthNumber)
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
  @UseGuards(AdminGuard)
  @Post('userdata-batch')
  // FIXME: used in Tax Backend
  async getUserDataByBirthNumbersBatch(
    @Body() query: RequestBatchQueryUsersByBirthNumbersDto
  ): Promise<GetUserDataByBirthNumbersBatchResponseDto> {
    const result = await this.adminService.getUsersDataByBirthNumbers(query.birthNumbers)
    return { users: result }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Will activate one time sync of all users from cognito to db at 3am ',
    description:
      'This endpoint is intended to be used manually to trigger a sync of all users from cognito and then call getOrCreate for each user.',
  })
  @UseGuards(AdminGuard)
  @Get('activate-sync-cognito-to-db')
  // NOTE: stays in Admin Controller
  async syncCognitoToDb(): Promise<void> {
    await this.adminService.activateSyncCognitoToDb()
  }

  @HttpCode(200)
  @ApiOperation({
    summary: "Get user's verify state",
    description: 'Return the state of user verifying.',
  })
  @ApiOkResponse({
    type: UserVerifyState,
  })
  @UseGuards(AdminGuard)
  @Get('status/user/:email')
  // NOTE: stays in Admin Controller
  async checkUserVerifyState(@Param('email') email: string): Promise<UserVerifyState> {
    const result = await this.adminService.checkUserVerifyState(email.toLowerCase())
    return result
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Deactivate user account',
    description: 'Deactivates user account in cognito and deletes personal info from database.',
  })
  @UseGuards(AdminGuard)
  @Get('deactivate/:externalId')
  // NOTE: stays in Admin Controller
  async deactivateAccount(
    @Param('externalId') externalId: string
  ): Promise<DeactivateAccountResponseDto> {
    const response = await this.adminService.deactivateAccount(externalId)
    return response
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Mark accounts as deceased',
    description:
      'This endpoint is intended to be used manually when a person is reported as deceased. When called, it deactivates the user account in cognito and marks it as deceased.',
  })
  @UseGuards(AdminGuard)
  @Patch('mark-deceased')
  // NOTE: stays in Admin Controller
  async markAccountsAsDeceasedByBirthnumber(
    @Body() data: MarkDeceasedAccountRequestDto
  ): Promise<MarkDeceasedAccountResponseDto> {
    const response = await this.adminService.markAccountsAsDeceased(data.birthNumbers)
    return response
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get verification data for user.',
    description:
      'Returns data used for verification by identity card for given user in the last month. If the email is for a legal person, it returns the data for the given legal person.',
  })
  @ApiResponse({
    status: 200,
    description: 'All data used for verification for this user in the last month.',
    type: VerificationDataForUserResponseDto,
  })
  @UseGuards(AdminGuard)
  @Get('user/id-card-verification-data/:email')
  // NOTE: stays in Admin Controller
  async getVerificationDataForUser(
    @Param('email') email: string
  ): Promise<VerificationDataForUserResponseDto> {
    const result = await this.adminService.getVerificationDataForUser(email)
    return result
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Manually verify user.',
    description:
      'Manually verify user, or legal person (depending on data in cognito), with provided data like birth number etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Success if all was updated accordingly.',
    type: OnlySuccessDto,
  })
  @UseGuards(AdminGuard)
  @Post('user/verify-manually/:email')
  // NOTE: stays in Admin Controller
  async verifyUserManually(
    @Param('email') email: string,
    @Body() data: ManuallyVerifyUserRequestDto
  ): Promise<OnlySuccessDto> {
    const result = await this.adminService.manuallyVerifyUser(email, data)
    return result
  }

  // TODO take 100 physicalEntities without any attempts to validate uri and tyr using cognito data to validate
  @HttpCode(200)
  @ApiOperation({
    summary: 'Validate edesk for physicalEntities',
    description:
      'Take up to 100 physicalEntities linked to users without any attempts to validate uri and try using cognito data to validate',
  })
  @ApiResponse({
    status: 200,
    description: 'Return data from cognito',
    type: ValidateEdeskForUserIdsResponseDto,
  })
  @UseGuards(AdminGuard)
  @Post('validate-edesk-by-cognito-where-first-try')
  // NOTE: stays in Admin Controller
  async validateEdeskForUserIds(@Body() data: RequestBodyValidateEdeskForUserIdsDto) {
    return this.adminService.validateEdeskWithUriFromCognito(data.offset || 0)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Manually update entity data against RFO (and UPVS) if possible',
  })
  @ApiResponse({
    status: 200,
    description: 'Return data from db, RFO and UPVS if available',
    type: ResponseValidatePhysicalEntityRfoDto,
  })
  @UseGuards(AdminGuard)
  @Post('validate-physical-entity-rfo')
  // NOTE: stays in Admin Controller
  async validatePhysicalEntityRfo(@Body() data: RequestValidatePhysicalEntityRfoDto) {
    return this.physicalEntityService.updateFromRFO(data.physicalEntityId)
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
  @UseGuards(AdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('get-verified-users-birth-numbers-batch')
  // FIXME: used in Tax Backend
  async getNewVerifiedUsersBirthNumbers(
    @Body() data: RequestBatchNewUserBirthNumbers
  ): Promise<GetNewVerifiedUsersBirthNumbersResponseDto> {
    const result = await this.adminService.getNewVerifiedUsersBirthNumbers(data.since, data.take)
    return result
  }
}
