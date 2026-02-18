import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { UpvsIdentityByUriService } from './upvs-identity-by-uri.service'
import { NasesModule } from '../nases/nases.module'

@Module({
  imports: [PrismaModule, NasesModule],
  providers: [UpvsIdentityByUriService],
  exports: [UpvsIdentityByUriService],
})
export class UpvsIdentityByUriModule {}
