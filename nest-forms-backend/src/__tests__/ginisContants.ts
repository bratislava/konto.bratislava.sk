import { DetailDokumentu } from '../utils/ginis/ginis-api-helper'

// eslint-disable-next-line import/prefer-default-export
export const mockGinisDocumentData: DetailDokumentu = {
  WflDokument: [
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      IdSpisu: 'MAG0X03RZDEB',
      Atribut_IdSpisu_Externi: 'false',
      PriznakSpisu: 'pisemnost',
      PriznakCj: 'neni-cj',
      IdFunkceVlastnika: 'MAG0SF00A19L',
      Atribut_IdFunkceVlastnika_Externi: 'false',
      Vec: 'Podanie',
      Znacka: '',
      StavDistribuce: 'neni-v-distribuci',
      StavDokumentu: 'podano',
      IdAgendy: '190',
      IdTypuDokumentu: 'MAG00400AAMI',
      PriznakDoruceni: 'doruceny',
      PriznakEvidenceSsl: 'ssl-neevidovan',
      MistoVzniku:
        'Hlavné mesto SR Bratislava,  Primaciálne námestie 429/1,  81499 Bratislava - mestská časť Staré Mest',
      DatumPodani: '2023-09-13',
      PriznakFyzExistence: 'neexistuje',
      PriznakElObrazu: 'existuje',
      IdSouboru: 'MAG00C1B2JQ9',
      Atribut_IdSouboru_Externi: 'false',
      JmenoSouboru: 'Záv_zné_stanovisko_k_investičnej_činnosti_ext_missing.xml',
      PopisSouboru: 'Záv_zné_stanovisko_k_investičnej_činnosti_ext_miss',
      DatumZmeny: '2023-09-13T11:01:04',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      VerzeSouboru: '1',
      DatumZmenySouboru: '2023-09-13T11:00:16',
      VelikostSouboru: '3364',
      PriznakSouboruRo: '2',
    },
  ],
  Doruceni: {
    IdDokumentu: 'MAG0X03RZDEB',
    Atribut_IdDokumentu_Externi: 'false',
    Stat: 'SVK',
    DatumOdeslani: '2023-09-13T00:00:00',
    ZnackaOdesilatele: '',
    DatumZeDne: '2023-09-13T00:00:00',
    PodaciCislo: 'ba39aeae-8090-447a-a163-962291',
    ZpusobDoruceni: 'edesk',
    DruhZasilky: 'neurceno',
    DruhZachazeni: 'neurceno',
    DatumPrijmuPodani: '2023-09-13T11:00:11',
    IdOdesilatele: 'MAG0SE10YQFC',
    Atribut_IdOdesilatele_Externi: 'false',
    PocetListu: '',
    PocetPriloh: '2',
    PocetListuPriloh: '',
    PoznamkaKDoruceni: '',
    IdUzluPodani: 'MAG0SS00A01L',
    Atribut_IdUzluPodani_Externi: 'false',
    PoradoveCisloPodani: '79',
  },
  EDoruceni: {
    DatumPrijeti: '2023-09-13T10:58:02',
    DatumDoruceni: '2023-09-13T11:00:11',
    IdDsOdesilatele: 'ico://sk/00603481',
  },
  HistorieDokumentu: [
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny:
        'Datum a čas doručení dokumentu byl zadán obsluhou odlišný od aktuálního času.',
      Poznamka:
        'Datum zápisu do systému:  13.09.2023 11:00:15  Datum podání zadaný obsluhou: 13.09.2023 11:00:11',
      DatumZmeny: '2023-09-13T11:00:16',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1010',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Meno súboru prílohy el.podania bolo zmenené systémom',
      Poznamka:
        'Pôvodný: Záväzné stanovisko k investičnej činnosti. Nový: Záv_zné_stanovisko_k_investičnej_činnosti_ext_missing.xml.',
      DatumZmeny: '2023-09-13T11:00:16',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '365',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny:
        'Nastavenie príznakov platnej či pracovnej verzie el. dokumentu.',
      Poznamka:
        'Záv_zné_stanovisko_k_investičnej_činnost...  verzia:1 platná archivovať',
      DatumZmeny: '2023-09-13T11:00:16',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '362',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Priradenie prílohy k dokladu',
      Poznamka: '1',
      DatumZmeny: '2023-09-13T11:01:01',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1100',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Priradenie prílohy k dokladu',
      Poznamka: '2',
      DatumZmeny: '2023-09-13T11:01:03',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1100',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Registrace doručeného dokumentu.',
      Poznamka: '',
      DatumZmeny: '2023-09-13T11:00:16',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1010',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Vloženie el. obrazu/prílohy k dokladu/dokumentu',
      Poznamka: '5261a38c40c5b3043c3d10acfcee0a71d6ae0cf5.pdf',
      DatumZmeny: '2023-09-13T11:01:03',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '334',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Vloženie el. obrazu/prílohy k dokladu/dokumentu',
      Poznamka: '6ff1d6667ebd476b9c956f679b4c3fb2341b9d27.pdf',
      DatumZmeny: '2023-09-13T11:01:04',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '334',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Vloženie el. obrazu/prílohy k dokladu/dokumentu',
      Poznamka: 'Záv_zné_stanovisko_k_investičnej_činnosti_ext_miss',
      DatumZmeny: '2023-09-13T11:00:16',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '332',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie detailu dokumentu/dokladu.',
      Poznamka: '',
      DatumZmeny: '2023-09-13T11:00:44',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '410',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie detailu dokumentu/dokladu.',
      Poznamka: '',
      DatumZmeny: '2023-09-13T11:00:45',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '410',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie detailu dokumentu/dokladu.',
      Poznamka: '',
      DatumZmeny: '2023-09-13T11:00:46',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '410',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie detailu dokumentu/dokladu.',
      Poznamka: '',
      DatumZmeny: '2023-09-13T11:01:06',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '410',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie detailu dokumentu/dokladu.',
      Poznamka: '',
      DatumZmeny: '2023-09-13T11:01:06',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '410',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie detailu dokumentu/dokladu.',
      Poznamka: '',
      DatumZmeny: '2023-09-13T11:01:21',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '410',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie detailu dokumentu/dokladu.',
      Poznamka: '',
      DatumZmeny: '2023-09-18T15:20:31',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '410',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie elektronickej prílohy dokladu/dokumentu',
      Poznamka: '5261a38c40c5b3043c3d10acfcee0a71d6ae0cf5.pdf',
      DatumZmeny: '2023-09-13T11:01:34',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1240',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie elektronickej prílohy dokladu/dokumentu',
      Poznamka: '6ff1d6667ebd476b9c956f679b4c3fb2341b9d27.pdf',
      DatumZmeny: '2023-09-13T11:01:37',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1240',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie elektronického obrazu dokladu/dokumentu',
      Poznamka: 'Záv_zné_stanovisko_k_investičnej_činnosti_ext_miss',
      DatumZmeny: '2023-09-13T11:00:45',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1240',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie elektronického obrazu dokladu/dokumentu',
      Poznamka: 'Záv_zné_stanovisko_k_investičnej_činnosti_ext_miss',
      DatumZmeny: '2023-09-13T11:00:46',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1240',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie elektronického obrazu dokladu/dokumentu',
      Poznamka: 'Záv_zné_stanovisko_k_investičnej_činnosti_ext_miss',
      DatumZmeny: '2023-09-13T11:00:47',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1240',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie elektronického obrazu dokladu/dokumentu',
      Poznamka: 'Záv_zné_stanovisko_k_investičnej_činnosti_ext_miss',
      DatumZmeny: '2023-09-13T11:01:06',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1240',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie elektronického obrazu dokladu/dokumentu',
      Poznamka: 'Záv_zné_stanovisko_k_investičnej_činnosti_ext_miss',
      DatumZmeny: '2023-09-13T11:01:07',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1240',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie elektronického obrazu dokladu/dokumentu',
      Poznamka: 'Záv_zné_stanovisko_k_investičnej_činnosti_ext_miss',
      DatumZmeny: '2023-09-13T11:01:22',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1240',
    },
    {
      IdDokumentu: 'MAG0X03RZDEB',
      Atribut_IdDokumentu_Externi: 'false',
      TextZmeny: 'Zobrazenie elektronického obrazu dokladu/dokumentu',
      Poznamka: 'Záv_zné_stanovisko_k_investičnej_činnosti_ext_miss',
      DatumZmeny: '2023-09-18T15:20:32',
      IdZmenuProvedl: 'MAG0SZ00KU7U',
      Atribut_IdZmenuProvedl_Externi: 'false',
      IdKtgZmeny: '1240',
    },
  ],
  PrilohyDokumentu: [
    {
      PoradoveCislo: '1',
      Titulek: '5261a38c40c5b3043c3d10acfcee0a71d6ae0cf5',
      Popis: '5261a38c40c5b3043c3d10acfcee0a71d6ae0cf5',
      Poznamka: '5261a38c40c5b3043c3d10acfcee0a71d6ae0cf5',
      PriznakElObrazu: 'existuje-neaut-konv',
      IdSouboru: 'MAG00C1B2JR4',
      Atribut_IdSouboru_Externi: 'false',
      VerzeSouboru: '1',
      DatumZmenySouboru: '2023-09-13T11:01:03',
      JmenoSouboru: '5261a38c40c5b3043c3d10acfcee0a71d6ae0cf5.pdf',
      VelikostSouboru: '77246',
      KeZverejneni: '0',
      StavAnonymizace: '0',
      KategoriePrilohy: '0',
      KategoriePrilohyTxt: 'Všeobecná príloha',
      PriznakSouboruRo: '0',
    },
    {
      PoradoveCislo: '2',
      Titulek: '6ff1d6667ebd476b9c956f679b4c3fb2341b9d27',
      Popis: '6ff1d6667ebd476b9c956f679b4c3fb2341b9d27',
      Poznamka: '6ff1d6667ebd476b9c956f679b4c3fb2341b9d27',
      PriznakElObrazu: 'existuje-neaut-konv',
      IdSouboru: 'MAG00C1B2JSZ',
      Atribut_IdSouboru_Externi: 'false',
      VerzeSouboru: '1',
      DatumZmenySouboru: '2023-09-13T11:01:04',
      JmenoSouboru: '6ff1d6667ebd476b9c956f679b4c3fb2341b9d27.pdf',
      VelikostSouboru: '33150',
      KeZverejneni: '0',
      StavAnonymizace: '0',
      KategoriePrilohy: '0',
      KategoriePrilohyTxt: 'Všeobecná príloha',
      PriznakSouboruRo: '0',
    },
  ],
  CjDokumentu: {
    IdInitDokumentu: 'string',
    Atribut_IdInitDokumentu_Externi: 'string',
    IdVyrizDokumentu: 'string',
    Atribut_IdVyrizDokumentu_Externi: 'string',
    Atribut_IdVyrizDokumentu_Nil: 'string',
    DenikCj: 'string',
    RokCj: 'string',
    PoradoveCisloCj: 'string',
    ZnackaCj: 'string',
    StavCj: 'string',
    DatumEvidence: 'string',
    IdZpusobVyrizeni: 'string',
    Atribut_IdZpusobVyrizeni_Externi: 'string',
    Atribut_IdZpusobVyrizeni_Nil: 'string',
    DoplnekCj: 'string',
  },
  Atribut_Xrg_IxsExt: 'MAG0AIE0A079',
} as DetailDokumentu