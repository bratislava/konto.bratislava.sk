import { Module } from '@nestjs/common'

import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { OAuth2Module } from '../oauth2/oauth2.module'
import { PrismaModule } from '../prisma/prisma.module'
import { PaasMpaController } from './paas-mpa.controller'
import { PaasMpaService } from './paas-mpa.service'

@Module({
  imports: [OAuth2Module, BloomreachModule, PrismaModule],
  controllers: [PaasMpaController],
  providers: [PaasMpaService],
  exports: [],
})
export class PaasMpaModule {}
