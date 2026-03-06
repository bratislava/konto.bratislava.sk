import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import { TaxSubservice } from '../utils/subservices/tax.subservice'
import ClientsModule from '../clients/clients.module'
import { TasksService } from './tasks.service'
import { MailgunModule } from '../mailgun/mailgun.module'
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module'
import { CleanupTasksSubservice } from './subservices/cleanup-tasks.subservice'
import { EdeskTasksSubservice } from './subservices/edesk-tasks.subservice'
import { TaxDeliveryMethodsTasksSubservice } from './subservices/tax-delivery-methods-tasks.subservice'
import { UpvsQueueModule } from '../upvs-queue/upvs-queue.module'
import { NorisModule } from '../noris/noris.module'

@Module({
  imports: [
    PrismaModule,
    PhysicalEntityModule,
    ClientsModule,
    MailgunModule,
    PdfGeneratorModule,
    UpvsQueueModule,
    NorisModule,
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
