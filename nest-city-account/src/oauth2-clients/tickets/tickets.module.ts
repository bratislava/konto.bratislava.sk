import { Module } from '@nestjs/common'

import { OAuth2Module } from '../../oauth2/oauth2.module'
import { TicketsController } from './tickets.controller'

@Module({
  imports: [OAuth2Module],
  controllers: [TicketsController],
  providers: [],
  exports: [],
})
export class TicketsModule {}
