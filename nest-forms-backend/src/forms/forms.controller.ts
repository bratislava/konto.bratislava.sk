import { Controller, Param, Post, UseGuards } from '@nestjs/common'
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
import { BumpJsonVersionResponseDto } from './dtos/forms.responses.dto'
import FormsService from './forms.service'

@ApiTags('forms')
@ApiBearerAuth()
@Controller('forms')
export default class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @ApiOperation({
    summary: 'Bump form JSON version to latest available version',
    description: 'Updates form JSON version if a newer version is available',
  })
  @ApiOkResponse({
    description: 'Version successfully bumped',
    type: BumpJsonVersionResponseDto,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard)
  @Post(':id/bump-version')
  async bumpJsonVersion(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<BumpJsonVersionResponseDto> {
    const form = await this.formsService.getFormWithAccessCheck(id, user)
    await this.formsService.bumpJsonVersion(form)

    return {
      formId: id,
      success: true,
    }
  }
}
