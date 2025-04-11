import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import ClientsModule from '../clients/clients.module'
import NasesModule from '../nases/nases.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import AuthController from './auth.controller'
import AuthService from './auth.service'
import { UserInfoPipe } from './decorators/user-info.decorator'
import BasicGuard from './guards/auth-basic.guard'
import NasesAuthGuard from './guards/nases.guard'
import AdminStrategy from './strategies/admin.strategy'
import BasicStrategy from './strategies/auth-basic.strategy'
import CognitoStrategy from './strategies/cognito.strategy'
import NasesStrategy from './strategies/nases.strategy'

@Module({
  imports: [PassportModule, NasesModule, ClientsModule],
  providers: [
    CognitoStrategy,
    AuthService,
    NasesStrategy,
    BasicStrategy,
    ThrowerErrorGuard,
    BasicGuard,
    NasesAuthGuard,
    AdminStrategy,
    UserInfoPipe,
  ],
  exports: [AuthService, UserInfoPipe],
  controllers: [AuthController],
})
export default class AuthModule {}
