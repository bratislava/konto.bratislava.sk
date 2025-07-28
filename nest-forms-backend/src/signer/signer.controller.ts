import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common'
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
import { SignerDataRequestDto, SignerDataResponseDto } from './signer.dto'
import SignerService from './signer.service'

@ApiTags('Signer')
@ApiBearerAuth()
@Controller('signer')
export default class SignerController {
  private readonly logger: Logger

  constructor(private readonly signerService: SignerService) {
    this.logger = new Logger('SignerController')
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
  @UseGuards(UserAuthGuard)
  @Post('get-signer-data')
  async getSignerData(
    @Body() data: SignerDataRequestDto,
    @GetUser() user: User,
  ): Promise<SignerDataResponseDto> {
    // TODO remove try-catch & extra logging once we start logging requests
    try {
      return await this.signerService.getSignerData(data, user)
    } catch (error) {
      const userId =
        user.type === UserType.Auth
          ? user.cognitoJwtPayload.sub
          : user.cognitoIdentityId
      const email =
        user.type === UserType.Auth ? user.cityAccountUser.email : undefined

      this.logger.log(
        `Error during getSignerData, userId: ${userId}, email: ${email}, formId: ${
          data.formId
        }, data: ${JSON.stringify(data.formDataJson)}`,
      )
      throw error
    }
  }
}
