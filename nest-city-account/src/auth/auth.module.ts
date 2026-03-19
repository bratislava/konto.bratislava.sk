import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { AuthController } from './auth.controller'
import { SignatureGuard } from './guards/signature.guard'
import { CognitoStrategy } from './strategies/cognito.strategy'
import { SignatureStrategy } from './strategies/signature.strategy'

@Module({
  imports: [PassportModule],
  providers: [CognitoStrategy, SignatureStrategy, SignatureGuard],
  exports: [SignatureGuard],
  controllers: [AuthController],
})
export class AuthModule {}
