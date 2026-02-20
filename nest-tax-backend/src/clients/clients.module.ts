import { Module } from '@nestjs/common'

import ClientsService from './clients.service.js'

@Module({
  providers: [ClientsService],
  exports: [ClientsService],
})
export default class ClientsModule {}
