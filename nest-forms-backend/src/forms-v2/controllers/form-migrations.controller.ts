import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'

import { AllowedUserTypes } from '../../auth-v2/decorators/allowed-user-types.decorator'
import { GetUser } from '../../auth-v2/decorators/get-user.decorator'
import { UserAuthGuard } from '../../auth-v2/guards/user-auth.guard'
import { AuthUser, UserType } from '../../auth-v2/types/user'
import { PrepareMigrationInput } from '../inputs/prepare-migration.input'
import { ClaimMigrationOutput } from '../outputs/claim-migration.output'
import { PrepareMigrationOutput } from '../outputs/prepare-migration.output'
import { FormMigrationsService } from '../services/form-migrations.service'

@Controller('forms/migrations')
@ApiTags('Form Migrations')
export class FormMigrationsController {
  constructor(private readonly formMigrationService: FormMigrationsService) {}

  @Post('prepare')
  @ApiOkResponse({
    type: PrepareMigrationOutput,
  })
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth])
  @UseGuards(UserAuthGuard)
  async prepareMigration(
    @Body() prepareMigrationInput: PrepareMigrationInput,
    @GetUser() user: AuthUser,
  ): Promise<PrepareMigrationOutput> {
    await this.formMigrationService.prepareMigration(
      user,
      prepareMigrationInput.guestIdentityId,
    )

    return { success: true }
  }

  @Post('claim/:formId')
  @ApiOkResponse({
    type: ClaimMigrationOutput,
  })
  @ApiParam({
    name: 'formId',
    type: 'string',
    format: 'uuid',
  })
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth])
  @UseGuards(UserAuthGuard)
  async claimMigration(
    @Param('formId', ParseUUIDPipe) formId: string,
    @GetUser() user: AuthUser,
  ): Promise<ClaimMigrationOutput> {
    const success = await this.formMigrationService.claimMigration(user, formId)

    return { success }
  }
}
