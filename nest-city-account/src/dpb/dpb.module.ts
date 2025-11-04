import { Module } from '@nestjs/common'
import { DpbController } from './dpb.controller'
import { OAuth2Module } from '../oauth2/oauth2.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'

@Module({
  imports: [OAuth2Module],
  controllers: [DpbController],
  providers: [ThrowerErrorGuard],
  exports: [],
})
export class DpbModule {}
