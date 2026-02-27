import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { CognitoStrategy } from './strategies/cognito.strategy'
import { SignatureStrategy } from './strategies/signature.strategy'
import { SignatureGuard } from './guards/signature.guard'
import ThrowerErrorGuard from '../utils/guards/errors.guard'

@Module({
  imports: [PassportModule],
  providers: [CognitoStrategy, SignatureStrategy, SignatureGuard, ThrowerErrorGuard],
  exports: [SignatureGuard],
  controllers: [AuthController],
})
export class AuthModule {}
