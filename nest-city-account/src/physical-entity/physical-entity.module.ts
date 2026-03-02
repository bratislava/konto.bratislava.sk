import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'

import { PhysicalEntityService } from './physical-entity.service'

@Module({
  imports: [PrismaModule],
  providers: [PhysicalEntityService],
  exports: [PhysicalEntityService],
  controllers: [],
})
export class PhysicalEntityModule {}
