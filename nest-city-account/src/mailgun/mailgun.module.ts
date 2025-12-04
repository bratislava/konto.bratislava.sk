import { Module } from '@nestjs/common'
import { MailgunService } from './mailgun.service'

@Module({
  providers: [MailgunService],
  exports: [MailgunService],
  imports: [],
})
export class MailgunModule {}
