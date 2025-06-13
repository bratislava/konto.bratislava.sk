import { Module } from '@nestjs/common'

import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import TaxService from './tax.service'

@Module({
  providers: [TaxService, ThrowerErrorGuard],
  exports: [TaxService],
})
export default class TaxModule {}
