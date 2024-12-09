import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'

import { RfoByBirthnumberModule } from 'src/rfo-by-birthnumber/rfo-by-birthnumber.module'
import { UpvsIdentityByUriModule } from 'src/upvs-identity-by-uri/upvs-identity-by-uri.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { PhysicalEntityService } from './physical-entity.service'
import { MagproxyModule } from '../magproxy/magproxy.module'
import { PhysicalEntityCronSubservice } from './subservices/physical-entity-cron.subservice'

@Module({
  imports: [PrismaModule, RfoByBirthnumberModule, UpvsIdentityByUriModule, MagproxyModule],
  providers: [PhysicalEntityService, ThrowerErrorGuard, PhysicalEntityCronSubservice],
  exports: [PhysicalEntityService],
  controllers: [],
})
export class PhysicalEntityModule {}
