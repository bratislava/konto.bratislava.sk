import { TaxType } from '../../prisma/generated/prisma/enums'
import { taxDefinitions } from './taxDefinitions'
import { TaxDefinition } from './taxDefinitionsTypes'

export const getTaxDefinitionByType = <TTaxType extends TaxType>(
  taxType: TTaxType,
): TaxDefinition<TTaxType> => {
  return taxDefinitions[taxType]
}
