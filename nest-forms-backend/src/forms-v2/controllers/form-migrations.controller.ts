import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'

import { AllowedUserTypes } from '../../auth-v2/decorators/allowed-user-types.decorator'
import { GetUser } from '../../auth-v2/decorators/get-user.decorator'
import { UserAuthGuard } from '../../auth-v2/guards/user-auth.guard'
import { AuthUser, UserType } from '../../auth-v2/types/user'
import { ClaimMigrationInput } from '../inputs/claim-migration.input'
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

  @Post('claim')
  @ApiOkResponse({
    type: ClaimMigrationOutput,
  })
  @ApiBearerAuth()
  @AllowedUserTypes([UserType.Auth])
  @UseGuards(UserAuthGuard)
  async claimMigration(
    @Body() claimMigrationInput: ClaimMigrationInput,
    @GetUser() user: AuthUser,
  ): Promise<ClaimMigrationOutput> {
    const success = await this.formMigrationService.claimMigration(
      user,
      claimMigrationInput.formId,
    )

    return { success }
  }
}
