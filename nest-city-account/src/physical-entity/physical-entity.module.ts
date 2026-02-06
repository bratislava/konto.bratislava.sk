import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'

import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PhysicalEntityService } from './physical-entity.service'
import { MagproxyModule } from '../magproxy/magproxy.module'
import { NasesModule } from '../nases/nases.module'

@Module({
  imports: [PrismaModule, MagproxyModule, NasesModule],
  providers: [PhysicalEntityService, ThrowerErrorGuard],
  exports: [PhysicalEntityService],
  controllers: [],
})
export class PhysicalEntityModule {}
