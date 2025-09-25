import { TaxAdministrator } from '@prisma/client'

import { NorisTaxPayersDto } from '../../noris.dto'
import {
  convertCurrencyToInt,
  mapDeliveryMethodToNoris,
  mapNorisToTaxAdministratorData,
  mapNorisToTaxData,
  mapNorisToTaxDetailData,
  mapNorisToTaxInstallmentsData,
  mapNorisToTaxPayerData,
} from '../mapping.helper'
import {
  AreaTypesEnum,
  DeliveryMethod,
  DeliveryMethodNoris,
} from '../noris.types'

describe('convertCurrencyToInt', () => {
  it('should convert string currency with comma to integer', () => {
    expect(convertCurrencyToInt('123,45')).toBe(12_345)
  })

  it('should convert string currency with dot to integer', () => {
    expect(convertCurrencyToInt('123.45')).toBe(12_345)
  })

  it('should convert string currency without decimals to integer', () => {
    expect(convertCurrencyToInt('123')).toBe(12_300)
  })

  it('should handle zero value', () => {
    expect(convertCurrencyToInt('0')).toBe(0)
  })

  it('should handle empty string', () => {
    expect(convertCurrencyToInt('')).toBe(0)
  })
})

describe('mapNorisToTaxPayerData', () => {
  const mockNorisData: NorisTaxPayersDto = {
    ICO_RC: '1234567890',
    adresa_tp_sidlo: 'Test Address',
    subjekt_refer: 'EXT123',
    subjekt_nazev: 'Test Subject',
    ulica_tb_cislo: 'Test Street 1',
    psc_ref_tb: '12345',
    TXT_UL: 'Test Street Text',
    obec_nazev_tb: 'Test City',
    TXT_MENO: 'Test Name',
  } as NorisTaxPayersDto

  const mockTaxAdministrator: TaxAdministrator = {
    id: 1,
    name: 'Test Admin',
    email: 'admin@test.com',
    phoneNumber: '123456789',
    externalId: 'ADM123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should map Noris data to TaxPayer data correctly', () => {
    const result = mapNorisToTaxPayerData(mockNorisData, mockTaxAdministrator)

    expect(result).toEqual({
      active: true,
      birthNumber: '1234567890',
      permanentResidenceAddress: 'Test Address',
      externalId: 'EXT123',
      name: 'Test Subject',
      permanentResidenceStreet: 'Test Street 1',
      permanentResidenceZip: '12345',
      permanentResidenceStreetTxt: 'Test Street Text',
      permanentResidenceCity: 'Test City',
      nameTxt: 'Test Name',
      taxAdministratorId: 1,
    })
  })
})

describe('mapNorisToTaxAdministratorData', () => {
  const mockNorisData: NorisTaxPayersDto = {
    vyb_email: 'admin@test.com',
    cislo_poradace: 123,
    vyb_id: 456,
    vyb_nazov: 'Test Admin',
    vyb_telefon_prace: '123456789',
  } as NorisTaxPayersDto

  it('should map Noris data to TaxAdministrator data correctly', () => {
    const result = mapNorisToTaxAdministratorData(mockNorisData)

    expect(result).toEqual({
      email: 'admin@test.com',
      externalId: '123',
      id: 456,
      name: 'Test Admin',
      phoneNumber: '123456789',
    })
  })

  it('should convert cislo_poradace to string for externalId', () => {
    const result = mapNorisToTaxAdministratorData(mockNorisData)
    expect(typeof result.externalId).toBe('string')
    expect(result.externalId).toBe('123')
  })
})

describe('mapNorisToTaxData', () => {
  const mockNorisData: NorisTaxPayersDto = {
    dan_spolu: '100,50',
    variabilny_symbol: 'VS123',
    akt_datum: '2023-01-01',
    datum_platnosti: '2023-12-31',
    cislo_konania: 'CK123',
    dan_pozemky: '20,00',
    dan_stavby_SPOLU: '50,25',
    dan_byty: '30,25',
  } as NorisTaxPayersDto

  it('should map Noris data to Tax data correctly', () => {
    const result = mapNorisToTaxData(
      mockNorisData,
      2023,
      1,
      'qr_code_email',
      'qr_code_web',
    )

    expect(result).toEqual({
      amount: 10_050,
      year: 2023,
      taxPayerId: 1,
      variableSymbol: 'VS123',
      dateCreateTax: '2023-01-01',
      dateTaxRuling: '2023-12-31',
      taxId: 'CK123',
      taxLand: 2000,
      taxConstructions: 5025,
      taxFlat: 3025,
      qrCodeEmail: 'qr_code_email',
      qrCodeWeb: 'qr_code_web',
    })
  })

  it('should convert currency values to integers', () => {
    const result = mapNorisToTaxData(
      mockNorisData,
      2023,
      1,
      'qr_code_email',
      'qr_code_web',
    )

    expect(result.amount).toBe(10_050)
    expect(result.taxLand).toBe(2000)
    expect(result.taxConstructions).toBe(5025)
    expect(result.taxFlat).toBe(3025)
  })
})

