import { z } from 'zod'

export const baseNorisCommunalWasteTaxSchema = z.object({
  cislo_poradace: z.number(),
  cislo_subjektu: z.number(),
  adresa_tp_sidlo: z.string(),
  cislo_konania: z.string(),
  datum_platnosti: z.string().nullable(),
  variabilny_symbol: z.string(),
  specificky_symbol: z.string(),
  rok: z.number(),
  dan_spolu: z.string(),
  uhrazeno: z.string(),
  zbyva_uhradit: z.string(),
  subjekt_refer: z.string(),
  subjekt_nazev: z.string(),
  akt_datum: z.string(),
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
  TXT_MENO: z.string(),
  TXT_UL: z.string(),
  TYP_USER: z.string(),
  ICO_RC: z.string(),
  ulica_tb_cislo: z.string(),
  psc_ref_tb: z.string(),
  psc_naz_tb: z.string(),
  stat_nazov_plny: z.string(),
  obec_nazev_tb: z.string(),
  vyb_telefon_prace: z.string(),
  vyb_email: z.string(),
  vyb_id: z.number(),
})

export const norisCommunalWasteTaxSchema =
  baseNorisCommunalWasteTaxSchema.extend({
    objem_nadoby: z.string(),
    pocet_nadob: z.string(),
    pocet_odvozov: z.string(),
    sadzba: z.string(),
    poplatok: z.string(),
    druh_nadoby: z.string(),
    ulica: z.string(),
    orientacne_cislo: z.string(),
  })

export const norisCommunalWasteTaxProcessedSchema =
  baseNorisCommunalWasteTaxSchema.extend({
    containers: z.array(
      z.object({
        address: z.object({
          street: z.string(),
          orientationNumber: z.string(),
        }),
        details: z.object({
          objem_nadoby: z.string(),
          pocet_nadob: z.string(),
          pocet_odvozov: z.string(),
          sadzba: z.string(),
          poplatok: z.string(),
          druh_nadoby: z.string(),
        }),
      }),
    ),
  })
