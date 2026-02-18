import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'

import { PhysicalEntityService } from './physical-entity.service'
import { NasesModule } from '../nases/nases.module'

@Module({
  imports: [PrismaModule, NasesModule],
  providers: [PhysicalEntityService],
  exports: [PhysicalEntityService],
  controllers: [],
})
export class PhysicalEntityModule {}
