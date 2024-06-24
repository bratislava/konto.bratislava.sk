import { Module } from '@nestjs/common'

import ConvertModule from '../convert/convert.module'
import JsonXmlConvertService from '../convert/utils-services/json-xml.convert.service'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import PrismaModule from '../prisma/prisma.module'
import TaxModule from '../tax/tax.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import AdminController from './admin.controller'

@Module({
  imports: [PrismaModule, ConvertModule, TaxModule],
  providers: [
    ThrowerErrorGuard,
    NasesUtilsService,
    JsonXmlConvertService,
    MinioClientSubservice,
  ],
  exports: [],
  controllers: [AdminController],
})
export default class AdminModule {}
