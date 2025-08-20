import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { TaxSubservice } from '../utils/subservices/tax.subservice'
import ClientsModule from '../clients/clients.module'
import { TasksService } from './tasks.service'

@Module({
  imports: [PrismaModule, PhysicalEntityModule, ClientsModule],
  providers: [ThrowerErrorGuard, TaxSubservice, TasksService],
  exports: [],
  controllers: [],
})
export class TasksModule {}
