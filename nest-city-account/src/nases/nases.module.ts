import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { NasesService } from './nases.service'

@Module({
  imports: [PrismaModule],
  providers: [NasesService, ThrowerErrorGuard],
  exports: [NasesService],
})
export class NasesModule {}
