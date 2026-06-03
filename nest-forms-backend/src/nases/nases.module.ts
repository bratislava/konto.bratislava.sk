import { Module } from '@nestjs/common'

import ApiJwtTokensModule from '../api-jwt-tokens/api-jwt-tokens.module'
import ClientsModule from '../clients/clients.module'
import BaConfigModule from '../config/ba-config.module'
import ConvertModule from '../convert/convert.module'
import PrismaModule from '../prisma/prisma.module'
import TaxModule from '../tax/tax.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import NasesContactsService from './services/nases.contacts.service'
import NasesSenderService from './services/nases.sender.service'
import FormRegistrationStatusRepository from './utils-services/form-registration-status.repository'
import NasesCronSubservice from './utils-services/nases.cron.subservice'

@Module({
  imports: [
    ClientsModule,
    ApiJwtTokensModule,
    BaConfigModule,
    ConvertModule,
    PrismaModule,
    TaxModule,
  ],
  providers: [
    FormRegistrationStatusRepository,
    MinioClientSubservice,
    NasesSenderService,
    ThrowerErrorGuard,
    NasesCronSubservice,
    NasesContactsService,
  ],
  exports: [NasesSenderService, NasesCronSubservice, NasesContactsService],
})
export default class NasesModule {}
