import { TaxType } from '@prisma/client'

import { NorisCommunalWasteTaxGrouped } from '../../../types/noris.types'

export const createTestNorisCommunalWasteTaxGrouped = (
  overrides?: Partial<NorisCommunalWasteTaxGrouped>,
): NorisCommunalWasteTaxGrouped => ({
  type: TaxType.KO,
  cislo_poradace: 13_020,
  stav_dokladu: 'Z',
  cislo_subjektu: 138_546_823,
  cislo_konania: '4/25/030151-36/78/219197',
  datum_platnosti: new Date('2025-03-26T00:00:00.000Z'),
  variabilny_symbol: '3425030151',
  rok: 2025,
  dan_spolu: '448,66',
  uhrazeno: 448.66,
  subjekt_refer: '0219197',
  subjekt_nazev: 'Ing. Ján Testovací',
  akt_datum: '13.02.2025',
  vyb_nazov: 'Ing. Mária Príkladná',
  SPL1: '',
  SPL4_1: '112,16',
  SPL4_2: '112,16',
  SPL4_3: '112,16',
  SPL4_4: '112,18',
  datum_spl1: new Date('2025-04-11T00:00:00.000Z'),
  datum_spl2: new Date('2025-05-31T00:00:00.000Z'),
  datum_spl3: new Date('2025-08-31T00:00:00.000Z'),
  datum_spl4: new Date('2025-10-31T00:00:00.000Z'),
  ICO_RC: '123456/7890',
  ulica_tb_cislo: 'Hlavná ulica 21',
  psc_ref_tb: '12345',
  obec_nazev_tb: 'Testovacia Obec',
  vyb_telefon_prace: '+421 910 123 456',
  vyb_email: 'maria.prikladna@example.sk',
  vyb_id: 130_777_360,
  forma_uhrady: 'I',
  addresses: [
    {
      addressDetail: {
        street: 'Hlavná ulica',
        orientationNumber: '22',
      },
      containers: [
        {
          objem_nadoby: 120,
          pocet_nadob: 1,
          pocet_odvozov: 52,
          sadzba: 4.314,
          poplatok: 224.33,
          druh_nadoby: 'N12',
        },
      ],
    },
  ],
  ...overrides,
})
