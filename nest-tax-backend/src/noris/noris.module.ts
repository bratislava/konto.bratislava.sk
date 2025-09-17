import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { NorisService } from './noris.service'
import {ConnectionSubservice} from "./subservices/connection.subservice";

@Module({
  imports: [PrismaModule],
  providers: [NorisService,ConnectionSubservice, ThrowerErrorGuard],
  exports: [NorisService],
  controllers: [],
})
export class NorisModule {}
