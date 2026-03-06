import { Module } from '@nestjs/common'
import { UpvsQueueService } from './upvs-queue.service'
import { PrismaModule } from '../prisma/prisma.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import { NasesModule } from '../nases/nases.module'

@Module({
  imports: [PrismaModule, PhysicalEntityModule, NasesModule],
  providers: [UpvsQueueService],
  exports: [UpvsQueueService],
})
export class UpvsQueueModule {}
