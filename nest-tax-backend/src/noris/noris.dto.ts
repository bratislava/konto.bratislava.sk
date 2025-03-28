import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

import { DeliveryMethod } from './noris.types'

export class NorisTaxPayersDto {
  @IsString()
  adresa_tp_sidlo: string

  @IsString()
  sposob_dorucenia: string

  @IsNumber()
  cislo_poradace: number

  @IsNumber()
  cislo_subjektu: number

  @IsString()
  cislo_konania: string

  @IsString()
  variabilny_symbol: string

  @IsString()
  subjekt_refer: string

  @IsString()
  subjekt_nazev: string

  @IsNumber()
  rok: number

  @IsString()
  ulica_tb: string

  @IsString()
  ulica_tb_cislo: string

  @IsString()
  psc_ref_tb: string

  @IsString()
  psc_naz_tb: string

  @IsString()
  stat_nazov_plny: string

  @IsString()
  obec_nazev_tb: string

  @IsString()
  akt_datum: string

  @IsString()
  vyb_nazov: string

  @IsString()
  vyb_telefon_prace: string

  @IsString()
  vyb_email: string

  @IsNumber()
  vyb_id: number

  @IsString()
  dan_spolu: string

  @IsString()
  dan_byty: string

  @IsString()
  dan_pozemky: string

  @IsString()
  dan_stavby: string

  @IsString()
  dan_stavby_viac: string

  @IsString()
  dan_stavby_SPOLU: string

  @IsString()
  det_zaklad_dane_byt: string

  @IsString()
  det_zaklad_dane_nebyt: string

  @IsString()
  det_dan_byty_byt: string

  @IsString()
  det_dan_byty_nebyt: string

  @IsString()
  det_pozemky_DAN_A: string

  @IsString()
  det_pozemky_DAN_B: string

  @IsString()
  det_pozemky_DAN_C: string

  @IsString()
  det_pozemky_DAN_D: string

  @IsString()
  det_pozemky_DAN_E: string

  @IsString()
  det_pozemky_DAN_F: string

  @IsString()
  det_pozemky_DAN_G: string

  @IsString()
  det_pozemky_DAN_H: string

  @IsString()
  det_pozemky_ZAKLAD_A: string

  @IsString()
  det_pozemky_ZAKLAD_B: string

  @IsString()
  det_pozemky_ZAKLAD_C: string

  @IsString()
  det_pozemky_ZAKLAD_D: string

  @IsString()
  det_pozemky_ZAKLAD_E: string

  @IsString()
  det_pozemky_ZAKLAD_F: string

  @IsString()
  det_pozemky_ZAKLAD_G: string

  @IsString()
  det_pozemky_ZAKLAD_H: string

  @IsString()
  det_pozemky_VYMERA_A: string

  @IsString()
  det_pozemky_VYMERA_B: string

  @IsString()
  det_pozemky_VYMERA_C: string

  @IsString()
  det_pozemky_VYMERA_D: string

  @IsString()
  det_pozemky_VYMERA_E: string

  @IsString()
  det_pozemky_VYMERA_F: string

  @IsString()
  det_pozemky_VYMERA_G: string

  @IsString()
  det_pozemky_VYMERA_H: string

  @IsString()
  det_stavba_DAN_A: string

  @IsString()
  det_stavba_DAN_B: string

  @IsString()
  det_stavba_DAN_C: string

  @IsString()
  det_stavba_DAN_D: string

  @IsString()
  det_stavba_DAN_E: string

  @IsString()
  det_stavba_DAN_F: string

  @IsString()
  det_stavba_DAN_G: string

  @IsString()
  det_stavba_DAN_jH: string

  @IsString()
  det_stavba_DAN_jI: string

  @IsString()
  det_stavba_ZAKLAD_A: string

  @IsString()
  det_stavba_ZAKLAD_B: string

  @IsString()
  det_stavba_ZAKLAD_C: string

  @IsString()
  det_stavba_ZAKLAD_D: string

  @IsString()
  det_stavba_ZAKLAD_E: string

  @IsString()
  det_stavba_ZAKLAD_F: string

  @IsString()
  det_stavba_ZAKLAD_G: string

  @IsString()
  det_stavba_ZAKLAD_jH: string

  @IsString()
  det_stavba_ZAKLAD_jI: string

  @IsString()
  det_stavba_DAN_H: string

  @IsString()
  det_stavba_ZAKLAD_H: string

  @IsString()
  TXT_MENO: string

  @IsString()
  TXT_UL: string

  @IsString()
  TYP_USER: string

  @IsString()
  ICO_RC: string

  @IsString()
  TXTSPL1: string

  @IsString()
  SPL1: string

  @IsString()
  TXTSPL4_1: string

  @IsString()
  SPL4_1: string

  @IsString()
  TXTSPL4_2: string

  @IsString()
  SPL4_2: string

  @IsString()
  TXTSPL4_3: string

  @IsString()
  SPL4_3: string

  @IsString()
  TXTSPL4_4: string

  @IsString()
  SPL4_4: string

  @IsString()
  obalka_ulica: string

  @IsString()
  obalka_psc: string

  @IsString()
  obalka_mesto: string

  @IsString()
  obalka_stat: string

  @IsString()
  pouk_cena_bez_hal: string

  @IsString()
  pouk_cena_hal: string

  @IsString()
  specificky_symbol: string

  @IsString()
  uzivatelsky_atribut: string

  @IsString()
  uhrazeno: string

  @IsString()
  zbyva_uhradit: string

  @IsOptional()
  @IsEnum(DeliveryMethod)
  delivery_method: DeliveryMethod | null
}

export interface NorisPaymentsDto {
  variabilny_symbol: string
  uhrazeno: string
  zbyva_uhradit: string
  specificky_symbol: string
}
