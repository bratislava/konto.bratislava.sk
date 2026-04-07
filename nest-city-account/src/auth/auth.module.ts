import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { CacheModule } from '../cache/cache.module'
import { AuthController } from './auth.controller'
import { SignatureGuard } from './guards/signature.guard'
import { NonceService } from './services/nonce.service'
import { CognitoStrategy } from './strategies/cognito.strategy'
import { SignatureStrategy } from './strategies/signature.strategy'

@Module({
  imports: [PassportModule, CacheModule],
  providers: [CognitoStrategy, SignatureStrategy, SignatureGuard, NonceService],
  exports: [SignatureGuard],
  controllers: [AuthController],
})
export class AuthModule {}
