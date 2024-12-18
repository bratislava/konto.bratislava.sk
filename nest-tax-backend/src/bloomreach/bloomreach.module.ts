import { Module } from '@nestjs/common'

import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { BloomreachService } from './bloomreach.service'

@Module({
  imports: [],
  providers: [BloomreachService, ThrowerErrorGuard],
  exports: [BloomreachService],
  controllers: [],
})
export class BloomreachModule {}
