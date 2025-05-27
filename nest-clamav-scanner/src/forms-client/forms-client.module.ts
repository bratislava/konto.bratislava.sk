import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import ClientsModule from '../clients/clients.module'
import { FormsClientService } from './forms-client.service'

@Module({
  imports: [ConfigModule, ClientsModule],
  providers: [FormsClientService],
  exports: [FormsClientService],
})
export class FormsClientModule {}
