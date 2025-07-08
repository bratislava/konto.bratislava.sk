import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { TaxSubservice } from '../utils/subservices/tax.subservice'

@Module({
  imports: [PrismaModule, PhysicalEntityModule],
  providers: [ThrowerErrorGuard, TaxSubservice],
  exports: [],
  controllers: [],
})
export class TasksModule {}
