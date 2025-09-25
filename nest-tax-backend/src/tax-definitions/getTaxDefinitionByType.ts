import { TaxType } from '@prisma/client'

import { taxDefinitions } from './taxDefinitions'
import { TaxDefinition } from './taxDefinitionsTypes'

export const getTaxDefinitionByType = (type: TaxType): TaxDefinition | null => {
  const taxDefinition = taxDefinitions.find((def) => def.type === type)
  return taxDefinition ?? null
}
