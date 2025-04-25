import { Module } from '@nestjs/common'

import { AdminModule } from '../admin/admin.module'
import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { CardPaymentReportingModule } from '../card-payment-reporting/card-payment-reporting.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { TasksService } from './tasks.service'

@Module({
  imports: [AdminModule, CardPaymentReportingModule, BloomreachModule],
  providers: [TasksService, ThrowerErrorGuard, CityAccountSubservice],
  exports: [TasksService],
})
export class TasksModule {}
