import { Module } from '@nestjs/common'

import { GpWebpayService } from './gpwebpay.service'

@Module({
  providers: [GpWebpayService],
  exports: [GpWebpayService],
})
export class GpWebpayModule {}
