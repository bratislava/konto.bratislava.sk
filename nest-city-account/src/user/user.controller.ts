import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger'

import { CognitoGuard } from '../auth/guards/cognito.guard'
import { User } from '../utils/decorators/request.decorator'
import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { ResponseInternalServerErrorDto } from '../utils/guards/dtos/error.dto'
import { UserErrorsResponseEnum, UserErrorsEnum } from './user.error.enum'
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
import { UserService } from './user.service'
import { BloomreachService } from '../bloomreach/bloomreach.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { GDPRSubTypeEnum } from '@prisma/client'

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
    private readonly bloomreachService: BloomreachService,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get or create user with his data',
    description:
      'This endpoint return all user data in database of city account and his gdpr latest gdpr data. Null in gdpr means is not subscribe neither unsubscribe. If this endpoint will create user, create automatically Bloomreach Customer.',
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
    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    ) {
      const result = await this.userService.getOrCreateUserData(user)
      return result
    }

    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
        CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      const result = await this.userService.getOrCreateLegalPersonData(user)
      return result
    }

    throw this.throwerErrorGuard.UnprocessableEntityException(
      UserErrorsEnum.COGNITO_TYPE_ERROR,
      UserErrorsResponseEnum.COGNITO_TYPE_ERROR
    )
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
    type: ResponseUserDataDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @UseGuards(CognitoGuard)
  @Post('update-or-create-bloomreach-customer')
  async updateOrCreateBloomreachCustomer(
    @User() user: CognitoGetUserData
  ): Promise<boolean | undefined> {
    //there is no way to track user attributes change in cognito, so for now, this solution is needed https://github.com/aws-amplify/amplify-js/issues/9391
    const result = await this.bloomreachService.trackCustomer(user.idUser)
    if (result) {
      return result
    }

    throw this.throwerErrorGuard.UnprocessableEntityException(
      UserErrorsEnum.COGNITO_TYPE_ERROR,
      UserErrorsResponseEnum.COGNITO_TYPE_ERROR
    )
  }

  @UseGuards(CognitoGuard)
  @Post('remove-birthnumber')
  async removeBirthNumber(@User() user: CognitoGetUserData): Promise<ResponseUserDataDto> {
    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    ) {
      const result = await this.userService.removeBirthNumber(user.idUser)
      return result
    }

    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
        CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      const result = await this.userService.removeLegalPersonBirthNumber(user.idUser)
      return result
    }

    throw this.throwerErrorGuard.UnprocessableEntityException(
      UserErrorsEnum.COGNITO_TYPE_ERROR,
      UserErrorsResponseEnum.COGNITO_TYPE_ERROR
    )
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
    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    ) {
      const result: ResponseUserDataDto = await this.userService.subUnsubUser(
        user,
        GDPRSubTypeEnum.subscribe,
        data.gdprData
      )
      return result
    }

    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
        CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      const result: ResponseLegalPersonDataDto = await this.userService.subUnsubLegalPerson(
        user,
        GDPRSubTypeEnum.subscribe,
        data.gdprData
      )
      return result
    }

    throw this.throwerErrorGuard.UnprocessableEntityException(
      UserErrorsEnum.COGNITO_TYPE_ERROR,
      UserErrorsResponseEnum.COGNITO_TYPE_ERROR
    )
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
    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    ) {
      const result: ResponseUserDataDto = await this.userService.subUnsubUser(
        user,
        GDPRSubTypeEnum.unsubscribe,
        data.gdprData
      )
      return result
    }

    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
        CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      const result: ResponseLegalPersonDataDto = await this.userService.subUnsubLegalPerson(
        user,
        GDPRSubTypeEnum.unsubscribe,
        data.gdprData
      )
      return result
    }

    throw this.throwerErrorGuard.UnprocessableEntityException(
      UserErrorsEnum.COGNITO_TYPE_ERROR,
      UserErrorsResponseEnum.COGNITO_TYPE_ERROR
    )
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Unsubscribe user by uuid',
    description: 'unsubscribe any user by uuid with different categories of subscription',
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
      'unsubscribe any user by external Id from cognito with different categories of subscription',
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
    let result: ResponseUserDataBasicDto | ResponseLegalPersonDataSimpleDto | null = null
    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    ) {
      result = await this.userService.changeUserEmail(user.sub, body.newEmail)
    }

    if (
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      user[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
        CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      result = await this.userService.changeLegalPersonEmail(user.sub, body.newEmail)
    }
    if (result) {
      await this.bloomreachService.trackCustomer(user.idUser)
      return result
    }

    throw this.throwerErrorGuard.UnprocessableEntityException(
      UserErrorsEnum.COGNITO_TYPE_ERROR,
      UserErrorsResponseEnum.COGNITO_TYPE_ERROR
    )
  }
}
