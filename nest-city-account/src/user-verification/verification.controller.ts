import { Body, Controller, HttpCode, HttpException, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CognitoGuard } from '../auth/guards/cognito.guard'
import { User } from '../utils/decorators/request.decorator'
import { CognitoGetUserData, CognitoUserAccountTypesEnum } from '../utils/global-dtos/cognito.dto'
import { ResponseInternalServerErrorDto } from '../utils/guards/dtos/error.dto'
import { TurnstileSubservice } from '../utils/subservices/turnstile.subservice'
import {
  RequestBodyVerifyIdentityCardDto,
  RequestBodyVerifyWithEidDto,
  RequestBodyVerifyWithRpoDto,
  ResponseCustomErrorVerificationEidDto,
  ResponseCustomErrorVerificationIdentityCardDto,
  ResponseNotFoundErrorVerificationIdentityCardDto,
  ResponseVerificationDto,
  ResponseVerificationIdentityCardToQueueDto,
} from './dtos/requests.verification.dto'
import { VerificationService } from './verification.service'

@ApiTags('User verifications')
@ApiBearerAuth()
@Controller('user-verification')
export class VerificationController {
  constructor(
    private verificationService: VerificationService,
    private turnstileSubservice: TurnstileSubservice
  ) {}

  @HttpCode(200)
  @ApiOperation({
    summary: 'Get or create user with his data',
    description:
      'This endpoint return all user data in database of city account and his gdpr latest gdpr data. Null in gdpr means is not subscribe neither unsubscribe. If this endpoint will create user, create automatically License subscription.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return subscribed value for logged user',
    type: ResponseVerificationIdentityCardToQueueDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Birth number not found',
    type: ResponseCustomErrorVerificationIdentityCardDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Specific error',
    type: ResponseNotFoundErrorVerificationIdentityCardDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @UseGuards(CognitoGuard)
  @Post('identity-card')
  async verifyBirthNumberAndIdentityCard(
    @User() user: CognitoGetUserData,
    @Body() data: RequestBodyVerifyIdentityCardDto
  ): Promise<ResponseVerificationIdentityCardToQueueDto> {
    await this.turnstileSubservice.validateToken(data.turnstileToken)
    const result = await this.verificationService.sendToQueue(
      user,
      data,
      CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    )
    return result
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Validate user via rpo',
    description: 'This endpoint validates users via the register of legal entities',
  })
  @ApiResponse({
    status: 200,
    description: 'Return validated user data',
    type: ResponseVerificationDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Specific error',
    type: HttpException,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @UseGuards(CognitoGuard)
  @Post('ico-rpo')
  async verifyIcoBirthNumberAndIdentityCard(
    @User() user: CognitoGetUserData,
    @Body() data: RequestBodyVerifyWithRpoDto
  ): Promise<ResponseVerificationDto> {
    await this.turnstileSubservice.validateToken(data.turnstileToken)
    const result = await this.verificationService.sendToQueue(
      user,
      data,
      CognitoUserAccountTypesEnum.LEGAL_ENTITY
    )
    return result
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Validate user via eid',
    description:
      'This endpoint validates users via eid by contacting slovensko.sk and returns user data upon successful validation.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return validated user data',
    type: ResponseVerificationDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Specific error',
    type: ResponseCustomErrorVerificationEidDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseInternalServerErrorDto,
  })
  @UseGuards(CognitoGuard)
  @Post('eid')
  async verifyWithEid(
    @User() user: CognitoGetUserData,
    @Body() data: RequestBodyVerifyWithEidDto
  ): Promise<ResponseVerificationDto> {
    const result = await this.verificationService.verifyUserWithEid(user, data.oboToken)
    return result
  }
}
