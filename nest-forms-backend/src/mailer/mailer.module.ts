import { Module } from '@nestjs/common'

import StrapiModule from '../strapi/strapi.module'
import MailgunService from './mailgun.service'
import OloMailerService from './olo-mailer.service'
import MailgunHelper from './utils/mailgun.helper'

@Module({
  imports: [StrapiModule],
  providers: [MailgunHelper, MailgunService, OloMailerService],
  exports: [MailgunHelper, MailgunService, OloMailerService],
})
export class MailerModule {}
