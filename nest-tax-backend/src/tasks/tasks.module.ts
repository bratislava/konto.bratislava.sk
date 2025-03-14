import { Module } from '@nestjs/common'

import { AdminModule } from '../admin/admin.module'
import { CardPaymentReportingModule } from '../card-payment-reporting/card-payment-reporting.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { TasksService } from './tasks.service'

@Module({
  imports: [AdminModule, CardPaymentReportingModule],
  providers: [TasksService, ThrowerErrorGuard],
  exports: [TasksService],
})
export class TasksModule {}
