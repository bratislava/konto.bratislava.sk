import { Module } from '@nestjs/common'

import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { CardPaymentReportingModule } from '../card-payment-reporting/card-payment-reporting.module'
import ClientsModule from '../clients/clients.module'
import { NorisModule } from '../noris/noris.module'
import { PaymentModule } from '../payment/payment.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../utils/subservices/database.subservice'
import { UtilsModule } from '../utils-module/utils.module'
import TasksConfigSubservice from './subservices/config.subservice'
import { ReportinTasksSubservice } from './subservices/reporting.tasks.service'
import TaxImportTasksService from './subservices/tax-import.tasks.service'
import { TasksService } from './tasks.service'

@Module({
  imports: [
    CardPaymentReportingModule,
    BloomreachModule,
    ClientsModule,
    NorisModule,
    PaymentModule,
    UtilsModule,
  ],
  providers: [
    TasksService,
    ThrowerErrorGuard,
    DatabaseSubservice,
    CityAccountSubservice,
    TasksConfigSubservice,
    TaxImportTasksService,
    ReportinTasksSubservice,
  ],
  exports: [TasksService],
})
export class TasksModule {}
