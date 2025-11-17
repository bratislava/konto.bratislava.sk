import { forwardRef, Module } from '@nestjs/common'

// eslint-disable-next-line import/no-cycle
import { TaxModule } from '../tax/tax.module'
import { TaxDefinitionsService } from './taxDefinitions'

@Module({
  imports: [forwardRef(() => TaxModule)],
  providers: [TaxDefinitionsService],
  exports: [TaxDefinitionsService],
})
export class TaxDefinitionsModule {}
