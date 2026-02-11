import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'

import { UpvsIdentityByUriModule } from '../upvs-identity-by-uri/upvs-identity-by-uri.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PhysicalEntityService } from './physical-entity.service'
import { MagproxyModule } from '../magproxy/magproxy.module'

@Module({
  imports: [PrismaModule, UpvsIdentityByUriModule, MagproxyModule],
  providers: [PhysicalEntityService, ThrowerErrorGuard],
  exports: [PhysicalEntityService],
  controllers: [],
})
export class PhysicalEntityModule {}
