import { Module } from '@nestjs/common'

import { AuthV2Module } from '../auth-v2/auth-v2.module'
import PrismaModule from '../prisma/prisma.module'
import { FormMigrationController } from './controllers/form-migration.controller'
import { FormMigrationService } from './services/form-migration.service'

@Module({
  imports: [PrismaModule, AuthV2Module],
  controllers: [FormMigrationController],
  providers: [FormMigrationService],
  exports: [],
})
export class FormsV2Module {}
