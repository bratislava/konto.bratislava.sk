
import { TaxType } from '@prisma/client'

import { taxDefinitions } from './taxDefinitions'
import { TaxDefinition } from './taxDefinitionsTypes'

/**
 * Retrieves the tax definition for a specific tax type.
 * This function ensures type safety by returning the correctly typed definition.
 *
 * @param taxType - The type of tax (e.g., DZN, KO)
 * @returns The tax definition for the specified type
 */
export const getTaxDefinitionByType = <TTaxType extends TaxType>(
  taxType: TTaxType,
): TaxDefinition<TTaxType> => {
  return taxDefinitions[taxType]
}