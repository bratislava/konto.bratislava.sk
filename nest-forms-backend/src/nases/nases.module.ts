import { Module } from '@nestjs/common'

import ConvertModule from '../convert/convert.module'
import ConvertPdfModule from '../convert-pdf/convert-pdf.module'
import FilesHelper from '../files/files.helper'
import FilesModule from '../files/files.module'
import FilesService from '../files/files.service'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsHelper from '../forms/forms.helper'
import FormsModule from '../forms/forms.module'
import NasesConsumerModule from '../nases-consumer/nases-consumer.module'
import PrismaModule from '../prisma/prisma.module'
import RabbitmqClientModule from '../rabbitmq-client/rabbitmq-client.module'
import ScannerClientService from '../scanner-client/scanner-client.service'
import TaxModule from '../tax/tax.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import NasesController from './nases.controller'
import NasesService from './nases.service'
import NasesUtilsService from './utils-services/tokens.nases.service'

@Module({
  imports: [
    PrismaModule,
    FormsModule,
    RabbitmqClientModule,
    FilesModule,
    NasesConsumerModule,
    ConvertModule,
    TaxModule,
    ConvertPdfModule,
    FormValidatorRegistryModule,
  ],
  providers: [
    NasesService,
    NasesUtilsService,
    ThrowerErrorGuard,
    FormsHelper,
    FilesService,
    FilesHelper,
    ScannerClientService,
    MinioClientSubservice,
  ],
  exports: [NasesService, NasesUtilsService],
  controllers: [NasesController],
})
export default class NasesModule {}
