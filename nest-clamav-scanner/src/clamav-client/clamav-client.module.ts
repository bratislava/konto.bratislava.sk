import { Module } from '@nestjs/common'

import BaConfigService from '../config/ba-config.service'
import { ClamavClientService } from './clamav-client.service'

@Module({
  providers: [ClamavClientService],
  exports: [ClamavClientService],
})
export class ClamavClientModule {
  constructor(
    private readonly clamavClientService: ClamavClientService,
    private readonly baConfigService: BaConfigService,
  ) {
    this.clamavClientService = new ClamavClientService(baConfigService)
  }
}
