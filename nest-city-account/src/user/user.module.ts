import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { PrismaModule } from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { DatabaseSubserviceUser } from './utils/subservice/database.subservice'

@Module({
  imports: [PassportModule, PrismaModule, BloomreachModule],
  providers: [UserService, DatabaseSubserviceUser, ThrowerErrorGuard],
  exports: [],
  controllers: [UserController],
})
export class UserModule {}
