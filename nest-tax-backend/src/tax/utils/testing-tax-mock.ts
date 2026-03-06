import { randomBytes } from 'node:crypto'

import { TaxAdministrator, TaxType } from '@prisma/client'

import { RequestAdminCreateTestingTaxNorisData } from '../../admin/dtos/requests.dto'
import {
  NorisCommunalWasteTaxGrouped,
  NorisRealEstateTax,
} from '../../noris/types/noris.types'

/**
 * Creates a mock Noris tax record for testing purposes based on user input
 */
export const createTestingRealEstateTaxMock = (
  norisData: RequestAdminCreateTestingTaxNorisData,
  taxAdministrator: TaxAdministrator,
  year: number,
): NorisRealEstateTax => {
  // This is not exact, but makes sure the total will be correct
  const total = Math.round(
    parseFloat(norisData.taxTotal.replace(',', '')) * 100,
  )
  const spl1InCents = Math.round(total / 3)
  const spl2InCents = Math.round((total - spl1InCents) / 2)
  const spl3InCents = total - spl1InCents - spl2InCents

  const spl1 = spl1InCents / 100
  const spl2 = spl2InCents / 100
  const spl3 = spl3InCents / 100
  return {
    ICO_RC: norisData.fakeBirthNumber,
    subjekt_nazev: norisData.nameSurname,
    dan_spolu: norisData.taxTotal,
    rok: year,
    datum_platnosti: norisData.dateTaxRuling,
    stav_dokladu: norisData.isCancelled ? 'S' : 'Z',

    // payment data
    variabilny_symbol: norisData.variableSymbol,
    uhrazeno: norisData.alreadyPaid,
    // existing tax administrator data to not overwrite
    vyb_email: taxAdministrator.email,
    cislo_poradace: +taxAdministrator.externalId,
    vyb_id: taxAdministrator.id,
    vyb_nazov: taxAdministrator.name,
    vyb_telefon_prace: taxAdministrator.phoneNumber,
    cislo_konania: randomBytes(4).toString('hex'),

    // mock values for testing
    subjekt_refer: '123456789',
    dan_pozemky: '0',
    dan_stavby_SPOLU: '0',
    ulica_tb_cislo: 'test ulica cislo',
    psc_ref_tb: 'test psc',
    obec_nazev_tb: 'test obec',

    // splátky (installments) data
    TXTSPL1: 'TEST: Daň za rok je splatná do xx.yy',
    SPL1: norisData.taxTotal,
    TXTSPL4_1: 'Test splatka1',
    SPL4_1: spl1.toFixed(2).replace('.', ','),
    TXTSPL4_2: 'Test splatka2',
    SPL4_2: spl2.toFixed(2).replace('.', ','),
    TXTSPL4_3: 'Test splatka3',
    SPL4_3: spl3.toFixed(2).replace('.', ','),
    TXTSPL4_4: '',
    SPL4_4: '',

    // tax detail fields - mock only
    det_zaklad_dane_byt: '100,50',
    det_dan_byty_byt: '10,50',
    det_zaklad_dane_nebyt: '200,75',
    det_dan_byty_nebyt: '20,75',
    det_pozemky_ZAKLAD_A: '300,25',
    det_pozemky_DAN_A: '30,25',
    det_pozemky_VYMERA_A: '50',
    det_pozemky_ZAKLAD_B: '400,75',
    det_pozemky_DAN_B: '40,75',
    det_pozemky_VYMERA_B: '60',
    det_pozemky_ZAKLAD_C: '500,25',
    det_pozemky_DAN_C: '50,25',
    det_pozemky_VYMERA_C: '70',
    det_pozemky_ZAKLAD_D: '600,25',
    det_pozemky_DAN_D: '60,25',
    det_pozemky_VYMERA_D: '80',
    det_pozemky_ZAKLAD_E: '700,25',
    det_pozemky_DAN_E: '70,25',
    det_pozemky_VYMERA_E: '90',
    det_pozemky_ZAKLAD_F: '800,25',
    det_pozemky_DAN_F: '80,25',
    det_pozemky_VYMERA_F: '100',
    det_pozemky_ZAKLAD_G: '900,25',
    det_pozemky_DAN_G: '90,25',
    det_pozemky_VYMERA_G: '110',
    det_pozemky_ZAKLAD_H: '1000,25',
    det_pozemky_DAN_H: '100,25',
    det_pozemky_VYMERA_H: '120',
    det_stavba_ZAKLAD_A: '600,25',
    det_stavba_DAN_A: '60,25',
    det_stavba_ZAKLAD_B: '700,75',
    det_stavba_DAN_B: '70,75',
    det_stavba_ZAKLAD_C: '800,75',
    det_stavba_DAN_C: '80,75',
    det_stavba_ZAKLAD_D: '900,75',
    det_stavba_DAN_D: '90,75',
    det_stavba_ZAKLAD_E: '1000,75',
    det_stavba_DAN_E: '100,75',
    det_stavba_ZAKLAD_F: '1100,75',
    det_stavba_DAN_F: '110,75',
    det_stavba_ZAKLAD_G: '1200,75',
    det_stavba_DAN_G: '120,75',
    det_stavba_ZAKLAD_jH: '1300,75',
    det_stavba_DAN_jH: '130,75',
    det_stavba_ZAKLAD_jI: '1400,75',
    det_stavba_DAN_jI: '140,75',
    det_stavba_ZAKLAD_H: '1500,75',
    det_stavba_DAN_H: '150,75',

    // additional required fields
    cislo_subjektu: 123_456,
    akt_datum: new Date().toISOString().split('T')[0],
    dan_stavby: '600,50',
    dan_stavby_viac: '300,25',
    dan_byty: norisData.taxTotal,
  }
}

