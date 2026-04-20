import { TaxType } from '@prisma/client'

/** Cycle order follows Prisma schema enum declaration order. */
const taxTypes = Object.values(TaxType)

/**
 * For given tax type, return the next tax type in the array.
 * @param taxType - The current tax type.
 * @returns The next tax type in the array.
 */
export const getNextTaxType = (taxType: (typeof taxTypes)[number]) => {
  const index = taxTypes.indexOf(taxType)
  return taxTypes[(index + 1) % taxTypes.length]
}
