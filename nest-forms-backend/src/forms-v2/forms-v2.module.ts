import { Module } from '@nestjs/common'

import { AuthV2Module } from '../auth-v2/auth-v2.module'
import PrismaModule from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { FormMigrationsController } from './controllers/form-migrations.controller'
import { FormsV2Controller } from './controllers/forms-v2.controller'
import { FormAccessGuard } from './guards/form-access.guard'
import { FormSendOnlyRegisteredGuard } from './guards/form-send-only-registered.guard'
import { CreateFormService } from './services/create-form.service'
import { FormAccessService } from './services/form-access.service'
import { FormMigrationsService } from './services/form-migrations.service'
import { FormSendService } from './services/form-send.service'

@Module({
  imports: [PrismaModule, AuthV2Module],
  controllers: [FormMigrationsController, FormsV2Controller],
  providers: [
    FormMigrationsService,
    FormAccessService,
    FormAccessGuard,
    CreateFormService,
    ThrowerErrorGuard,
    FormSendOnlyRegisteredGuard,
    FormSendService,
  ],
  exports: [FormAccessService, FormAccessGuard, FormSendOnlyRegisteredGuard],
})
export class FormsV2Module {}
