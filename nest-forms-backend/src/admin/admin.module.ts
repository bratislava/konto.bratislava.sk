import { Module } from '@nestjs/common'

import ApiJwtTokensModule from '../api-jwt-tokens/api-jwt-tokens.module'
import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import ClientsModule from '../clients/clients.module'
import ConvertModule from '../convert/convert.module'
import { MinioStorageService } from '../minio-storage/minio-storage.service'
import NasesModule from '../nases/nases.module'
import PrismaModule from '../prisma/prisma.module'
import TaxModule from '../tax/tax.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import AdminController from './admin.controller'
import AdminService from './admin.service'

@Module({
  imports: [
    ApiJwtTokensModule,
    PrismaModule,
    ConvertModule,
    TaxModule,
    ClientsModule,
    UserInfoPipeModule,
    NasesModule,
  ],
  providers: [AdminService, ThrowerErrorGuard, MinioStorageService],
  exports: [],
  controllers: [AdminController],
})
export default class AdminModule {}
