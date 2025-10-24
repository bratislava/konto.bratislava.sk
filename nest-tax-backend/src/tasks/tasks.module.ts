import { Module } from '@nestjs/common'

import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { CardPaymentReportingModule } from '../card-payment-reporting/card-payment-reporting.module'
import ClientsModule from '../clients/clients.module'
import { NorisModule } from '../noris/noris.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import DatabaseSubservice from '../utils/subservices/database.subservice'
import ConfigSubservice from './subservices/config.subservice'
import { TasksService } from './tasks.service'

@Module({
  imports: [
    CardPaymentReportingModule,
    BloomreachModule,
    ClientsModule,
    NorisModule,
  ],
  providers: [
    TasksService,
    ThrowerErrorGuard,
    DatabaseSubservice,
    CityAccountSubservice,
    ConfigSubservice,
  ],
  exports: [TasksService],
})
export class TasksModule {}
