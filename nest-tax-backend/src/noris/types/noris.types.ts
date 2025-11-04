import { z } from 'zod'

import {
  BaseNorisCommunalWasteTaxSchema,
  NorisCommunalWasteTaxGroupedSchema,
  NorisPaymentSchema,
  NorisRawCommunalWasteTaxSchema,
  NorisRealEstateTaxSchema,
} from './noris.schema'

// Type inference from schemas
export type BaseNorisCommunalWasteTaxDto = z.infer<
  typeof BaseNorisCommunalWasteTaxSchema
>
/**
 * @remarks
 * ⚠️ **Warning:** This represents raw data from Noris where each record corresponds to a single container.
 * Multiple records with the same variable symbol belong to the same tax payer.
 * These records need to be grouped and transformed into NorisCommunalWasteTaxGroupedDto,
 * where containers are nested within a single tax payer record.
 */
export type NorisRawCommunalWasteTax = z.infer<
  typeof NorisRawCommunalWasteTaxSchema
>
export type NorisCommunalWasteTaxGrouped = z.infer<
  typeof NorisCommunalWasteTaxGroupedSchema
>

export type NorisRealEstateTax = z.infer<typeof NorisRealEstateTaxSchema>
export type NorisPayment = z.infer<typeof NorisPaymentSchema>
export type NorisPaymentWithVariableSymbol = NorisPayment & {
  variabilny_symbol: string
}
