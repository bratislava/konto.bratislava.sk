import { Module } from '@nestjs/common'
import { ErrorMessengerGuard, ErrorThrowerGuard } from 'src/utils/guards/errors.guard'
import { PrismaModule } from '../prisma/prisma.module'
import { MagproxyService } from './magproxy.service'

@Module({
  imports: [PrismaModule],
  providers: [MagproxyService, ErrorThrowerGuard, ErrorMessengerGuard],
  exports: [MagproxyService],
})
export class MagproxyModule {}
