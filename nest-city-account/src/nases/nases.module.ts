import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { ErrorThrowerGuard } from '../utils/guards/errors.guard'
import { NasesService } from './nases.service'

@Module({
  imports: [PrismaModule],
  // TODO ErrorThrowerGuard to module ?
  providers: [NasesService, ErrorThrowerGuard],
  exports: [NasesService],
})
export class NasesModule {}
