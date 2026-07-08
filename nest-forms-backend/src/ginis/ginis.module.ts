import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import ApiJwtTokensModule from '../api-jwt-tokens/api-jwt-tokens.module'
import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import { AuthV2Module } from '../auth-v2/auth-v2.module'
import ClientsModule from '../clients/clients.module'
import ConvertModule from '../convert/convert.module'
import ConvertPdfModule from '../convert-pdf/convert-pdf.module'
import FilesModule from '../files/files.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsModule from '../forms/forms.module'
import { FormsV2Module } from '../forms-v2/forms-v2.module'
import { MailerModule } from '../mailer/mailer.module'
import { MinioStorageModule } from '../minio-storage/minio-storage.module'
import NasesModule from '../nases/nases.module'
import RabbitmqClientModule from '../rabbitmq-client/rabbitmq-client.module'
import TaxModule from '../tax/tax.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import SharepointSubservice from '../utils/subservices/sharepoint.subservice'
import GinisController from './ginis.controller'
import GinisService from './ginis.service'
import GinisHelper from './subservices/ginis.helper'
import GinisAPIService from './subservices/ginis-api.service'
import GinisTasksSubservice from './subservices/ginis-tasks.subservice'

@Module({
  imports: [
    ApiJwtTokensModule,
    FormsModule,
    FormValidatorRegistryModule,
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
    NasesModule,
    MinioStorageModule,
    MailerModule,
  ],
  providers: [
    GinisService,
    GinisHelper,
    ThrowerErrorGuard,
    GinisAPIService,
    GinisTasksSubservice,
    SharepointSubservice,
  ],
  exports: [GinisService, GinisHelper],
  controllers: [GinisController],
})
export default class GinisModule {}
