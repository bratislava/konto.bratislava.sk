import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'

import { RfoByBirthnumberModule } from 'src/rfo-by-birthnumber/rfo-by-birthnumber.module'
import { UpvsIdentityByUriModule } from 'src/upvs-identity-by-uri/upvs-identity-by-uri.module'
import { ErrorThrowerGuard } from 'src/utils/guards/errors.guard'
import { PhysicalEntityService } from './physical-entity.service'

@Module({
  imports: [PrismaModule, RfoByBirthnumberModule, UpvsIdentityByUriModule],
  providers: [PhysicalEntityService, ErrorThrowerGuard],
  exports: [PhysicalEntityService],
  controllers: [],
})
export class PhysicalEntityModule {}
