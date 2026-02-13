import { Module } from '@nestjs/common'
import { MailgunService } from './mailgun.service'
import { MailgunMessageBuilder } from './mailgun-message.builder'
import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module'

@Module({
  imports: [PdfGeneratorModule],
  providers: [MailgunService, MailgunMessageBuilder],
  exports: [MailgunService],
})
export class MailgunModule {}
