import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { CognitoStrategy } from './strategies/cognito.strategy'

@Module({
  imports: [PassportModule],
  providers: [CognitoStrategy],
  exports: [],
  controllers: [AuthController],
})
export class AuthModule {}
