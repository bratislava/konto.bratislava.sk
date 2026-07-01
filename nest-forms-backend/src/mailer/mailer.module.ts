import { Module } from '@nestjs/common'

import MailgunService from './mailgun.service'
import OloMailerService from './olo-mailer.service'
import MailgunHelper from './utils/mailgun.helper'

@Module({
  providers: [MailgunHelper, MailgunService, OloMailerService],
  exports: [MailgunHelper, MailgunService, OloMailerService],
})
export class MailerModule {}
