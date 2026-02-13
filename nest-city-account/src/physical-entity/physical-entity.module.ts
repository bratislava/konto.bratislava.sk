import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'

import { UpvsIdentityByUriModule } from '../upvs-identity-by-uri/upvs-identity-by-uri.module'
import { PhysicalEntityService } from './physical-entity.service'
import { MagproxyModule } from '../magproxy/magproxy.module'
import { SharedModule } from '../utils/subservices/shared.module'

@Module({
  imports: [PrismaModule, UpvsIdentityByUriModule, MagproxyModule, SharedModule],
  providers: [PhysicalEntityService],
  exports: [PhysicalEntityService],
  controllers: [],
})
export class PhysicalEntityModule {}
