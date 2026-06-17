import { Module } from '@nestjs/common'

import { BloomreachService } from './bloomreach.service'

@Module({
  imports: [],
  providers: [BloomreachService],
  exports: [BloomreachService],
  controllers: [],
})
export class BloomreachModule {}
