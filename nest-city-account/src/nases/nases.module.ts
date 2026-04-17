import { Module } from '@nestjs/common'

import ApiJwtTokensModule from '../api-jwt-tokens/api-jwt-tokens.module'
import ClientsModule from '../clients/clients.module'
import { PrismaModule } from '../prisma/prisma.module'
import { NasesService } from './nases.service'

@Module({
  imports: [PrismaModule, ClientsModule, ApiJwtTokensModule],
  providers: [NasesService],
  exports: [NasesService],
})
export class NasesModule {}
