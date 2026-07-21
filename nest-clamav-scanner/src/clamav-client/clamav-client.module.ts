import { Module } from '@nestjs/common'

import { ClamavClientService } from './clamav-client.service'

@Module({
  providers: [ClamavClientService],
  exports: [ClamavClientService],
})
export class ClamavClientModule {}
