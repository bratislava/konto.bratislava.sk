import { Module } from '@nestjs/common'

import { AuthV2Module } from '../auth-v2/auth-v2.module'
import FormsModule from '../forms/forms.module'
import { FormsV2Module } from '../forms-v2/forms-v2.module'
import NasesModule from '../nases/nases.module'
import FormRegistrationStatusRepository from '../nases/utils-services/form-registration-status.repository'
import PrismaModule from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import FormSenderController from './form-sender.controller'

@Module({
  imports: [NasesModule, FormsModule, FormsV2Module, AuthV2Module, PrismaModule],
  providers: [ThrowerErrorGuard, LineLoggerSubservice, FormRegistrationStatusRepository],
  controllers: [FormSenderController],
})
export default class FormSenderModule {}
