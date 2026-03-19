import { Module } from '@nestjs/common'

import { QrCodeService } from './qrcode.service'

@Module({
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}
