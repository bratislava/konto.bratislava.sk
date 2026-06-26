import { Module } from '@nestjs/common'

import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import ScannerClientService from './scanner-client.service'

@Module({
  providers: [ScannerClientService, ThrowerErrorGuard],
  exports: [ScannerClientService],
})
export default class ScannerClientModule {}
