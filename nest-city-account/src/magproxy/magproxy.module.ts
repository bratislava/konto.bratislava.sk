import { Module } from '@nestjs/common'
import ThrowerErrorGuard from 'src/utils/guards/errors.guard'
import { PrismaModule } from '../prisma/prisma.module'
import { MagproxyService } from './magproxy.service'
import ClientsModule from '../clients/clients.module'

@Module({
  imports: [PrismaModule, ClientsModule],
  providers: [MagproxyService, ThrowerErrorGuard],
  exports: [MagproxyService],
})
export class MagproxyModule {}
