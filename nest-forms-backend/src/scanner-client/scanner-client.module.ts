import { Module } from '@nestjs/common'

import ClientsModule from '../clients/clients.module'
import ScannerClientService from './scanner-client.service'

@Module({
  imports: [ClientsModule],
  providers: [ScannerClientService],
  exports: [ScannerClientService],
})
export default class ScannerClientModule {}
