import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { AuthController } from './auth.controller'
import { CognitoStrategy } from './strategies/cognito.strategy'
import ThrowerErrorGuard from '../utils/guards/errors.guard'

@Module({
  imports: [PassportModule],
  providers: [CognitoStrategy, CognitoSubservice, ThrowerErrorGuard],
  exports: [],
  controllers: [AuthController],
})
export class AuthModule {}
