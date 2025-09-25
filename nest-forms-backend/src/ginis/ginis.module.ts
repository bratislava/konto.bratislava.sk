import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import { AuthV2Module } from '../auth-v2/auth-v2.module'
import ClientsModule from '../clients/clients.module'
import ConvertModule from '../convert/convert.module'
import ConvertPdfModule from '../convert-pdf/convert-pdf.module'
import FilesModule from '../files/files.module'
import FormsModule from '../forms/forms.module'
import { FormsV2Module } from '../forms-v2/forms-v2.module'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import RabbitmqClientModule from '../rabbitmq-client/rabbitmq-client.module'
import TaxModule from '../tax/tax.module'
import MailgunService from '../utils/global-services/mailer/mailgun.service'
import MailgunHelper from '../utils/global-services/mailer/utils/mailgun.helper'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import GinisController from './ginis.controller'
import GinisService from './ginis.service'
import GinisHelper from './subservices/ginis.helper'
import GinisAPIService from './subservices/ginis-api.service'
import GinisTasksSubservice from './subservices/ginis-tasks.subservice'

@Module({
  imports: [
    FormsModule,
    FilesModule,
    ConvertModule,
    RabbitmqClientModule,
    ConvertPdfModule,
    TaxModule,
    BullModule.registerQueue({
      name: 'sharepoint',
    }),
    ClientsModule,
    UserInfoPipeModule,
    FormsV2Module,
    AuthV2Module,
  ],
  providers: [
    GinisService,
    GinisHelper,
    ThrowerErrorGuard,
    GinisAPIService,
    NasesUtilsService,
    MailgunHelper,
    MailgunService,
    MinioClientSubservice,
    GinisTasksSubservice,
  ],
  exports: [GinisService, GinisHelper],
  controllers: [GinisController],
})
export default class GinisModule {}
