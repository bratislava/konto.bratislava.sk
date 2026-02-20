import { TaxType } from '@prisma/client'

import { taxDefinitions } from './taxDefinitions.js'
import { TaxDefinition } from './taxDefinitionsTypes.js'

export const getTaxDefinitionByType = <TTaxType extends TaxType>(
  taxType: TTaxType,
): TaxDefinition<TTaxType> => {
  return taxDefinitions[taxType]
}
