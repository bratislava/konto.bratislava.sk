import { Module } from '@nestjs/common'

import ApiJwtTokensModule from '../api-jwt-tokens/api-jwt-tokens.module'
import { AuthV2Module } from '../auth-v2/auth-v2.module'
import BaConfigModule from '../config/ba-config.module'
import ConvertPdfModule from '../convert-pdf/convert-pdf.module'
import FilesModule from '../files/files.module'
import FormValidatorRegistryModule from '../form-validator-registry/form-validator-registry.module'
import FormsModule from '../forms/forms.module'
import { FormsV2Module } from '../forms-v2/forms-v2.module'
import NasesModule from '../nases/nases.module'
import FormRegistrationStatusRepository from '../nases/repositories/form-registration-status.repository'
import PrismaModule from '../prisma/prisma.module'
import RabbitmqClientModule from '../rabbitmq-client/rabbitmq-client.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import FormSenderController from './form-sender.controller'
import { FormSenderService } from './form-sender.service'

@Module({
  imports: [
    NasesModule,
    FormsModule,
    FormsV2Module,
    AuthV2Module,
    ApiJwtTokensModule,
    BaConfigModule,
    FilesModule,
    ConvertPdfModule,
    FormValidatorRegistryModule,
    RabbitmqClientModule,
    PrismaModule,
  ],
  providers: [
    ThrowerErrorGuard,
    LineLoggerSubservice,
    FormRegistrationStatusRepository,
    FormSenderService,
  ],
  controllers: [FormSenderController],
})
export default class FormSenderModule {}
