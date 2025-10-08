import { randomBytes } from 'node:crypto'

import { TaxAdministrator } from '@prisma/client'

import { NorisTaxPayersDto } from '../../noris/noris.dto'
import { RequestAdminCreateTestingTaxNorisData } from '../dtos/requests.dto'

/**
 * Creates a mock Noris tax record for testing purposes based on user input
 */
export const createTestingTaxMock = (
  norisData: RequestAdminCreateTestingTaxNorisData,
  taxAdministrator: TaxAdministrator,
  year: number,
): NorisTaxPayersDto => {
  // This is not exact, but makes sure the total will be correct
  const total = parseFloat(norisData.taxTotal.replace(',', '.'))
  const spl1 = total / 3
  const spl2 = (total - spl1) / 2
  const spl3 = total - spl1 - spl2

  return {
    ICO_RC: norisData.fakeBirthNumber,
    subjekt_nazev: norisData.nameSurname,
    dan_spolu: norisData.taxTotal,
    rok: year,
    datum_platnosti: norisData.dateTaxRuling,

    // payment data
    specificky_symbol: '2024100000',
    variabilny_symbol: norisData.variableSymbol,
    uhrazeno: norisData.alreadyPaid,
    zbyva_uhradit: (
      parseFloat(norisData.taxTotal.replace(',', '.')) -
      parseFloat(norisData.alreadyPaid.replace(',', '.'))
    ).toString(),

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
    psc_naz_tb: 'test psc nazov',
    stat_nazov_plny: 'test stat',
    obec_nazev_tb: 'test obec',
    TXT_UL: 'test ulica txt',
    TXT_MENO: 'test meno txt',

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
    SPL4_4: (0).toFixed(2).replace('.', ','),

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
    sposob_dorucenia: 'TEST',
    cislo_subjektu: 123_456,
    akt_datum: new Date().toISOString().split('T')[0],
    dan_stavby: '600,50',
    dan_stavby_viac: '300,25',
    dan_byty: norisData.taxTotal,
    adresa_tp_sidlo: 'test sidlo',

    // user type
    TYP_USER: 'FO',
  }
}
