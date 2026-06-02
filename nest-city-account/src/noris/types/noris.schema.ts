import { z } from 'zod'

export const NorisDeliveryMethodsUpdateResultSchema = z.object({
  cislo_subjektu: z.number(),
})

export const NorisOrganizationResultSchema = z.object({
  ico: z.string().trim(),
})
