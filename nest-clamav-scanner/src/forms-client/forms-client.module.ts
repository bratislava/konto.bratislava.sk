import { Module } from '@nestjs/common'

import ClientsModule from '../clients/clients.module'
import { FormsClientService } from './forms-client.service'

@Module({
  imports: [ClientsModule],
  providers: [FormsClientService],
  exports: [FormsClientService],
})
export class FormsClientModule {}
