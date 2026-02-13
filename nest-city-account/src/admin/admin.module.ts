import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { AdminStrategy } from '../auth/strategies/admin.strategy'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UpvsIdentityByUriModule } from '../upvs-identity-by-uri/upvs-identity-by-uri.module'
import { VerificationModule } from '../user-verification/verification.module'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { AdminCronSubservice } from './subservices/admin-cron.subservice'
import { UserModule } from '../user/user.module'
import { SharedModule } from '../utils/subservices/shared.module'
import { BloomreachModule } from '../bloomreach/bloomreach.module'

/**
 * AdminModule - Manual administrative operations
 *
 * This module provides endpoints for manual/debug/maintenance operations.
 * It has been refactored to delegate business logic to domain modules:
 * - UserModule: User lookup, deactivation, deceased marking
 * - VerificationModule: Verification state, data retrieval, manual verification
 * - PhysicalEntityModule: Edesk validation (TODO)
 */
@Module({
  imports: [
    PassportModule,
    PrismaModule,
    UpvsIdentityByUriModule,
    PhysicalEntityModule,
    UserModule,
    VerificationModule,
    SharedModule,
    BloomreachModule,
  ],
  providers: [AdminService, AdminStrategy, AdminCronSubservice],
  exports: [],
  controllers: [AdminController],
})
export class AdminModule {}
