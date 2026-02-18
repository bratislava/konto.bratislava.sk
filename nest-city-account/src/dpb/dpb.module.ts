import { Module } from '@nestjs/common'
import { DpbController } from './dpb.controller'
import { OAuth2Module } from '../oauth2/oauth2.module'

@Module({
  imports: [OAuth2Module],
  controllers: [DpbController],
  exports: [],
})
export class DpbModule {}