export const createTestingCommunalWasteTaxMock = (
  norisData: RequestAdminCreateTestingTaxNorisData,
  taxAdministrator: TaxAdministrator,
  year: number,
): NorisCommunalWasteTaxGrouped => {
  // This is not exact, but makes sure the total will be correct
  const total = Math.round(
    parseFloat(norisData.taxTotal.replace(',', '')) * 100,
  )
  const spl1InCents = Math.round(total / 4)
  const spl2InCents = Math.round((total - spl1InCents) / 3)
  const spl3InCents = Math.round((total - spl1InCents - spl2InCents) / 2)
  const spl4InCents = total - spl1InCents - spl2InCents - spl3InCents

  const spl1 = spl1InCents / 100
  const spl2 = spl2InCents / 100
  const spl3 = spl3InCents / 100
  const spl4 = spl4InCents / 100

  return {
    stav_dokladu: norisData.isCancelled ? 'S' : 'Z',
    type: TaxType.KO,
    // base identification
    ICO_RC: norisData.fakeBirthNumber,
    subjekt_nazev: norisData.nameSurname,
    dan_spolu: norisData.taxTotal,
    rok: year,
    datum_platnosti: norisData.dateTaxRuling,

    // payment data
    variabilny_symbol: norisData.variableSymbol,
    uhrazeno: norisData.alreadyPaid,

    // existing tax administrator data to not overwrite
    vyb_email: taxAdministrator.email,
    cislo_poradace: +taxAdministrator.externalId,
    vyb_id: taxAdministrator.id,
    vyb_nazov: taxAdministrator.name,
    vyb_telefon_prace: taxAdministrator.phoneNumber,

    // generated case number
    cislo_konania: randomBytes(4).toString('hex'),

    // additional required fields from base schema (mock values)
    subjekt_refer: '123456789',
    ulica_tb_cislo: 'test ulica cislo',
    psc_ref_tb: 'test psc',
    obec_nazev_tb: 'test obec',
    cislo_subjektu: 123_456,
    akt_datum: new Date().toISOString().split('T')[0],

    // splátky (installments) data
    TXTSPL1: 'TEST: Poplatok za rok je splatný do xx.yy',
    SPL1: norisData.taxTotal,
    TXTSPL4_1: 'Test splatka1',
    SPL4_1: spl1.toFixed(2).replace('.', ','),
    TXTSPL4_2: 'Test splatka2',
    SPL4_2: spl2.toFixed(2).replace('.', ','),
    TXTSPL4_3: 'Test splatka3',
    SPL4_3: spl3.toFixed(2).replace('.', ','),
    TXTSPL4_4: 'Test splatka4',
    SPL4_4: spl4.toFixed(2).replace('.', ','),

    // communal waste specific fields (mock but type-correct)
    addresses: [
      {
        addressDetail: {
          street: 'Testovacia ulica',
          orientationNumber: '10A',
        },
        containers: [
          {
            objem_nadoby: 120, // liters
            pocet_nadob: 1,
            pocet_odvozov: 52,
            sadzba: 0.5,
            poplatok: total,
            druh_nadoby: 'KLASICKA_NADOBA',
          },
        ],
      },
    ],
  }
}
