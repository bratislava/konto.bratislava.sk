import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import { AuthV2Module } from '../auth-v2/auth-v2.module'
import ClientsModule from '../clients/clients.module'
import ConvertModule from '../convert/convert.module'
import ConvertPdfModule from '../convert-pdf/convert-pdf.module'
import FilesModule from '../files/files.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsHelper from '../forms/forms.helper'
import FormsModule from '../forms/forms.module'
import { FormsV2Module } from '../forms-v2/forms-v2.module'
import PrismaModule from '../prisma/prisma.module'
import RabbitmqClientModule from '../rabbitmq-client/rabbitmq-client.module'
import ScannerClientService from '../scanner-client/scanner-client.service'
import TaxModule from '../tax/tax.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import NasesController from './nases.controller'
import NasesService from './nases.service'
import FormRegistrationStatusRepository from './utils-services/form-registration-status.repository'
import NasesCronSubservice from './utils-services/nases.cron.subservice'
import NasesUtilsService from './utils-services/tokens.nases.service'

@Module({
  imports: [
    PrismaModule,
    FormsModule,
    RabbitmqClientModule,
    FilesModule,
    ConvertModule,
    TaxModule,
    ConvertPdfModule,
    FormValidatorRegistryModule,
    ClientsModule,
    UserInfoPipeModule,
    FormsV2Module,
    AuthV2Module,
  ],
  providers: [
    NasesService,
    NasesUtilsService,
    ThrowerErrorGuard,
    FormsHelper,
    ScannerClientService,
    MinioClientSubservice,
    LineLoggerSubservice,
    NasesCronSubservice,
    FormRegistrationStatusRepository,
  ],
  exports: [NasesService, NasesUtilsService, NasesCronSubservice],
  controllers: [NasesController],
})
export default class NasesModule {}
