import { TaxType } from '@prisma/client'

import { taxDefinitions } from './taxDefinitions'
import { TaxDefinition } from './taxDefinitionsTypes'

export const getTaxDefinitionByType = (type: TaxType): TaxDefinition => {
  return taxDefinitions[type]
}
