import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'

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
  ResponseUserDataBasicDto,
  ResponseUserDataDto,
} from './dtos/gdpr.user.dto'
import {
  SetDeliveryMethodPreferenceDto,
  UpdateGdprConsentRequestDto,
  UpsertUserRecordClientRequestDto,
} from './dtos/user.requests.dto'
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
      'Upsert user with their data (use when already logged in, not during login/registration)',
    description:
      'This endpoint returns all user data in database of city account and his gdpr latest gdpr data. Null in gdpr ' +
      'means is not subscribe neither unsubscribe. If this endpoint will create user, create automatically ' +
      'Bloomreach Customer.Use this endpoint AFTER login/registration, not during the login/registration flow. For ' +
      "login/registration flows, use '/upsert-user-record-client' instead to track which client the user logged in " +
      'through. This endpoint is intended for subsequent user data fetches after the user is already authenticated ' +
      '(e.g., forms backend, next.js app fetching user data).',
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
  @Post('upsert')
  async upsertUser(
    @User() user: CognitoGetUserData
  ): Promise<ResponseUserDataDto | ResponseLegalPersonDataDto> {
    return this.userService.upsertUserOrLegalPerson(user)
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Upsert user and record login client (use during login/registration)',
    description:
      'Gets or creates the user/legal person and records a login client for the currently authenticated user. This ' +
      'tracks which client the user logged in through and increments the login count. Use this endpoint DURING ' +
      'login/registration flows to track login client usage. For subsequent user data fetches after login (e.g., ' +
      "forms backend, next.js app), use '/upsert' instead. This endpoint should be called once per " +
      'login/registration to properly track which client was used.',
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
    const userData = await this.userService.upsertUserOrLegalPerson(user)
    await this.userService.recordLoginClient(user, body.loginClient)
    return userData
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Update or create bloomreach customer for logged user',
    description:
      'This controller will call bloomreach endpoint with bloomreach credentials from env variables. This endpoint ' +
      'is used to update or create bloomreach customer for logged user. It is used to track user attributes change ' +
      'in cognito.',
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

  @HttpCode(204)
  @ApiOperation({
    summary: 'Update a single GDPR consent for the logged-in user',
    description: "Accept or revoke a single user-facing consent identified by 'consentType'.",
  })
  @ApiResponse({ status: 204, description: 'Consent updated' })
  @UseGuards(CognitoGuard)
  @Post('gdpr-consent')
  async updateGdprConsent(
    @User() user: CognitoGetUserData,
    @Body() body: UpdateGdprConsentRequestDto
  ): Promise<void> {
    await this.userService.updateGdprConsent(user, body.consentType, body.grant)
  }

  @HttpCode(204)
  @ApiOperation({
    summary: 'Set tax/official delivery method preference for the logged-in user',
    description:
      'Sets the user preference for how official / tax communication should be delivered.',
  })
  @ApiResponse({ status: 204, description: 'Delivery method preference updated' })
  @UseGuards(CognitoGuard)
  @Post('set-delivery-method-preference')
  async setDeliveryMethodPreference(
    @User() user: CognitoGetUserData,
    @Body() body: SetDeliveryMethodPreferenceDto
  ): Promise<void> {
    await this.userService.setDeliveryMethodPreference(user, body.deliveryMethod)
  }
}
