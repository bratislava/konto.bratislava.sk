import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { TaxType } from '@prisma/client'

import { mapNorisToRealEstateDatabaseDetail } from '../noris/utils/mapping.helper'
import { generateItemizedRealEstateTaxDetail } from '../tax/utils/helpers/tax.helper'
// eslint-disable-next-line import/no-cycle
import { UnifiedTaxUtilSubservice } from '../tax/utils/unified-tax.util.subservice'
import { TaxDefinition, TaxDefinitionsMap } from './taxDefinitionsTypes'

@Injectable()
export class TaxDefinitionsService {
  private readonly definitions: TaxDefinitionsMap

  constructor(
    @Inject(forwardRef(() => UnifiedTaxUtilSubservice))
    private readonly unifiedTaxUtil: UnifiedTaxUtilSubservice,
  ) {
    // Initialize definitions using injected services
    this.definitions = {
      [TaxType.DZN]: {
        type: TaxType.DZN,
        isUnique: true,
        numberOfInstallments: 3,
        paymentCalendarThreshold: 6600,
        mapNorisToTaxDetailData: mapNorisToRealEstateDatabaseDetail,
        getTaxDetailPure: this.unifiedTaxUtil.getRealEstateTaxDetailPure.bind(
          this.unifiedTaxUtil,
        ),
        generateItemizedTaxDetail: generateItemizedRealEstateTaxDetail,
      },
      [TaxType.KO]: {
        type: TaxType.KO,
        isUnique: false,
        numberOfInstallments: 4,
        paymentCalendarThreshold: 0,
        mapNorisToTaxDetailData: () => {
          throw new Error('Not implemented')
        },
        getTaxDetailPure: () => {
          throw new Error('Not implemented')
        },
        generateItemizedTaxDetail: () => {
          throw new Error('Not implemented')
        },
      },
    }
  }

  getTaxDefinitionByType<TTaxType extends TaxType>(
    taxType: TTaxType,
  ): TaxDefinition<TTaxType> {
    return this.definitions[taxType]
  }

  getAllDefinitions(): TaxDefinitionsMap {
    return this.definitions
  }
}
