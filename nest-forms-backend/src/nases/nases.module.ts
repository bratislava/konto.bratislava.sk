import { Module } from '@nestjs/common'

import ApiJwtTokensModule from '../api-jwt-tokens/api-jwt-tokens.module'
import ClientsModule from '../clients/clients.module'
import BaConfigModule from '../config/ba-config.module'
import ConvertModule from '../convert/convert.module'
import { MinioStorageService } from '../minio-storage/minio-storage.service'
import PrismaModule from '../prisma/prisma.module'
import TaxModule from '../tax/tax.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import FormRegistrationStatusRepository from './repositories/form-registration-status.repository'
import NasesContactsService from './services/nases.contacts.service'
import NasesCronService from './services/nases.cron.service'
import NasesSenderService from './services/nases.sender.service'

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
    MinioStorageService,
    NasesSenderService,
    ThrowerErrorGuard,
    NasesCronService,
    NasesContactsService,
  ],
  exports: [NasesSenderService, NasesCronService, NasesContactsService],
})
export default class NasesModule {}
