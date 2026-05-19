import { Module } from '@nestjs/common'

import FormsModule from '../forms/forms.module'
import NasesModule from '../nases/nases.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import FormSenderController from './form-sender.controller'

@Module({
  imports: [NasesModule, FormsModule],
  providers: [ThrowerErrorGuard, LineLoggerSubservice],
  controllers: [FormSenderController],
})
export default class FormSenderModule {}
