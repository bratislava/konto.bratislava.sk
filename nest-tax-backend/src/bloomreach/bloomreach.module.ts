import { Module } from '@nestjs/common'

import ThrowerErrorGuard from '../utils/guards/errors.guard.js'
import { BloomreachService } from './bloomreach.service.js'

@Module({
  imports: [],
  providers: [BloomreachService, ThrowerErrorGuard],
  exports: [BloomreachService],
  controllers: [],
})
export class BloomreachModule {}
