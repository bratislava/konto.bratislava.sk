import { Module } from '@nestjs/common'

import UserInfoPipeModule from '../auth/decorators/user-info-pipe.module'
import { AuthV2Module } from '../auth-v2/auth-v2.module'
import FilesModule from '../files/files.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsModule from '../forms/forms.module'
import { FormsV2Module } from '../forms-v2/forms-v2.module'
import ScannerClientModule from '../scanner-client/scanner-client.module'
import TaxModule from '../tax/tax.module'
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
  providers: [ConvertService],
  exports: [ConvertService],
})
export default class ConvertModule {}
