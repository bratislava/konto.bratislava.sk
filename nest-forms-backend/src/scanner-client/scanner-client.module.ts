import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import ScannerClientService from './scanner-client.service'

@Module({
  imports: [ConfigModule],
  providers: [ScannerClientService, ThrowerErrorGuard],
  exports: [ScannerClientService],
})
export default class ScannerClientModule {
  constructor(
    private readonly scannerClientService: ScannerClientService,
    private readonly configService: ConfigService,
    private throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.scannerClientService = new ScannerClientService(
      configService,
      throwerErrorGuard,
    )
  }
}
