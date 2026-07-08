import { Module } from '@nestjs/common'

import ConvertModule from '../convert/convert.module'
import ConvertPdfModule from '../convert-pdf/convert-pdf.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsModule from '../forms/forms.module'
import GinisModule from '../ginis/ginis.module'
import { MailerModule } from '../mailer/mailer.module'
import RabbitmqClientModule from '../rabbitmq-client/rabbitmq-client.module'
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
    MailerModule,
  ],
  providers: [FormDeliveryConsumerService, EmailFormsService, WebhookService],
  exports: [FormDeliveryConsumerService],
})
export default class FormDeliveryConsumerModule {}
