import { Module } from '@nestjs/common'

import { TowingController } from './towing.controller'
import { TowingService } from './towing.service'

@Module({
  controllers: [TowingController],
  providers: [TowingService],
})
export class TowingModule {}
