import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import ClientsModule from '../clients/clients.module'
import ConvertModule from '../convert/convert.module'
import NasesModule from '../nases/nases.module'
import NasesSenderService from '../nases/services/nases.sender.service'
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
    NasesModule,
  ],
  providers: [ThrowerErrorGuard, NasesSenderService, MinioClientSubservice],
  exports: [],
  controllers: [AdminController],
})
export default class AdminModule {}
