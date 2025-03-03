import { Controller, Param, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { getSchemaPath } from '@nestjs/swagger/dist/utils'

import { CognitoGetUserData } from '../auth/dtos/cognito.dto'
import CognitoGuard from '../auth/guards/cognito.guard'
import {
  User,
  UserInfo,
  UserInfoResponse,
} from '../utils/decorators/request.decorator'
import { BumpJsonVersionResponseDto } from './dtos/forms.responses.dto'
import {
  FormDefinitionNotFoundErrorDto,
  FormIsOwnedBySomeoneElseErrorDto,
  FormNotEditableErrorDto,
  FormNotFoundErrorDto,
  FormVersionBumpNotPossible,
} from './forms.errors.dto'
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
  @ApiResponse({
    status: 200,
    description: 'Version successfully bumped',
    type: BumpJsonVersionResponseDto,
  })
  @ApiExtraModels(FormNotFoundErrorDto)
  @ApiExtraModels(FormDefinitionNotFoundErrorDto)
  @ApiExtraModels(FormVersionBumpNotPossible)
  @ApiExtraModels(FormNotEditableErrorDto)
  @ApiNotFoundResponse({
    description: 'Form or form definition not found',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(FormNotFoundErrorDto) },
        { $ref: getSchemaPath(FormDefinitionNotFoundErrorDto) },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Form version cannot be bumped',
    type: FormVersionBumpNotPossible,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Form is not editable',
    type: FormNotEditableErrorDto,
  })
  @ApiForbiddenResponse({
    description: 'Form is owned by someone else',
    type: FormIsOwnedBySomeoneElseErrorDto,
  })
  @UseGuards(new CognitoGuard(true))
  @Post(':id/bump-version')
  async bumpJsonVersion(
    @Param('id') id: string,
    @User() user?: CognitoGetUserData,
    @UserInfo() userInfo?: UserInfoResponse,
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
