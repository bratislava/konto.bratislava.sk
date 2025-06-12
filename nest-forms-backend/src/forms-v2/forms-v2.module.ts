import { Module } from '@nestjs/common'

import { AuthV2Module } from '../auth-v2/auth-v2.module'
import PrismaModule from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { FormMigrationsController } from './controllers/form-migrations.controller'
import { FormsV2Controller } from './controllers/forms-v2.controller'
import { CreateFormService } from './services/create-form.service'
import { FormAccessService } from './services/form-access.service'
import { FormMigrationsService } from './services/form-migrations.service'

@Module({
  imports: [PrismaModule, AuthV2Module],
  controllers: [FormMigrationsController, FormsV2Controller],
  providers: [
    FormMigrationsService,
    CreateFormService,
    ThrowerErrorGuard,
    FormAccessService,
  ],
  exports: [FormAccessService],
})
export class FormsV2Module {}
