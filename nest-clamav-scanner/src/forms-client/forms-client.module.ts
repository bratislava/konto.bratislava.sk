import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { FormsClientService } from './forms-client.service'
import ClientsModule from '../clients/clients.module'

@Module({
  imports: [ConfigModule, ClientsModule],
  providers: [FormsClientService],
  exports: [FormsClientService],
})
export class FormsClientModule {}
