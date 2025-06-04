import { Module } from '@nestjs/common'

import { AuthV2Module } from '../auth-v2/auth-v2.module'
import PrismaModule from '../prisma/prisma.module'
import { FormMigrationsController } from './controllers/form-migrations.controller'
import { FormMigrationsService } from './services/form-migrations.service'

@Module({
  imports: [PrismaModule, AuthV2Module],
  controllers: [FormMigrationsController],
  providers: [FormMigrationsService],
  exports: [],
})
export class FormsV2Module {}
