import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { MagproxyService } from './magproxy.service'
import ClientsModule from '../clients/clients.module'

@Module({
  imports: [PrismaModule, ClientsModule],
  providers: [MagproxyService],
  exports: [MagproxyService],
})
export class MagproxyModule {}
