import { Module } from '@nestjs/common'

import { PdfGeneratorModule } from '../pdf-generator/pdf-generator.module'
import { MailgunService } from './mailgun.service'
import { MailgunMessageBuilder } from './mailgun-message.builder'

@Module({
  imports: [PdfGeneratorModule],
  providers: [MailgunService, MailgunMessageBuilder],
  exports: [MailgunService],
})
export class MailgunModule {}
