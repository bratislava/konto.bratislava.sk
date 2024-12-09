import { Module } from '@nestjs/common'
import { NasesModule } from '../nases/nases.module'
import { PrismaModule } from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { UpvsIdentityByUriService } from './upvs-identity-by-uri.service'

@Module({
  imports: [PrismaModule, NasesModule],
  providers: [UpvsIdentityByUriService, ThrowerErrorGuard],
  exports: [UpvsIdentityByUriService],
})
export class UpvsIdentityByUriModule {}
