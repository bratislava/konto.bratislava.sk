import { TaxType } from '@prisma/client'
import { z } from 'zod'

export enum RealEstateTaxPropertyType {
  APARTMENT = 'APARTMENT',
  CONSTRUCTION = 'CONSTRUCTION',
  GROUND = 'GROUND',
}

export enum RealEstateTaxAreaType {
  NONRESIDENTIAL = 'NONRESIDENTIAL',
  RESIDENTIAL = 'RESIDENTIAL',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  jH = 'jH',
  jI = 'jI',
  byt = 'byt',
  nebyt = 'nebyt',
}

export const RealEstateTaxDetailSchema = z.object({
  type: z.literal(TaxType.DZN),
  taxLand: z.number().int(),
  taxConstructions: z.number().int(),
  taxFlat: z.number().int(),
  propertyDetails: z.array(
    z.object({
      type: z.enum(RealEstateTaxPropertyType),
      areaType: z.enum(RealEstateTaxAreaType),
      area: z.optional(z.string()),
      base: z.number().int(),
      amount: z.number().int(),
    }),
  ),
})

// TODO test if real data matches this data, as well as tax mocks (enum/int..?)
export const CommunalWasteTaxDetailSchema = z.object({
  type: z.literal(TaxType.KO),
  addresses: z.array(
    z.object({
      addressDetail: z.object({
        street: z.string().nullable(),
        orientationNumber: z.string().nullable(),
      }),
      containers: z.array(
        z.object({
          objem_nadoby: z.number(),
          pocet_nadob: z.number(),
          pocet_odvozov: z.number(),
          sadzba: z.number(),
          poplatok: z.number(),
          druh_nadoby: z.string(),
        }),
      ),
    }),
  ),
})

export type CommunalWasteTaxDetail = z.infer<
  typeof CommunalWasteTaxDetailSchema
>

export type RealEstateTaxDetail = z.infer<typeof RealEstateTaxDetailSchema>
export type TaxDetail = RealEstateTaxDetail | CommunalWasteTaxDetail

declare global {
  namespace PrismaJson {
    type TaxDetailType = TaxDetail
  }
}

export {}
