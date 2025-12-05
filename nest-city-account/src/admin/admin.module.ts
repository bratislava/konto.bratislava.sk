import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { AdminStrategy } from '../auth/strategies/admin.strategy'
import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UpvsIdentityByUriModule } from '../upvs-identity-by-uri/upvs-identity-by-uri.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { AdminController } from './admin.controller'
import { UserService } from '../user/user.service'
import { AdminService } from './admin.service'
import { AdminCronSubservice } from './subservices/admin-cron.subservice'
import { TaxSubservice } from '../utils/subservices/tax.subservice'
import ClientsModule from '../clients/clients.module'
import { UserModule } from '../user/user.module'
import { DatabaseSubserviceUser } from '../user/utils/subservice/database.subservice'

@Module({
  imports: [
    PassportModule,
    PrismaModule,
    UpvsIdentityByUriModule,
    PhysicalEntityModule,
    BloomreachModule,
    ClientsModule,
    UserModule,
  ],
  providers: [
    AdminService,
    ThrowerErrorGuard,
    AdminStrategy,
    CognitoSubservice,
    AdminCronSubservice,
    TaxSubservice,
    UserService,
    DatabaseSubserviceUser,
  ],
  exports: [],
  controllers: [AdminController],
})
export class AdminModule {}
