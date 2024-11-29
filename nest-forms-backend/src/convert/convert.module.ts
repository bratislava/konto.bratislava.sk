import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import FilesModule from '../files/files.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsHelper from '../forms/forms.helper'
import FormsModule from '../forms/forms.module'
import FormsService from '../forms/forms.service'
import PrismaService from '../prisma/prisma.service'
import ScannerClientModule from '../scanner-client/scanner-client.module'
import TaxModule from '../tax/tax.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import ConvertController from './convert.controller'
import ConvertService from './convert.service'

@Module({
  controllers: [ConvertController],
  imports: [
    FormsModule,
    ScannerClientModule,
    FilesModule,
    TaxModule,
    FormValidatorRegistryModule,
  ],
  providers: [
    ConvertService,
    ThrowerErrorGuard,
    PrismaService,
    FormsService,
    FormsHelper,
    ConfigService,
    MinioClientSubservice,
  ],
  exports: [ConvertService],
})
export default class ConvertModule {}
