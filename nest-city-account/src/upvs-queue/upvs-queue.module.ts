import { Module } from '@nestjs/common'

import { NasesModule } from '../nases/nases.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UpvsQueueService } from './upvs-queue.service'

@Module({
  imports: [PrismaModule, PhysicalEntityModule, NasesModule],
  providers: [UpvsQueueService],
  exports: [UpvsQueueService],
})
export class UpvsQueueModule {}
