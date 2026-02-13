import { Module } from '@nestjs/common'
import { MailgunService } from './mailgun.service'
import { MailgunMessageBuilder } from './mailgun-message.builder'
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'

@Module({
  imports: [PdfGeneratorModule],
  providers: [MailgunService, MailgunMessageBuilder, CognitoSubservice],
  exports: [MailgunService],
})
export class MailgunModule {}
