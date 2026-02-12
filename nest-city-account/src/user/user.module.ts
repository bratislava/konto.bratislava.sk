import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { AdminStrategy } from '../auth/strategies/admin.strategy'
import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { PrismaModule } from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { UserController } from './user.controller'
import { UserIntegrationController } from './user.integration.controller'
import { UserService } from './user.service'
import { UserDataSubservice } from './utils/subservice/user-data.subservice'
import { UserTierService } from './user-tier.service'

@Module({
  imports: [PassportModule, PrismaModule, BloomreachModule],
  providers: [
    UserService,
    UserDataSubservice,
    UserTierService,
    ThrowerErrorGuard,
    AdminStrategy,
    CognitoSubservice,
  ],
  exports: [UserService, UserTierService],
  controllers: [UserController, UserIntegrationController],
})
export class UserModule {}
