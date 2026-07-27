import { Module } from '@nestjs/common'

import { NasesModule } from '../nases/nases.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import { PrismaModule } from '../prisma/prisma.module'
import { EdeskBatchUpdateService } from './edesk-batch-update.service'
import { EdeskUriUpdateService } from './edesk-uri-update.service'
import { UpvsQueueService } from './upvs-queue.service'
import { UrgentLookupService } from './urgent-lookup.service'

@Module({
  imports: [PrismaModule, PhysicalEntityModule, NasesModule],
  providers: [
    UpvsQueueService,
    UrgentLookupService,
    EdeskUriUpdateService,
    EdeskBatchUpdateService,
  ],
  exports: [UpvsQueueService],
})
export class UpvsQueueModule {}
