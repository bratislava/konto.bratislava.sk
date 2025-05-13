import { Module } from '@nestjs/common'

import { AdminModule } from '../admin/admin.module'
import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { CardPaymentReportingModule } from '../card-payment-reporting/card-payment-reporting.module'
import ClientsModule from '../clients/clients.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../utils/subservices/database.subservice'
import { TasksService } from './tasks.service'

@Module({
  imports: [
    AdminModule,
    CardPaymentReportingModule,
    BloomreachModule,
    ClientsModule,
  ],
  providers: [
    TasksService,
    ThrowerErrorGuard,
    DatabaseSubservice,
    CityAccountSubservice,
  ],
  exports: [TasksService],
})
export class TasksModule {}
