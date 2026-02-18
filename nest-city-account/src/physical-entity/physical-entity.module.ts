import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'

import { UpvsIdentityByUriModule } from '../upvs-identity-by-uri/upvs-identity-by-uri.module'
import { PhysicalEntityService } from './physical-entity.service'

@Module({
  imports: [PrismaModule, UpvsIdentityByUriModule],
  providers: [PhysicalEntityService],
  exports: [PhysicalEntityService],
  controllers: [],
})
export class PhysicalEntityModule {}