describe('mapNorisToTaxInstallmentsData', () => {
  const taxId = 1

  it('should return single installment when SPL4_2 is empty', () => {
    const mockNorisData: NorisTaxPayersDto = {
      SPL4_2: '',
      SPL1: '100,00',
      TXTSPL1: 'Single Payment',
    } as NorisTaxPayersDto

    const result = mapNorisToTaxInstallmentsData(mockNorisData, taxId)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      taxId: 1,
      amount: 10_000,
      order: 1,
      text: 'Single Payment',
    })
  })

  it('should return three installments when SPL4_2 is not empty', () => {
    const mockNorisData: NorisTaxPayersDto = {
      SPL4_2: '50,00',
      SPL4_1: '30,00',
      SPL4_3: '20,00',
      TXTSPL4_1: 'First Payment',
      TXTSPL4_2: 'Second Payment',
      TXTSPL4_3: 'Third Payment',
    } as NorisTaxPayersDto

    const result = mapNorisToTaxInstallmentsData(mockNorisData, taxId)

    expect(result).toHaveLength(3)
    expect(result).toEqual([
      {
        taxId: 1,
        amount: 3000,
        order: 1,
        text: 'First Payment',
      },
      {
        taxId: 1,
        amount: 5000,
        order: 2,
        text: 'Second Payment',
      },
      {
        taxId: 1,
        amount: 2000,
        order: 3,
        text: 'Third Payment',
      },
    ])
  })

  it('should convert currency amounts to integers in installments', () => {
    const mockNorisData: NorisTaxPayersDto = {
      SPL4_2: '25,75',
      SPL4_1: '10,25',
      SPL4_3: '15,50',
      TXTSPL4_1: 'First',
      TXTSPL4_2: 'Second',
      TXTSPL4_3: 'Third',
    } as NorisTaxPayersDto

    const result = mapNorisToTaxInstallmentsData(mockNorisData, taxId)

    expect(result[0].amount).toBe(1025)
    expect(result[1].amount).toBe(2575)
    expect(result[2].amount).toBe(1550)
  })
})

describe('mapDeliveryMethodToNoris', () => {
  it('should map CITY_ACCOUNT to CITY_ACCOUNT', () => {
    expect(mapDeliveryMethodToNoris(DeliveryMethod.CITY_ACCOUNT)).toBe(
      DeliveryMethodNoris.CITY_ACCOUNT,
    )
  })

  it('should map EDESK to EDESK', () => {
    expect(mapDeliveryMethodToNoris(DeliveryMethod.EDESK)).toBe(
      DeliveryMethodNoris.EDESK,
    )
  })

  it('should map POSTAL to EDESK', () => {
    expect(mapDeliveryMethodToNoris(DeliveryMethod.POSTAL)).toBe(
      DeliveryMethodNoris.EDESK,
    )
  })

  it('should return null for null input', () => {
    expect(mapDeliveryMethodToNoris(null)).toBeNull()
  })

  it('should throw an error for unknown delivery method', () => {
    expect(() => mapDeliveryMethodToNoris('UNKNOWN' as any)).toThrow(
      'Unknown delivery method: UNKNOWN',
    )
  })
})

