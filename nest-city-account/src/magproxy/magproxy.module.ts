import { Module } from '@nestjs/common'
import ThrowerErrorGuard, { ErrorMessengerGuard } from 'src/utils/guards/errors.guard'
import { PrismaModule } from '../prisma/prisma.module'
import { MagproxyService } from './magproxy.service'

@Module({
  imports: [PrismaModule],
  providers: [MagproxyService, ThrowerErrorGuard, ErrorMessengerGuard],
  exports: [MagproxyService],
})
export class MagproxyModule {}
