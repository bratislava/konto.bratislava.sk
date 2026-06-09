import { Module } from '@nestjs/common'

import ApiJwtTokensModule from '../api-jwt-tokens/api-jwt-tokens.module'
import ClientsModule from '../clients/clients.module'
import BaConfigModule from '../config/ba-config.module'
import ConvertModule from '../convert/convert.module'
import TaxModule from '../tax/tax.module'
import NasesContactsService from './services/nases.contacts.service'
import NasesCronService from './services/nases.cron.service'
import NasesSenderService from './services/nases.sender.service'

@Module({
  imports: [
    ClientsModule,
    ApiJwtTokensModule,
    BaConfigModule,
    ConvertModule,
    TaxModule,
  ],
  providers: [NasesSenderService, NasesCronService, NasesContactsService],
  exports: [NasesSenderService, NasesCronService, NasesContactsService],
})
export default class NasesModule {}
