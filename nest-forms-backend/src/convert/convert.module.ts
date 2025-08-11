import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import { AuthV2Module } from '../auth-v2/auth-v2.module'
import FilesModule from '../files/files.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsHelper from '../forms/forms.helper'
import FormsModule from '../forms/forms.module'
import FormsService from '../forms/forms.service'
import { FormsV2Module } from '../forms-v2/forms-v2.module'
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
    UserInfoPipeModule,
    FormsV2Module,
    AuthV2Module,
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
