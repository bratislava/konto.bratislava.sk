import { Module } from '@nestjs/common'
import { DpbController } from './dpb.controller'
import { OAuth2Module } from '../oauth2/oauth2.module'
import { DpbService } from './dpb.service'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [OAuth2Module, UserModule, AuthModule],
  controllers: [DpbController],
  providers: [DpbService],
  exports: [],
})
export class DpbModule {}
