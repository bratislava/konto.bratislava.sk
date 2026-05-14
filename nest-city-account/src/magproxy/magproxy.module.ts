import { Module } from '@nestjs/common'

import ClientsModule from '../clients/clients.module'
import { PrismaModule } from '../prisma/prisma.module'
import { MagproxyService } from './magproxy.service'

@Module({
  imports: [PrismaModule, ClientsModule],
  providers: [MagproxyService],
  exports: [MagproxyService],
})
export class MagproxyModule {}
