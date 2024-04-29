import { Module } from '@nestjs/common'

import PrismaModule from '../prisma/prisma.module'
import PrismaService from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import SchemasController from './schemas.controller'
import SchemasService from './schemas.service'

@Module({
  controllers: [SchemasController],
  providers: [SchemasService, ThrowerErrorGuard, PrismaService],
  imports: [PrismaModule],
  exports: [SchemasService],
})
export default class SchemasModule {}
