import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'

import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { NorisService } from './noris.service'

@Module({
  imports: [PrismaModule],
  providers: [NorisService, ThrowerErrorGuard],
  exports: [NorisService],
  controllers: [],
})
export class NorisModule {}
