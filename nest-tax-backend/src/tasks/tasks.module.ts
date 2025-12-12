import { Module } from '@nestjs/common'

import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { CardPaymentReportingModule } from '../card-payment-reporting/card-payment-reporting.module'
import ClientsModule from '../clients/clients.module'
import { NorisModule } from '../noris/noris.module'
import { PaymentModule } from '../payment/payment.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../utils/subservices/database.subservice'
import { RetrySubservice } from '../utils/subservices/retry.subservice'
import TasksConfigSubservice from './subservices/config.subservice'
import TaxImportHelperSubservice from './subservices/tax-import-helper.subservice'
import { TasksService } from './tasks.service'

@Module({
  imports: [
    CardPaymentReportingModule,
    BloomreachModule,
    ClientsModule,
    NorisModule,
    PaymentModule,
  ],
  providers: [
    TasksService,
    ThrowerErrorGuard,
    DatabaseSubservice,
    CityAccountSubservice,
    TasksConfigSubservice,
    TaxImportHelperSubservice,
    RetrySubservice,
  ],
  exports: [TasksService],
})
export class TasksModule {}
