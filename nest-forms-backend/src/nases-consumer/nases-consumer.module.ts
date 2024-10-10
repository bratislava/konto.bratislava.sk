import { Module } from '@nestjs/common'

import ConvertModule from '../convert/convert.module'
import JsonXmlConvertService from '../convert/utils-services/json-xml.convert.service'
import ConvertPdfModule from '../convert-pdf/convert-pdf.module'
import FilesModule from '../files/files.module'
import FormsModule from '../forms/forms.module'
import GinisModule from '../ginis/ginis.module'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import RabbitmqClientModule from '../rabbitmq-client/rabbitmq-client.module'
import TaxModule from '../tax/tax.module'
import MailgunService from '../utils/global-services/mailgun/mailgun.service'
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
    FilesModule,
    GinisModule,
    ConvertModule,
    ConvertPdfModule,
    TaxModule,
  ],
  providers: [
    NasesConsumerService,
    NasesUtilsService,
    NasesConsumerHelper,
    ThrowerErrorGuard,
    JsonXmlConvertService,
    MailgunService,
    MinioClientSubservice,
    EmailFormsSubservice,
    WebhookSubservice,
  ],
  exports: [NasesConsumerService, NasesConsumerHelper],
})
export default class NasesConsumerModule {}
