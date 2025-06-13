import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import ClientsModule from '../clients/clients.module'
import BaConfigModule from '../config/ba-config.module'
import BaConfigService from '../config/ba-config.service'
import ConvertModule from '../convert/convert.module'
import ConvertPdfModule from '../convert-pdf/convert-pdf.module'
import FilesModule from '../files/files.module'
import FormsModule from '../forms/forms.module'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import RabbitmqClientModule from '../rabbitmq-client/rabbitmq-client.module'
import TaxModule from '../tax/tax.module'
import MailgunService from '../utils/global-services/mailer/mailgun.service'
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
    BullModule.registerQueueAsync({
      imports: [BaConfigModule],
      inject: [BaConfigService],
      useFactory: async (baConfigService: BaConfigService) => ({
        redis: {
          host: baConfigService.redis.service,
          port: baConfigService.redis.port,
          username: baConfigService.redis.username,
          password: baConfigService.redis.password,
        },
        name: 'sharepoint',
      }),
    }),
    ClientsModule,
    UserInfoPipeModule,
  ],
  providers: [
    GinisService,
    GinisHelper,
    ThrowerErrorGuard,
    GinisAPIService,
    NasesUtilsService,
    MailgunService,
    MinioClientSubservice,
    GinisTasksSubservice,
  ],
  exports: [GinisService, GinisHelper],
  controllers: [GinisController],
})
export default class GinisModule {}
