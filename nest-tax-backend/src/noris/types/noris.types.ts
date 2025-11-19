import { z } from 'zod'

import {
  NorisBaseTaxSchema,
  NorisCommunalWasteTaxGroupedSchema,
  NorisCommunalWasteTaxSchema,
  NorisDeliveryMethodsUpdateResultSchema,
  NorisRealEstateTaxSchema,
  NorisTaxPaymentSchema,
} from './noris.schema'

// Type inference from schemas
export type NorisBaseTax = z.infer<typeof NorisBaseTaxSchema>

/**
 * @remarks
 * ⚠️ **Warning:** This represents raw data from Noris where each record corresponds to a single container.
 * Multiple records with the same variable symbol belong to the same tax payer.
 * These records need to be grouped and transformed into NorisCommunalWasteTaxGroupedDto,
 * where containers are nested within a single tax payer record.
 */
export type NorisCommunalWasteTax = z.infer<typeof NorisCommunalWasteTaxSchema>

export type NorisCommunalWasteTaxGrouped = z.infer<
  typeof NorisCommunalWasteTaxGroupedSchema
>

export type NorisRealEstateTax = z.infer<typeof NorisRealEstateTaxSchema>
export type NorisTaxPayment = z.infer<typeof NorisTaxPaymentSchema>

export type NorisDeliveryMethodsUpdateResult = z.infer<
  typeof NorisDeliveryMethodsUpdateResultSchema
>
