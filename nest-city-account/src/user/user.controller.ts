import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'
import { GDPRSubTypeEnum } from '@prisma/client'

import { CognitoGuard } from '../auth/guards/cognito.guard'
import { BloomreachOutboxService } from '../bloomreach/bloomreach-outbox.service'
import { User } from '../utils/decorators/request.decorator'
import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { ResponseInternalServerErrorDto } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import {
  ResponseLegalPersonDataDto,
  ResponseLegalPersonDataSimpleDto,
} from './dtos/gdpr.legalperson.dto'
import {
  ChangeEmailRequestDto,
  GdprDataDto,
  RequestGdprDataDto,
  ResponseUserDataBasicDto,
  ResponseUserDataDto,
} from './dtos/gdpr.user.dto'
import { UpsertUserRecordClientRequestDto } from './dtos/user.requests.dto'
import { UserErrorsEnum, UserErrorsResponseEnum } from './user.error.enum'
import { UserService } from './user.service'

@ApiExtraModels(
  ResponseUserDataDto,
  ResponseLegalPersonDataDto,
  ResponseUserDataBasicDto,
  ResponseLegalPersonDataSimpleDto
)
@ApiTags('Users manipulation')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly bloomreachOutboxService: BloomreachOutboxService,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {}

  @HttpCode(200)
  @ApiOperation({
    summary:
      'Get or create user with their data (use when already logged in, not duing login/registration)',
    description:
      'This endpoint returns all user data in database of city account and his gdpr latest gdpr data. Null in gdpr means is not subscribe neither unsubscribe. If this endpoint will create user, create automatically Bloomreach Customer. ' +
      'Use this endpoint AFTER login/registration, not during the login/registration flow. ' +
      'For login/registration flows, use `/upsert-user-record-client` instead to track which client the user logged in through. ' +
      'This endpoint is intended for subsequent user data fetches after the user is already authenticated (e.g., forms backend, next.js app fetching user data).',
  })
  @ApiResponse({
    status: 200,
    description: 'Return subscribed value for logged user',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(ResponseUserDataDto) },
        { $ref: getSchemaPath(ResponseLegalPersonDataDto) },
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @UseGuards(CognitoGuard)
  @Post('get-or-create')
  async getOrCreateUser(
    @User() user: CognitoGetUserData
  ): Promise<ResponseUserDataDto | ResponseLegalPersonDataDto> {
    return this.userService.getOrCreateUserOrLegalPerson(user)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Upsert user and record login client (use during login/registration)',
    description:
      'Gets or creates the user/legal person and records a login client for the currently authenticated user. This tracks which client the user logged in through and increments the login count. ' +
      'Use this endpoint DURING login/registration flows to track login client usage. ' +
      'For subsequent user data fetches after login (e.g., forms backend, next.js app), use `/get-or-create` instead. ' +
      'This endpoint should be called once per login/registration to properly track which client was used.',
  })
  @ApiResponse({
    status: 200,
    description: 'User/legal person data with login client recorded successfully',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(ResponseUserDataDto) },
        { $ref: getSchemaPath(ResponseLegalPersonDataDto) },
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @UseGuards(CognitoGuard)
  @Post('upsert-user-record-client')
  async upsertUserAndRecordClient(
    @User() user: CognitoGetUserData,
    @Body() body: UpsertUserRecordClientRequestDto
  ): Promise<ResponseUserDataDto | ResponseLegalPersonDataDto> {
    const userData = await this.userService.getOrCreateUserOrLegalPerson(user)
    await this.userService.recordLoginClient(user, body.loginClient)
    return userData
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Update or create bloomreach customer for logged user',
    description:
      'This controller will call bloomreach endpoint with bloomreach credentials from env variables. This endpoint is used to update or create bloomreach customer for logged user. It is used to track user attributes change in cognito.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return subscribed value for logged user',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @UseGuards(CognitoGuard)
  @Post('update-or-create-bloomreach-customer')
  async updateOrCreateBloomreachCustomer(@User() user: CognitoGetUserData): Promise<void> {
    //there is no way to track user attributes change in cognito, so for now, this solution is needed https://github.com/aws-amplify/amplify-js/issues/9391
    await this.bloomreachOutboxService.trackCustomer(user.idUser)
  }

  @UseGuards(CognitoGuard)
  @ApiOkResponse({
    type: ResponseUserDataDto,
  })
  @Post('remove-birthnumber')
  async removeBirthNumber(@User() user: CognitoGetUserData): Promise<ResponseUserDataDto> {
    const accountType = user[CognitoUserAttributesEnum.ACCOUNT_TYPE]
    switch (accountType) {
      case CognitoUserAccountTypesEnum.PHYSICAL_ENTITY:
        return this.userService.removeBirthNumber(user.idUser)
      case CognitoUserAccountTypesEnum.LEGAL_ENTITY:
      case CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY:
        return this.userService.removeLegalPersonBirthNumber(user.idUser)
      default:
        throw this.throwerErrorGuard.UnprocessableEntityException(
          UserErrorsEnum.COGNITO_TYPE_ERROR,
          UserErrorsResponseEnum.COGNITO_TYPE_ERROR
        )
    }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Create subscribed or unsubscribed log for logged in users',
    description:
      'This endpoint is used only for logged user, user is paired by JWT token. You can send subscription data from model in array, or you can send empty array in gdprData and it will automatically create subscribed data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return subscribed value for logged user',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(ResponseUserDataDto) },
        { $ref: getSchemaPath(ResponseLegalPersonDataDto) },
      ],
    },
  })
  @UseGuards(CognitoGuard)
  @Post('subscribe')
  async subscribeLoggedUser(
    @User() user: CognitoGetUserData,
    @Body() data: RequestGdprDataDto
  ): Promise<ResponseUserDataDto | ResponseLegalPersonDataDto> {
    const accountType = user[CognitoUserAttributesEnum.ACCOUNT_TYPE]
    switch (accountType) {
      case CognitoUserAccountTypesEnum.PHYSICAL_ENTITY: {
        const result: ResponseUserDataDto = await this.userService.subUnsubUser(
          user,
          GDPRSubTypeEnum.subscribe,
          data.gdprData
        )
        return result
      }
      case CognitoUserAccountTypesEnum.LEGAL_ENTITY:
      case CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY: {
        const result: ResponseLegalPersonDataDto = await this.userService.subUnsubLegalPerson(
          user,
          GDPRSubTypeEnum.subscribe,
          data.gdprData
        )
        return result
      }
      default:
        throw this.throwerErrorGuard.UnprocessableEntityException(
          UserErrorsEnum.COGNITO_TYPE_ERROR,
          UserErrorsResponseEnum.COGNITO_TYPE_ERROR
        )
    }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Unsubscribe logged user',
    description:
      'This endpoint is used only for logged user, user is paired by JWTtoken. You can send unsubscription data from model in array, or you can send empty array in gdprData and it will automatically create unsubscribed data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return unsubscribed and subscribed value for logged user',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(ResponseUserDataDto) },
        { $ref: getSchemaPath(ResponseLegalPersonDataDto) },
      ],
    },
  })
  @UseGuards(CognitoGuard)
  @Post('unsubscribe')
  async unsubscribeLoggedUser(
    @User() user: CognitoGetUserData,
    @Body() data: RequestGdprDataDto
  ): Promise<ResponseUserDataDto | ResponseLegalPersonDataDto> {
    const accountType = user[CognitoUserAttributesEnum.ACCOUNT_TYPE]
    switch (accountType) {
      case CognitoUserAccountTypesEnum.PHYSICAL_ENTITY: {
        const result: ResponseUserDataDto = await this.userService.subUnsubUser(
          user,
          GDPRSubTypeEnum.unsubscribe,
          data.gdprData
        )
        return result
      }
      case CognitoUserAccountTypesEnum.LEGAL_ENTITY:
      case CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY: {
        const result: ResponseLegalPersonDataDto = await this.userService.subUnsubLegalPerson(
          user,
          GDPRSubTypeEnum.unsubscribe,
          data.gdprData
        )
        return result
      }
      default:
        throw this.throwerErrorGuard.UnprocessableEntityException(
          UserErrorsEnum.COGNITO_TYPE_ERROR,
          UserErrorsResponseEnum.COGNITO_TYPE_ERROR
        )
    }
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Unsubscribe user by uuid',
    description: 'Unsubscribe any user by uuid with different categories of subscription',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return unsubscribed and subscribed value for logged user. You can send unsubscription data from model in array in Query, or you can send empty query and it will automatically create subscribed data.',
    type: String,
  })
  @Get('public/unsubscribe/:id')
  async unsubscribePublicUser(
    @Param('id') id: string,
    @Query() data: GdprDataDto
  ): Promise<string> {
    const result = await this.userService.unsubscribePublicUser(id, [data])
    return `Váš email ${result.userData.email} bol odhlásený z odberu noviniek a marketingových upozornení Bratislavského konta`
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Unsubscribe user by external Id',
    description:
      'Unsubscribe any user by external Id from cognito with different categories of subscription',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return unsubscribed and subscribed value for logged user. You can send unsubscription data from model in array in Query, or you can send empty query and it will automatically create subscribed data.',
    type: String,
  })
  @Get('public/unsubscribe/external-id/:id')
  async unsubscribePublicUserByExternalId(
    @Param('id') id: string,
    @Query() data: GdprDataDto
  ): Promise<string> {
    const result = await this.userService.unsubscribePublicUserByExternalId(id, [data])
    return `Váš email ${result.userData.email} bol odhlásený z odberu noviniek a marketingových upozornení Bratislavského konta`
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Change email of cognito user in database',
    description: 'Change email saved in database for a given cognito user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return info of a given user or a legal person.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(ResponseUserDataBasicDto) },
        { $ref: getSchemaPath(ResponseLegalPersonDataSimpleDto) },
      ],
    },
  })
  @UseGuards(CognitoGuard)
  @Post('change-email')
  async changeEmail(
    @User() user: CognitoGetUserData,
    @Body() body: ChangeEmailRequestDto
  ): Promise<ResponseUserDataBasicDto | ResponseLegalPersonDataSimpleDto> {
    const accountType = user[CognitoUserAttributesEnum.ACCOUNT_TYPE]
    let result: ResponseUserDataBasicDto | ResponseLegalPersonDataSimpleDto
    switch (accountType) {
      case CognitoUserAccountTypesEnum.PHYSICAL_ENTITY:
        result = await this.userService.changeUserEmail(user.sub, body.newEmail)
        break
      case CognitoUserAccountTypesEnum.LEGAL_ENTITY:
      case CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY:
        result = await this.userService.changeLegalPersonEmail(user.sub, body.newEmail)
        break
      default:
        throw this.throwerErrorGuard.UnprocessableEntityException(
          UserErrorsEnum.COGNITO_TYPE_ERROR,
          UserErrorsResponseEnum.COGNITO_TYPE_ERROR
        )
    }

    if (result) {
      await this.bloomreachOutboxService.trackCustomer(user.idUser)
      return result
    }

    throw this.throwerErrorGuard.UnprocessableEntityException(
      UserErrorsEnum.COGNITO_TYPE_ERROR,
      UserErrorsResponseEnum.COGNITO_TYPE_ERROR
    )
  }
}
