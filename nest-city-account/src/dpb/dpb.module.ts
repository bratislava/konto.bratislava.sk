import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { OAuth2Module } from '../oauth2/oauth2.module'
import { UserModule } from '../user/user.module'
import { DpbController } from './dpb.controller'
import { DpbService } from './dpb.service'

@Module({
  imports: [OAuth2Module, UserModule, AuthModule],
  controllers: [DpbController],
  providers: [DpbService],
  exports: [],
})
export class DpbModule {}