describe('taxDetail', () => {
  const mockTaxId = 123

  const mockNorisTaxPayersData: Partial<NorisTaxPayersDto> = {
    // Apartment (byt) related fields
    det_zaklad_dane_byt: '100,50',
    det_dan_byty_byt: '10,50',
    det_zaklad_dane_nebyt: '200,75',
    det_dan_byty_nebyt: '20,75',

    // Ground (pozemky) related fields
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

    // Construction (stavba) related fields
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
  }

  it('should process apartment (byt) tax details correctly', () => {
    const result = mapNorisToTaxDetailData(
      mockNorisTaxPayersData as NorisTaxPayersDto,
      mockTaxId,
    )

    const apartmentEntries = result.filter(
      (entry) => entry.type === AreaTypesEnum.APARTMENT,
    )

    expect(apartmentEntries).toHaveLength(2) // byt and nebyt

    expect(apartmentEntries).toContainEqual({
      taxId: mockTaxId,
      areaType: 'byt',
      type: AreaTypesEnum.APARTMENT,
      base: 10_050,
      amount: 1050,
      area: null,
    })

    expect(apartmentEntries).toContainEqual({
      taxId: mockTaxId,
      areaType: 'nebyt',
      type: AreaTypesEnum.APARTMENT,
      base: 20_075,
      amount: 2075,
      area: null,
    })
  })

  it('should process ground (pozemky) tax details correctly', () => {
    const result = mapNorisToTaxDetailData(
      mockNorisTaxPayersData as NorisTaxPayersDto,
      mockTaxId,
    )

    const groundEntries = result.filter(
      (entry) => entry.type === AreaTypesEnum.GROUND,
    )

    // Should have entries for all configured ground types that have data
    expect(groundEntries).toContainEqual({
      taxId: mockTaxId,
      areaType: 'A',
      type: AreaTypesEnum.GROUND,
      base: 30_025,
      amount: 3025,
      area: '50',
    })

    expect(groundEntries).toContainEqual({
      taxId: mockTaxId,
      areaType: 'B',
      type: AreaTypesEnum.GROUND,
      base: 40_075,
      amount: 4075,
      area: '60',
    })

    expect(groundEntries).toContainEqual({
      taxId: mockTaxId,
      areaType: 'C',
      type: AreaTypesEnum.GROUND,
      base: 50_025,
      amount: 5025,
      area: '70',
    })
  })

  it('should process construction (stavba) tax details correctly', () => {
    const result = mapNorisToTaxDetailData(
      mockNorisTaxPayersData as NorisTaxPayersDto,
      mockTaxId,
    )

    const constructionEntries = result.filter(
      (entry) => entry.type === AreaTypesEnum.CONSTRUCTION,
    )

    expect(constructionEntries).toContainEqual({
      taxId: mockTaxId,
      areaType: 'A',
      type: AreaTypesEnum.CONSTRUCTION,
      base: 60_025,
      amount: 6025,
      area: null,
    })

    expect(constructionEntries).toContainEqual({
      taxId: mockTaxId,
      areaType: 'B',
      type: AreaTypesEnum.CONSTRUCTION,
      base: 70_075,
      amount: 7075,
      area: null,
    })

    // Test for special case with 'j' prefix
    expect(constructionEntries).toContainEqual({
      taxId: mockTaxId,
      areaType: 'jH',
      type: AreaTypesEnum.CONSTRUCTION,
      base: 130_075,
      amount: 13_075,
      area: null,
    })
  })

  it('should handle invalid number formats', () => {
    const invalidData: Partial<NorisTaxPayersDto> = {
      ...mockNorisTaxPayersData,
      det_zaklad_dane_byt: 'invalid',
      det_dan_byty_byt: '10.50', // Using dot instead of comma
    }

    const result = mapNorisToTaxDetailData(
      invalidData as NorisTaxPayersDto,
      mockTaxId,
    )
    expect(() => result).not.toThrow()
  })

  it('should process all configured types for each category', () => {
    const result = mapNorisToTaxDetailData(
      mockNorisTaxPayersData as NorisTaxPayersDto,
      mockTaxId,
    )

    // Check if we have entries for all configured types that have data
    const types = result.map((entry) => `${entry.type}-${entry.areaType}`)

    // Apartment types
    expect(types).toContain(`${AreaTypesEnum.APARTMENT}-byt`)
    expect(types).toContain(`${AreaTypesEnum.APARTMENT}-nebyt`)

    // Ground types with data
    expect(types).toContain(`${AreaTypesEnum.GROUND}-A`)
    expect(types).toContain(`${AreaTypesEnum.GROUND}-B`)
    expect(types).toContain(`${AreaTypesEnum.GROUND}-C`)

    // Construction types with data
    expect(types).toContain(`${AreaTypesEnum.CONSTRUCTION}-A`)
    expect(types).toContain(`${AreaTypesEnum.CONSTRUCTION}-B`)
    expect(types).toContain(`${AreaTypesEnum.CONSTRUCTION}-jH`)
  })
})
