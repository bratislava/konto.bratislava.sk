import { z } from 'zod'

import {
  baseNorisCommunalWasteTaxSchema,
  norisCommunalWasteTaxGroupedSchema,
  norisPaymentSchema,
  norisRawCommunalWasteTaxSchema,
  norisRealEstateTaxSchema,
} from './noris.schema'

// Type inference from schemas
export type BaseNorisCommunalWasteTaxDto = z.infer<
  typeof baseNorisCommunalWasteTaxSchema
>
/**
 * @remarks
 * ⚠️ **Warning:** This represents raw data from Noris where each record corresponds to a single container.
 * Multiple records with the same variable symbol belong to the same tax payer.
 * These records need to be grouped and transformed into NorisCommunalWasteTaxGroupedDto,
 * where containers are nested within a single tax payer record.
 */
export type NorisRawCommunalWasteTax = z.infer<
  typeof norisRawCommunalWasteTaxSchema
>
export type NorisCommunalWasteTaxGrouped = z.infer<
  typeof norisCommunalWasteTaxGroupedSchema
>

export type NorisRealEstateTax = z.infer<typeof norisRealEstateTaxSchema>
export type NorisPayment = z.infer<typeof norisPaymentSchema>
