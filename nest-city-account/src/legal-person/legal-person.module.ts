import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { LegalPersonService } from './legal-person.service'

@Module({
  imports: [PrismaModule],
  providers: [LegalPersonService],
  exports: [LegalPersonService],
})
export class LegalPersonModule {}
