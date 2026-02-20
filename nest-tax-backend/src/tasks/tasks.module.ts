import { Module } from '@nestjs/common'

import { BloomreachModule } from '../bloomreach/bloomreach.module.js'
import { CardPaymentReportingModule } from '../card-payment-reporting/card-payment-reporting.module.js'
import ClientsModule from '../clients/clients.module.js'
import { NorisModule } from '../noris/noris.module.js'
import { PaymentModule } from '../payment/payment.module.js'
import ThrowerErrorGuard from '../utils/guards/errors.guard.js'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice.js'
import DatabaseSubservice from '../utils/subservices/database.subservice.js'
import { UtilsModule } from '../utils-module/utils.module.js'
import TasksConfigSubservice from './subservices/config.subservice.js'
import TaxImportHelperSubservice from './subservices/tax-import-helper.subservice.js'
import { TasksService } from './tasks.service.js'

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
    TaxImportHelperSubservice,
  ],
  exports: [TasksService],
})
export class TasksModule {}
