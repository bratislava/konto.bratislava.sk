import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import NasesModule from '../nases/nases.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import AuthController from './auth.controller'
import AuthService from './auth.service'
import UserInfoPipeModule from './decorators/user-info-pipe.module'
import BasicGuard from './guards/auth-basic.guard'
import AdminStrategy from './strategies/admin.strategy'
import BasicStrategy from './strategies/auth-basic.strategy'
import CognitoStrategy from './strategies/cognito.strategy'

@Module({
  imports: [PassportModule, NasesModule, UserInfoPipeModule],
  providers: [
    CognitoStrategy,
    AuthService,
    BasicStrategy,
    ThrowerErrorGuard,
    BasicGuard,
    AdminStrategy,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export default class AuthModule {}
