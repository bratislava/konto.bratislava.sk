import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import UserInfoPipeModule from './decorators/user-info-pipe.module'
import BasicGuard from './guards/auth-basic.guard'
import AdminStrategy from './strategies/admin.strategy'
import BasicStrategy from './strategies/auth-basic.strategy'

@Module({
  imports: [PassportModule, UserInfoPipeModule],
  providers: [BasicStrategy, ThrowerErrorGuard, BasicGuard, AdminStrategy],
})
export default class AuthModule {}
