import { TaxType } from '@prisma/client'

import { taxDefinitions } from './taxDefinitions'
import { TaxDefinition } from './taxDefinitionsTypes'

export const getTaxDefinitionByType = <TTaxType extends TaxType>(
  taxType: TTaxType,
): TaxDefinition<TTaxType> => {
  return taxDefinitions[taxType]
}
