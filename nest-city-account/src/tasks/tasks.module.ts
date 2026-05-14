import { Module } from '@nestjs/common'

import { BloomreachModule } from '../bloomreach/bloomreach.module'
import ClientsModule from '../clients/clients.module'
import { MailgunModule } from '../mailgun/mailgun.module'
import { NorisModule } from '../noris/noris.module'
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UpvsQueueModule } from '../upvs-queue/upvs-queue.module'
import { TaxSubservice } from '../utils/subservices/tax.subservice'
import { CleanupTasksSubservice } from './subservices/cleanup-tasks.subservice'
import { EdeskTasksSubservice } from './subservices/edesk-tasks.subservice'
import { TaxDeliveryMethodsTasksSubservice } from './subservices/tax-delivery-methods-tasks.subservice'
import { TasksService } from './tasks.service'

@Module({
  imports: [
    PrismaModule,
    PhysicalEntityModule,
    ClientsModule,
    MailgunModule,
    PdfGeneratorModule,
    UpvsQueueModule,
    NorisModule,
    BloomreachModule,
  ],
  providers: [
    TaxSubservice,
    CleanupTasksSubservice,
    EdeskTasksSubservice,
    TaxDeliveryMethodsTasksSubservice,
    TasksService,
  ],
  exports: [],
  controllers: [],
})
export class TasksModule {}
