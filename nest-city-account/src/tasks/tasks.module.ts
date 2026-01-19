import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { TaxSubservice } from '../utils/subservices/tax.subservice'
import ClientsModule from '../clients/clients.module'
import { TasksService } from './tasks.service'
import { MailgunModule } from '../mailgun/mailgun.module'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module'

@Module({
  imports: [PrismaModule, PhysicalEntityModule, ClientsModule, MailgunModule, PdfGeneratorModule],
  providers: [ThrowerErrorGuard, TaxSubservice, TasksService, CognitoSubservice],
  exports: [],
  controllers: [],
})
export class TasksModule {}
