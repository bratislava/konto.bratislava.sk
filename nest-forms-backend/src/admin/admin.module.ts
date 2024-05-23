import { Module } from '@nestjs/common'

import ConvertModule from '../convert/convert.module'
import JsonXmlConvertService from '../convert/utils-services/json-xml.convert.service'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import PrismaModule from '../prisma/prisma.module'
import SchemasModule from '../schemas/schemas.module'
import TaxModule from '../tax/tax.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import AdminController from './admin.controller'
import AdminService from './admin.service'

@Module({
  imports: [PrismaModule, SchemasModule, ConvertModule, TaxModule],
  providers: [
    AdminService,
    ThrowerErrorGuard,
    NasesUtilsService,
    JsonXmlConvertService,
    MinioClientSubservice,
  ],
  exports: [],
  controllers: [AdminController],
})
export default class AdminModule {}
