import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import ClientsModule from '../clients/clients.module'
import ConvertModule from '../convert/convert.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsModule from '../forms/forms.module'
import GinisModule from '../ginis/ginis.module'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import RabbitmqClientModule from '../rabbitmq-client/rabbitmq-client.module'
import TaxModule from '../tax/tax.module'
import MailgunService from '../utils/global-services/mailer/mailgun.service'
import OloMailerService from '../utils/global-services/mailer/olo-mailer.service'
import MailgunHelper from '../utils/global-services/mailer/utils/mailgun.helper'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import NasesConsumerHelper from './nases-consumer.helper'
import NasesConsumerService from './nases-consumer.service'
import EmailFormsSubservice from './subservices/email-forms.subservice'
import WebhookSubservice from './subservices/webhook.subservice'

@Module({
  imports: [
    RabbitmqClientModule,
    FormsModule,
    GinisModule,
    ConvertModule,
    TaxModule,
    FormValidatorRegistryModule,
    ClientsModule,
    UserInfoPipeModule,
  ],
  providers: [
    NasesConsumerService,
    NasesUtilsService,
    NasesConsumerHelper,
    ThrowerErrorGuard,
    MailgunHelper,
    MailgunService,
    OloMailerService,
    MinioClientSubservice,
    EmailFormsSubservice,
    WebhookSubservice,
  ],
  exports: [NasesConsumerService, NasesConsumerHelper],
})
export default class NasesConsumerModule {}
