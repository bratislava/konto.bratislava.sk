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
import EmailFormsService from './services/email-forms.service'
import FormDeliveryConsumerService from './services/form-delivery-consumer.service'
import WebhookService from './services/webhook.service'

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
    EmailFormsService,
    WebhookService,
  ],
  exports: [FormDeliveryConsumerService],
})
export default class FormDeliveryConsumerModule {}
