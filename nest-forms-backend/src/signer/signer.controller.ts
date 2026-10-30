import { LogAllowList } from '@bratislava/log-nest'
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { AllowedUserTypes } from '../auth-v2/decorators/allowed-user-types.decorator'
import { ApiCognitoGuestIdentityIdAuth } from '../auth-v2/decorators/api-cognito-guest-identity-id-auth.decorator'
import { GetUser } from '../auth-v2/decorators/get-user.decorator'
import { UserAuthGuard } from '../auth-v2/guards/user-auth.guard'
import { User, UserType } from '../auth-v2/types/user'
import { FormAccessGuard } from '../forms-v2/guards/form-access.guard'
import SignatureVerificationService from './signature-verification.service'
import {
  SignerDataRequestDto,
  SignerDataResponseDto,
  VerifyFormSignatureRequestDto,
  VerifyFormSignatureResponseDto,
} from './signer.dto'
import SignerService from './signer.service'

@ApiTags('Signer')
@ApiBearerAuth()
@Controller('signer')
export default class SignerController {
  private readonly logger: Logger

  constructor(
    private readonly signerService: SignerService,
    private readonly signatureVerificationService: SignatureVerificationService,
  ) {
    this.logger = new Logger('SignerController')
  }

  @ApiOperation({
    summary: 'Verify form signature',
    description:
      'Verifies a signature created for the form with the Slovensko.sk CEP service, so the user can be told right after signing that the signature will be rejected (e.g. signed with a wrong certificate). The signature is verified again when the form is sent.',
  })
  @ApiOkResponse({
    description: 'Verification verdict',
    type: VerifyFormSignatureResponseDto,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @LogAllowList({ accepted: true, verified: true, reason: true })
  @HttpCode(HttpStatus.OK)
  @Post('verify-signature/:formId')
  async verifyFormSignature(
    @Body() data: VerifyFormSignatureRequestDto,
    @Param('formId') formId: string,
  ): Promise<VerifyFormSignatureResponseDto> {
    return this.signatureVerificationService.verifyFormSignature(
      data.signatureBase64,
      { formId },
    )
  }

  @ApiOperation({
    summary: 'Get signer data',
    description:
      'Generates signer data including XML and metadata for form signing',
  })
  @ApiOkResponse({
    description: 'Return signer data',
    type: SignerDataResponseDto,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @Post('get-signer-data/:formId')
  async getSignerData(
    @Body() data: SignerDataRequestDto,
    @Param('formId') formId: string,
    @GetUser() user: User,
  ): Promise<SignerDataResponseDto> {
    // TODO remove try-catch & extra logging once we start logging requests
    try {
      return await this.signerService.getSignerData(formId, data)
    } catch (error) {
      const userId =
        user.type === UserType.Auth
          ? user.cognitoJwtPayload.sub
          : user.cognitoIdentityId
      const hasEmail =
        user.type === UserType.Auth && !!user.cityAccountUser.email
      this.logger.log(
        `Error during getSignerData, userId: ${userId}, hasEmail: ${hasEmail}, formId: ${formId}`,
      )
      throw error
    }
  }
}
