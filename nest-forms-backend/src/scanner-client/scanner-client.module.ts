import { Module } from '@nestjs/common'

import ScannerClientService from './scanner-client.service'

@Module({
  providers: [ScannerClientService],
  exports: [ScannerClientService],
})
export default class ScannerClientModule {}
