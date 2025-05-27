import { Controller, Param, Post, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import {
  UserInfo,
  UserInfoResponse,
} from '../auth/decorators/user-info.decorator'
import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import CognitoGuard from '../auth/guards/cognito.guard'
import { User } from '../utils/decorators/request.decorator'
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
  @UseGuards(new CognitoGuard(true))
  @Post(':id/bump-version')
  async bumpJsonVersion(
    @Param('id') id: string,
    @User() user: CognitoGetUserData | undefined,
    @UserInfo() userInfo: UserInfoResponse,
  ): Promise<BumpJsonVersionResponseDto> {
    const form = await this.formsService.getFormWithAccessCheck(
      id,
      user?.sub ?? null,
      userInfo?.ico ?? null,
    )
    await this.formsService.bumpJsonVersion(form)

    return {
      formId: id,
      success: true,
    }
  }
}
