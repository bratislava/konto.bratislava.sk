import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { ErrorThrowerGuard } from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { AuthController } from './auth.controller'
import { CognitoStrategy } from './strategies/cognito.strategy'

@Module({
  imports: [PassportModule],
  providers: [CognitoStrategy, CognitoSubservice, ErrorThrowerGuard],
  exports: [],
  controllers: [AuthController],
})
export class AuthModule {}
