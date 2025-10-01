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

// eslint-disable-next-line import/no-extraneous-dependencies
import * as _ from 'lodash'
import { PhysicalEntityService } from 'src/physical-entity/physical-entity.service'
import { AdminGuard } from '../auth/guards/admin.guard'
import { ACTIVE_USER_FILTER, PrismaService } from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
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
  DeactivateAccountResponseDto,
  GetNewVerifiedUsersBirthNumbersResponseDto,
  GetUserDataByBirthNumbersBatchResponseDto,
  MarkDeceasedAccountResponseDto,
  OnlySuccessDto,
  ResponseUserByBirthNumberDto,
  ResponseValidatePhysicalEntityRfoDto,
  UserVerifyState,
  ValidatedUsersToPhysicalEntitiesResponseDto,
  ValidateEdeskForUserIdsResponseDto,
  VerificationDataForUserResponseDto,
} from './dtos/responses.admin.dto'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

@ApiTags('ADMIN')
@Controller('admin')
@ApiSecurity('apiKey')
export class AdminController {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(AdminController.name)

  constructor(
    private readonly adminService: AdminService,
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
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
  async verifyUserManually(
    @Param('email') email: string,
    @Body() data: ManuallyVerifyUserRequestDto
  ): Promise<OnlySuccessDto> {
    const result = await this.adminService.manuallyVerifyUser(email, data)
    return result
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Create physicalEntity records for validated users',
    description:
      'Warning - do not run this in parallel, you risk creating duplicates. Processes up to 1000 at once. Where physicalEntity with matching birth number but no linked user is found, it is automatically linked instead of creating a new one',
  })
  @ApiResponse({
    status: 200,
    description: 'Return data from cognito',
    type: ValidatedUsersToPhysicalEntitiesResponseDto,
  })
  @UseGuards(AdminGuard)
  @Post('validated-users-to-physical-entities')
  async validatedUsersToPhysicalEntities() {
    const users = await this.prismaService.user.findMany({
      where: {
        birthNumber: { not: null },
        physicalEntity: null,
        ...ACTIVE_USER_FILTER,
      },
      take: 1000,
    })

    if (users.length === 0) {
      this.logger.log('No users with birth number and no physicalEntity id found')
      return
    } else {
      this.logger.log(`Found ${users.length} users with birth number and no physicalEntity id`)
    }

    // link existing physicalEntities to users where they exist, link by birth number, don't transfer other data
    // ignoring the problems with duplicate birth numbers, we should resolve these manually
    const existingPhysicalEntities = await this.prismaService.physicalEntity.findMany({
      where: {
        birthNumber: {
          in: users
            .map((user) => user.birthNumber)
            .filter((birthNumber) => birthNumber !== null) as string[],
        },
        userId: null,
      },
    })

    const physicalEntitiesByBirthNumber = _.keyBy(existingPhysicalEntities, 'birthNumber')
    const usersByBirthNumber = _.keyBy(users, 'birthNumber')

    if (Object.values(physicalEntitiesByBirthNumber).length !== existingPhysicalEntities.length) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ErrorsEnum.DATABASE_ERROR,
        ErrorsResponseEnum.DATABASE_ERROR,
        'Duplicate birth numbers in existing physicalEntities'
      )
    }
    if (Object.values(usersByBirthNumber).length !== users.length) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        ErrorsEnum.DATABASE_ERROR,
        ErrorsResponseEnum.DATABASE_ERROR,
        'Duplicate birth numbers in existing physicalEntities'
      )
    }

    if (existingPhysicalEntities.length !== 0) {
      this.logger.log(
        `Found ${existingPhysicalEntities.length} existing physicalEntities for unlinked users`
      )
      for (const physicalEntity of existingPhysicalEntities) {
        const user = physicalEntity.birthNumber
          ? usersByBirthNumber[physicalEntity.birthNumber]
          : null
        if (user) {
          this.logger.log(`Linking user ${user.id} to physicalEntity ${physicalEntity.id}`)
          await this.prismaService.physicalEntity.update({
            where: { id: physicalEntity.id },
            data: { userId: user.id },
          })
        }
      }
    }

    // create physicalEntities for the rest of the users
    const usersWithoutPhysicalEntity = users.filter(
      (user) => !user.birthNumber || physicalEntitiesByBirthNumber[user.birthNumber] === undefined
    )
    if (usersWithoutPhysicalEntity.length !== 0) {
      this.logger.log(
        `Creating ${usersWithoutPhysicalEntity.length} new physicalEntities for users`
      )
      for (const user of usersWithoutPhysicalEntity) {
        await this.prismaService.physicalEntity.create({
          data: { userId: user.id, birthNumber: user.birthNumber },
        })
      }
    }

    return {
      existingPhysicalEntitiesUpdated: existingPhysicalEntities.length,
      newPhysicalEntitiesCreated: usersWithoutPhysicalEntity.length,
    }
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
  async getNewVerifiedUsersBirthNumbers(
    @Body() data: RequestBatchNewUserBirthNumbers
  ): Promise<GetNewVerifiedUsersBirthNumbersResponseDto> {
    const result = await this.adminService.getNewVerifiedUsersBirthNumbers(data.since, data.take)
    return result
  }
}
