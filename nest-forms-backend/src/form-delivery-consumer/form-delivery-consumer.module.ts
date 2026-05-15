import { Module } from '@nestjs/common'

import ConvertModule from '../convert/convert.module'
import ConvertPdfModule from '../convert-pdf/convert-pdf.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsModule from '../forms/forms.module'
import GinisModule from '../ginis/ginis.module'
import RabbitmqClientModule from '../rabbitmq-client/rabbitmq-client.module'
import MailgunService from '../utils/global-services/mailer/mailgun.service'
import OloMailerService from '../utils/global-services/mailer/olo-mailer.service'
import MailgunHelper from '../utils/global-services/mailer/utils/mailgun.helper'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import FormDeliveryConsumerService from './form-delivery-consumer.service'
import EmailFormsSubservice from './subservices/email-forms.subservice'
import WebhookSubservice from './subservices/webhook.subservice'

@Module({
  imports: [
    RabbitmqClientModule,
    FormsModule,
    GinisModule,
    ConvertModule,
    FormValidatorRegistryModule,
    ConvertPdfModule,
  ],
  providers: [
    FormDeliveryConsumerService,
    ThrowerErrorGuard,
    MailgunHelper,
    MailgunService,
    OloMailerService,
    EmailFormsSubservice,
    WebhookSubservice,
  ],
  exports: [FormDeliveryConsumerService],
})
export default class FormDeliveryConsumerModule {}
