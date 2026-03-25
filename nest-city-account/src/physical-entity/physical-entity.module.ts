import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'

import { PhysicalEntityService } from './physical-entity.service'
import { BloomreachModule } from '../bloomreach/bloomreach.module'

@Module({
  imports: [PrismaModule, BloomreachModule],
  providers: [PhysicalEntityService],
  exports: [PhysicalEntityService],
  controllers: [],
})
export class PhysicalEntityModule {}
