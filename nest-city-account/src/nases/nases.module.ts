import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { NasesService } from './nases.service'
import ClientsModule from '../clients/clients.module'

@Module({
  imports: [PrismaModule, ClientsModule],
  providers: [NasesService],
  exports: [NasesService],
})
export class NasesModule {}
