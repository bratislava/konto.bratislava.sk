import { Module } from '@nestjs/common'

import { NorisService } from './noris.service'
import { NorisValidatorSubservice } from './subservices/noris-validator.subservice'

@Module({
  providers: [NorisService, NorisValidatorSubservice],
  exports: [NorisService],
})
export class NorisModule {}
