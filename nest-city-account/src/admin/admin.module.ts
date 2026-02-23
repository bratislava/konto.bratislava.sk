import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { AdminStrategy } from '../auth/strategies/admin.strategy'
import { PrismaModule } from '../prisma/prisma.module'
import { VerificationModule } from '../user-verification/verification.module'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { AdminCronSubservice } from './subservices/admin-cron.subservice'
import { UserModule } from '../user/user.module'
import { BloomreachModule } from '../bloomreach/bloomreach.module'

/**
 * AdminModule - Manual administrative operations
 *
 * This module provides endpoints for manual/debug/maintenance operations.
 * It has been refactored to delegate business logic to domain modules.
 */
@Module({
  imports: [PassportModule, PrismaModule, UserModule, VerificationModule, BloomreachModule],
  providers: [AdminService, AdminStrategy, AdminCronSubservice],
  exports: [],
  controllers: [AdminController],
})
export class AdminModule {}
