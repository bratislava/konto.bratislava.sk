import { Module } from '@nestjs/common'

import { AdminModule } from '../admin/admin.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { TasksService } from './tasks.service'
import CardPaymentReportingSubservice from '../utils/subservices/cardPaymentReporting.subservice'

@Module({
  imports: [AdminModule],
  providers: [TasksService, ThrowerErrorGuard, CardPaymentReportingSubservice],
  exports: [TasksService],
})
export class TasksModule {}
