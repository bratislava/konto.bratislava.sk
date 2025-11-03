import z from 'zod'

import {
  baseNorisCommunalWasteTaxSchema,
  norisCommunalWasteTaxGroupedSchema,
  norisRawCommunalWasteTaxSchema,
} from './noris.schema'

export interface NorisTaxPayersDto {
  adresa_tp_sidlo: string
  sposob_dorucenia: string
  cislo_poradace: number
  cislo_subjektu: number
  cislo_konania: string
  variabilny_symbol: string
  subjekt_refer: string
  subjekt_nazev: string
  rok: number
  ulica_tb_cislo: string
  psc_ref_tb: string
  psc_naz_tb: string
  stat_nazov_plny: string
  obec_nazev_tb: string
  akt_datum: string
  datum_platnosti: string | null
  vyb_nazov: string
  vyb_telefon_prace: string
  vyb_email: string
  vyb_id: number
  dan_spolu: string
  dan_byty: string
  dan_pozemky: string
  dan_stavby: string
  dan_stavby_viac: string
  dan_stavby_SPOLU: string
  det_zaklad_dane_byt: string
  det_zaklad_dane_nebyt: string
  det_dan_byty_byt: string
  det_dan_byty_nebyt: string
  det_pozemky_DAN_A: string
  det_pozemky_DAN_B: string
  det_pozemky_DAN_C: string
  det_pozemky_DAN_D: string
  det_pozemky_DAN_E: string
  det_pozemky_DAN_F: string
  det_pozemky_DAN_G: string
  det_pozemky_DAN_H: string
  det_pozemky_ZAKLAD_A: string
  det_pozemky_ZAKLAD_B: string
  det_pozemky_ZAKLAD_C: string
  det_pozemky_ZAKLAD_D: string
  det_pozemky_ZAKLAD_E: string
  det_pozemky_ZAKLAD_F: string
  det_pozemky_ZAKLAD_G: string
  det_pozemky_ZAKLAD_H: string
  det_pozemky_VYMERA_A: string
  det_pozemky_VYMERA_B: string
  det_pozemky_VYMERA_C: string
  det_pozemky_VYMERA_D: string
  det_pozemky_VYMERA_E: string
  det_pozemky_VYMERA_F: string
  det_pozemky_VYMERA_G: string
  det_pozemky_VYMERA_H: string
  det_stavba_DAN_A: string
  det_stavba_DAN_B: string
  det_stavba_DAN_C: string
  det_stavba_DAN_D: string
  det_stavba_DAN_E: string
  det_stavba_DAN_F: string
  det_stavba_DAN_G: string
  det_stavba_DAN_jH: string
  det_stavba_DAN_jI: string
  det_stavba_ZAKLAD_A: string
  det_stavba_ZAKLAD_B: string
  det_stavba_ZAKLAD_C: string
  det_stavba_ZAKLAD_D: string
  det_stavba_ZAKLAD_E: string
  det_stavba_ZAKLAD_F: string
  det_stavba_ZAKLAD_G: string
  det_stavba_ZAKLAD_jH: string
  det_stavba_ZAKLAD_jI: string
  det_stavba_DAN_H: string
  det_stavba_ZAKLAD_H: string
  TXT_MENO: string
  TXT_UL: string
  TYP_USER: string
  ICO_RC: string
  TXTSPL1: string
  SPL1: string
  TXTSPL4_1: string
  SPL4_1: string
  TXTSPL4_2: string
  SPL4_2: string
  TXTSPL4_3: string
  SPL4_3: string
  TXTSPL4_4: string
  SPL4_4: string
  specificky_symbol: string
  uhrazeno: string
}

export interface NorisPaymentsDto {
  variabilny_symbol: string
  uhrazeno: string
  specificky_symbol: string
}

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
export type NorisRawCommunalWasteTaxDto = z.infer<
  typeof norisRawCommunalWasteTaxSchema
>
export type NorisCommunalWasteTaxGroupedDto = z.infer<
  typeof norisCommunalWasteTaxGroupedSchema
>
