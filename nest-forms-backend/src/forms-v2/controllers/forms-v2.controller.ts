import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { AllowedUserTypes } from '../../auth-v2/decorators/allowed-user-types.decorator'
import { ApiCognitoGuestIdentityIdAuth } from '../../auth-v2/decorators/api-cognito-guest-identity-id-auth.decorator'
import { GetUser } from '../../auth-v2/decorators/get-user.decorator'
import { UserAuthGuard } from '../../auth-v2/guards/user-auth.guard'
import { User, UserType } from '../../auth-v2/types/user'
import { CreateFormInput } from '../inputs/create-form.input'
import { CreateFormOutput } from '../outputs/create-form.output'
import { CreateFormService } from '../services/create-form.service'

@ApiTags('forms-v2')
@ApiBearerAuth()
@Controller('forms-v2')
export class FormsV2Controller {
  constructor(private readonly createFormService: CreateFormService) {}

  @ApiOperation({})
  @ApiOkResponse({
    type: CreateFormOutput,
  })
  @ApiCognitoGuestIdentityIdAuth()
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth, UserType.Guest])
  @UseGuards(UserAuthGuard)
  @Post()
  async createForm(
    @Body() data: CreateFormInput,
    @GetUser() user: User,
  ): Promise<CreateFormOutput> {
    const result = await this.createFormService.createForm(data, user)

    return {
      formId: result.id,
    }
  }
}
