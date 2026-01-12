import { Module } from '@nestjs/common'
import { MailgunService } from './mailgun.service'
import { MailgunTemplateFactory } from './dto/mailgun-template.factory'

@Module({
  providers: [MailgunService, MailgunTemplateFactory],
  exports: [MailgunService],
})
export class MailgunModule {}
