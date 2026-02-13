import { Module } from '@nestjs/common'
import { MailgunService } from './mailgun.service'
import { MailgunMessageBuilder } from './mailgun-message.builder'
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'

@Module({
  imports: [PdfGeneratorModule],
  providers: [MailgunService, MailgunMessageBuilder, CognitoSubservice, ThrowerErrorGuard],
  exports: [MailgunService],
})
export class MailgunModule {}
