import { Module } from '@nestjs/common'

import ApiJwtTokensModule from '../api-jwt-tokens/api-jwt-tokens.module'
import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import ClientsModule from '../clients/clients.module'
import ConvertModule from '../convert/convert.module'
import NasesModule from '../nases/nases.module'
import TaxModule from '../tax/tax.module'
import AdminController from './admin.controller'
import AdminService from './admin.service'

@Module({
  imports: [
    ApiJwtTokensModule,
    ConvertModule,
    TaxModule,
    ClientsModule,
    UserInfoPipeModule,
    NasesModule,
  ],
  providers: [AdminService],
  exports: [],
  controllers: [AdminController],
})
export default class AdminModule {}
