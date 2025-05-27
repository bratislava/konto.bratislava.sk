import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import ClientsModule from '../clients/clients.module'
import ConvertModule from '../convert/convert.module'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import PrismaModule from '../prisma/prisma.module'
import TaxModule from '../tax/tax.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import AdminController from './admin.controller'

@Module({
  imports: [
    PrismaModule,
    ConvertModule,
    TaxModule,
    ClientsModule,
    UserInfoPipeModule,
  ],
  providers: [ThrowerErrorGuard, NasesUtilsService, MinioClientSubservice],
  exports: [],
  controllers: [AdminController],
})
export default class AdminModule {}
