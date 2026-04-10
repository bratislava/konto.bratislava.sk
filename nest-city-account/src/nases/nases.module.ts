import { Module } from '@nestjs/common'

import ClientsModule from '../clients/clients.module'
import { PrismaModule } from '../prisma/prisma.module'
import { NasesService } from './nases.service'

@Module({
  imports: [PrismaModule, ClientsModule],
  providers: [NasesService],
  exports: [NasesService],
})
export class NasesModule {}
