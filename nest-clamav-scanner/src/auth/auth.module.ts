import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { BasicStrategy } from './strategies/auth-basic.strategy'

@Module({
  imports: [PassportModule],
  providers: [AuthService, BasicStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
