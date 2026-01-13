import { Module } from '@nestjs/common'
import { MailgunService } from './mailgun.service'
import { MailgunMessageBuilder } from './mailgun-message-builder'

@Module({
  providers: [MailgunService, MailgunMessageBuilder],
  exports: [MailgunService],
})
export class MailgunModule {}
