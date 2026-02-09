import { z } from 'zod'

import { CommunalWasteTaxDetailSchema } from '../../prisma/json-types'

// COMMON SCHEMAS
export const NorisBaseTaxWithoutPaymentSchema = z.object({
  cislo_poradace: z.number(),
  stav_dokladu: z.enum(['Z', 'S', 'P', 'O']),
  cislo_subjektu: z.number(),
  adresa_tp_sidlo: z.string().nullable(),
  cislo_konania: z.string().nullable(),
  datum_platnosti: z.date().nullable(),
  variabilny_symbol: z.string(), // If it is null, we should not process the tax. Currently all were non-null, thus we can expect it to be non-null, otherwise throw error when parsing.
  rok: z.number(),
  dan_spolu: z.string(),
  uhrazeno: z.coerce.number(),
  subjekt_refer: z.string().nullable(),
  subjekt_nazev: z.string().nullable(),
  akt_datum: z.string().nullable(),
  vyb_nazov: z.string(),
  TXTSPL1: z.string(),
  SPL1: z.string(),
  TXTSPL4_1: z.string(),
  SPL4_1: z.string(),
  TXTSPL4_2: z.string(),
  SPL4_2: z.string(),
  TXTSPL4_3: z.string(),
  SPL4_3: z.string(),
  TXTSPL4_4: z.string(),
  SPL4_4: z.string(),
  ICO_RC: z.string(),
  ulica_tb_cislo: z.string().nullable(),
  psc_ref_tb: z.string().nullable(),
  psc_naz_tb: z.string().nullable(),
  stat_nazov_plny: z.string().nullable(),
  obec_nazev_tb: z.string().nullable(),
  vyb_telefon_prace: z.string().nullable(),
  vyb_email: z.string().nullable(),
  vyb_id: z.number().nullable(),
})

export const NorisTaxPaymentSchema = z.object({
  variabilny_symbol: z.string(),
  uhrazeno: z.coerce.number(),
})

export const NorisBaseTaxSchema = NorisBaseTaxWithoutPaymentSchema.extend(
  NorisTaxPaymentSchema.shape,
)

// COMMUNAL WASTE SCHEMAS
export const NorisCommunalWasteTaxSchema = NorisBaseTaxSchema.extend({
  objem_nadoby: z.number(),
  pocet_nadob: z.number(),
  pocet_odvozov: z.number(),
  sadzba: z.number(),
  poplatok: z.number(),
  druh_nadoby: z.string(),
  ulica: z.string().nullable(),
  orientacne_cislo: z.string().nullable(),
})

// eslint-disable-next-line no-secrets/no-secrets
/**
 * NorisCommunalWasteTaxGroupedSchema is an extended schema based on
 * NorisBaseTaxSchema and incorporates the structure defined in
 * CommunalWasteTaxDetailSchema.
 *
 * This does not represent raw Noris data, but rather a structured
 * representation where all container details are grouped together by
 * variable symbol
 */
export const NorisCommunalWasteTaxGroupedSchema = NorisBaseTaxSchema.extend(
  CommunalWasteTaxDetailSchema.shape,
)

export const NorisRawRealEstateTaxDetailSchema = z.object({
  dan_byty: z.string(),
  dan_pozemky: z.string(),
  dan_stavby: z.string(),
  dan_stavby_viac: z.string(),
  dan_stavby_SPOLU: z.string(),
  det_zaklad_dane_byt: z.string(),
  det_zaklad_dane_nebyt: z.string(),
  det_dan_byty_byt: z.string(),
  det_dan_byty_nebyt: z.string(),
  det_pozemky_DAN_A: z.string(),
  det_pozemky_DAN_B: z.string(),
  det_pozemky_DAN_C: z.string(),
  det_pozemky_DAN_D: z.string(),
  det_pozemky_DAN_E: z.string(),
  det_pozemky_DAN_F: z.string(),
  det_pozemky_DAN_G: z.string(),
  det_pozemky_DAN_H: z.string(),
  det_pozemky_ZAKLAD_A: z.string(),
  det_pozemky_ZAKLAD_B: z.string(),
  det_pozemky_ZAKLAD_C: z.string(),
  det_pozemky_ZAKLAD_D: z.string(),
  det_pozemky_ZAKLAD_E: z.string(),
  det_pozemky_ZAKLAD_F: z.string(),
  det_pozemky_ZAKLAD_G: z.string(),
  det_pozemky_ZAKLAD_H: z.string(),
  det_pozemky_VYMERA_A: z.string(),
  det_pozemky_VYMERA_B: z.string(),
  det_pozemky_VYMERA_C: z.string(),
  det_pozemky_VYMERA_D: z.string(),
  det_pozemky_VYMERA_E: z.string(),
  det_pozemky_VYMERA_F: z.string(),
  det_pozemky_VYMERA_G: z.string(),
  det_pozemky_VYMERA_H: z.string(),
  det_stavba_DAN_A: z.string(),
  det_stavba_DAN_B: z.string(),
  det_stavba_DAN_C: z.string(),
  det_stavba_DAN_D: z.string(),
  det_stavba_DAN_E: z.string(),
  det_stavba_DAN_F: z.string(),
  det_stavba_DAN_G: z.string(),
  det_stavba_DAN_jH: z.string(),
  det_stavba_DAN_jI: z.string(),
  det_stavba_ZAKLAD_A: z.string(),
  det_stavba_ZAKLAD_B: z.string(),
  det_stavba_ZAKLAD_C: z.string(),
  det_stavba_ZAKLAD_D: z.string(),
  det_stavba_ZAKLAD_E: z.string(),
  det_stavba_ZAKLAD_F: z.string(),
  det_stavba_ZAKLAD_G: z.string(),
  det_stavba_ZAKLAD_jH: z.string(),
  det_stavba_ZAKLAD_jI: z.string(),
  det_stavba_DAN_H: z.string(),
  det_stavba_ZAKLAD_H: z.string(),
})

export const NorisRealEstateTaxSchema = NorisBaseTaxSchema.extend(
  NorisRawRealEstateTaxDetailSchema.shape,
)

export const NorisDeliveryMethodsUpdateResultSchema = z.object({
  cislo_subjektu: z.number(),
})

export const NorisOrganizationResultSchema = z.object({
  ico: z.string().trim(),
})
