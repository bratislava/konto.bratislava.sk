import { NorisRawRealEstateTaxDetailSchema } from '../../../src/noris/types/noris.schema'

export type NorisRealEstateTaxDetailColumn<Name extends string> =
  Name extends `det_stavba_${infer Part}_j${infer Letter}`
    ? `det_stavba_j_${Part}_${Letter}`
    : Name

export interface NorisTableRows {
  dane21_doklad: {
    cislo_subjektu: number
    stav_dokladu?: string | null
    datum_platnosti?: Date | null
    variabilny_symbol?: string | null
    datum_realizacie?: Date | null
    suma_mena?: number | null
    suma_spl1?: number | null
    suma_spl2?: number | null
    suma_spl3?: number | null
    suma_spl4?: number | null
    datum_spl1?: Date | null
    datum_spl2?: Date | null
    datum_spl3?: Date | null
    datum_spl4?: Date | null
    subjekt?: number | null
    podklad?: number | null
    pohladavka?: number | null
    druh_dokladu?: number | null
    rok_podkladu: number
  }
  dane21_druh_dokladu: {
    cislo_subjektu: number
    generovat_pohladavku?: string | null
    typ_dokladu?: string | null
    typ_dane?: string | null
  }
  dane21_doklad_sum_saldo: {
    cislo_subjektu: number
    uhrazeno?: number | null
    zbyva_uhradit?: number | null
    datum_posledni_platby?: Date | null
  }
  dane21_priznanie: {
    cislo_subjektu: number
    podnikatel?: string | null
    titul?: string | null
    meno?: string | null
    priezvisko?: string | null
    titul_za?: string | null
    rok?: number | null
    forma_uhrady?: string | null
    rodne_cislo?: string | null
  }
  dane21_priznanie_config: {
    cislo_poradace: number
    vybavuje?: number | null
  }
  dane_21_sum_dan_prizn_detail: {
    cs_dan_prizn: number
    dan_spolu?: number | null
  } & Partial<
    Record<
      NorisRealEstateTaxDetailColumn<
        keyof typeof NorisRawRealEstateTaxDetailSchema.shape
      >,
      number
    >
  >
  dane_21_sum_pko_popl_celkom: {
    cs_dan_prizn: number
    dan_spolu_nezaokr?: number | null
  }
  dane_21_adresa_view: {
    cislo_subjektu: number
    ulica_nazev?: string | null
    psc_refer?: string | null
    obec_nazev?: string | null
  }
  pko21_poplatok: {
    cislo_subjektu: number
    podnikatel?: string | null
    rok?: number | null
    titul?: string | null
    meno?: string | null
    priezvisko?: string | null
    titul_za?: string | null
    forma_uhrady?: string | null
    rodne_cislo?: string | null
  }
  pko21_poplatok_config: {
    cislo_poradace: number
    vybavuje?: number | null
  }
  pko21_nadoba: {
    pko_poplatok?: number | null
    adresa?: number | null
    objem?: number | null
    pocet_nadob?: number | null
    pocet_odvozov?: number | null
    sadzba_mena?: number | null
    suma_uhrada_mena?: number | null
    druh_nadoby?: string | null
    orientacne_cislo?: string | null
    druh_odpadu?: string | null
  }
  subjekty: {
    cislo_subjektu: number
    cislo_poradace: number
    reference_subjektu?: string | null
    nazev_subjektu?: string | null
  }
  organizace: {
    cislo_subjektu: number
    adr_tp_sup_cislo?: string | null
    adr_tp_or_cislo?: string | null
    adresa_tp_sidlo?: number | null
  }
  zamestnanci: {
    cislo_subjektu: number
    telefon_prace?: string | null
    e_mail?: string | null
  }
}

export type NorisTableName = keyof NorisTableRows
