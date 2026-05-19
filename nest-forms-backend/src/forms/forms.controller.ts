import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Forms } from '@prisma/client'

import { AllowedUserTypes } from '../auth-v2/decorators/allowed-user-types.decorator'
import { ApiCognitoGuestIdentityIdAuth } from '../auth-v2/decorators/api-cognito-guest-identity-id-auth.decorator'
import { GetUser } from '../auth-v2/decorators/get-user.decorator'
import { UserAuthGuard } from '../auth-v2/guards/user-auth.guard'
import { AuthUser, User, UserType } from '../auth-v2/types/user'
import {
  FormAccessAllowMigrations,
  FormAccessGuard,
  GetFormAccessType,
} from '../forms-v2/guards/form-access.guard'
import { FormAccessType } from '../forms-v2/services/form-access.service'
import { GetFormsRequestDto, UpdateFormRequestDto } from './dtos/requests.dto'
import FormDeleteResponseDto, {
  BumpJsonVersionResponseDto,
  GetFormResponseDto,
  GetFormsResponseDto,
} from './dtos/responses.dto'
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
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @Post(':formId/bump-version')
  async bumpJsonVersion(
    @Param('formId') formId: string,
  ): Promise<BumpJsonVersionResponseDto> {
    await this.formsService.bumpJsonVersion(formId)

    return {
      formId,
      success: true,
    }
  }

  @ApiOperation({
    summary: 'Get paginated forms',
    description: 'Get paginated forms',
  })
  @ApiOkResponse({
    description: 'Return forms',
    type: GetFormsResponseDto,
  })
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth])
  @UseGuards(UserAuthGuard)
  @Get('forms')
  async getForms(
    @Query() query: GetFormsRequestDto,
    @GetUser() user: AuthUser,
  ): Promise<GetFormsResponseDto> {
    return this.formsService.getForms(query, user)
  }

  @ApiOperation({
    summary: 'Get form by ID',
    description: 'Return form by ID for the logged user',
  })
  @ApiOkResponse({
    description: 'Return form',
    type: GetFormResponseDto,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @FormAccessAllowMigrations()
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @Get(':formId')
  async getForm(
    @Param('formId') formId: string,
    @GetUser() _user: User,
    @GetFormAccessType() accessType: FormAccessType,
  ): Promise<GetFormResponseDto> {
    const data = await this.formsService.getFormWithSubject(formId)
    return {
      ...data,
      requiresMigration: accessType === FormAccessType.Migration,
    }
  }

  @ApiOperation({
    summary: 'Archive form',
    description: 'Archive form (hide from user but keep in database)',
  })
  @ApiOkResponse({
    description: 'Form successfully deleted',
    type: FormDeleteResponseDto,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @Delete(':formId')
  async deleteForm(
    @Param('formId') formId: string,
  ): Promise<FormDeleteResponseDto> {
    await this.formsService.archiveForm(formId)
    return {
      archived: true,
      formId,
    }
  }

  @ApiOperation({
    summary: 'Update form',
    description: 'Update form data and metadata',
  })
  @ApiOkResponse({
    description: 'Return updated form',
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard, FormAccessGuard)
  @Post(':formId/update')
  async updateForm(
    @Body() data: UpdateFormRequestDto,
    @Param('formId') formId: string,
    @GetUser() user: User,
  ): Promise<Forms> {
    return this.formsService.updateFormWithUser(formId, data, user)
  }
}
