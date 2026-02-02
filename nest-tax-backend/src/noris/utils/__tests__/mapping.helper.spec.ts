/* eslint-disable no-secrets/no-secrets */
import { TaxType } from '@prisma/client'

import {
  RealEstateTaxAreaType,
  RealEstateTaxPropertyType,
} from '../../../prisma/json-types'
import {
  AreaTypesEnum,
  DeliveryMethod,
  DeliveryMethodNoris,
} from '../../types/noris.enums'
import {
  NorisCommunalWasteTaxGrouped,
  NorisRealEstateTax,
} from '../../types/noris.types'
import {
  convertCurrencyToInt,
  mapDeliveryMethodToNoris,
  mapNorisToCommunalWasteDatabaseDetail,
  mapNorisToRealEstateDatabaseDetail,
  mapNorisToTaxAdministratorData,
  mapNorisToTaxInstallmentsData,
  mapNorisToTaxPayerData,
} from '../mapping.helper'

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
  const mockNorisData: NorisRealEstateTax = {
    ICO_RC: '1234567890',
    adresa_tp_sidlo: 'Test Address',
    subjekt_refer: 'EXT123',
    subjekt_nazev: 'Test Subject',
    ulica_tb_cislo: 'Test Street 1',
    psc_ref_tb: '12345',
    TXT_UL: 'Test Street Text',
    obec_nazev_tb: 'Test City',
    TXT_MENO: 'Test Name',
  } as NorisRealEstateTax

  it('should map Noris data to TaxPayer data correctly', () => {
    const result = mapNorisToTaxPayerData(mockNorisData)

    expect(result).toEqual({
      birthNumber: '1234567890',
      permanentResidenceAddress: 'Test Address',
      externalId: 'EXT123',
      name: 'Test Subject',
      permanentResidenceStreet: 'Test Street 1',
      permanentResidenceZip: '12345',
      permanentResidenceStreetTxt: 'Test Street Text',
      permanentResidenceCity: 'Test City',
      nameTxt: 'Test Name',
    })
  })
})

describe('mapNorisToTaxAdministratorData', () => {
  const mockNorisData: NorisRealEstateTax = {
    vyb_email: 'admin@test.com',
    cislo_poradace: 123,
    vyb_id: 456,
    vyb_nazov: 'Test Admin',
    vyb_telefon_prace: '123456789',
  } as NorisRealEstateTax

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
    expect(typeof result?.externalId).toBe('string')
    expect(result?.externalId).toBe('123')
  })

  it('should return undefined if vyb_id is not present', () => {
    const result = mapNorisToTaxAdministratorData({
      ...mockNorisData,
      vyb_id: null,
    })
    expect(result).toBeUndefined()
  })

  it('should return undefined if vyb_telefon_prace is not present', () => {
    const result = mapNorisToTaxAdministratorData({
      ...mockNorisData,
      vyb_telefon_prace: null,
    })
    expect(result).toBeUndefined()
  })

  it('should return undefined if vyb_email is not present', () => {
    const result = mapNorisToTaxAdministratorData({
      ...mockNorisData,
      vyb_email: null,
    })
    expect(result).toBeUndefined()
  })
})

describe('mapNorisToTaxInstallmentsData', () => {
  const taxId = 1

  it('should return single installment when SPL4_2 is empty', () => {
    const mockNorisData: NorisRealEstateTax = {
      SPL4_2: '',
      SPL1: '100,00',
      TXTSPL1: 'Single Payment',
    } as NorisRealEstateTax

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
    const mockNorisData: NorisRealEstateTax = {
      SPL4_2: '50,00',
      SPL4_1: '30,00',
      SPL4_3: '20,00',
      TXTSPL4_1: 'First Payment',
      TXTSPL4_2: 'Second Payment',
      TXTSPL4_3: 'Third Payment',
    } as NorisRealEstateTax

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
    const mockNorisData: NorisRealEstateTax = {
      SPL4_2: '25,75',
      SPL4_1: '10,25',
      SPL4_3: '15,50',
      TXTSPL4_1: 'First',
      TXTSPL4_2: 'Second',
      TXTSPL4_3: 'Third',
    } as NorisRealEstateTax

    const result = mapNorisToTaxInstallmentsData(mockNorisData, taxId)

    expect(result[0].amount).toBe(1025)
    expect(result[1].amount).toBe(2575)
    expect(result[2].amount).toBe(1550)
  })

  it('should return four installments when SPL4_4 is not empty', () => {
    const mockNorisData: NorisRealEstateTax = {
      SPL4_2: '25,75',
      SPL4_1: '10,25',
      SPL4_3: '15,50',
      TXTSPL4_1: 'First',
      TXTSPL4_2: 'Second',
      TXTSPL4_3: 'Third',
      SPL4_4: '10,00',
      TXTSPL4_4: 'Fourth',
    } as NorisRealEstateTax

    const result = mapNorisToTaxInstallmentsData(mockNorisData, taxId)

    expect(result).toHaveLength(4)
    expect(result).toContainEqual({
      taxId: 1,
      amount: 1000,
      order: 4,
      text: 'Fourth',
    })
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

describe('mapNorisToRealEstateTaxDetailData', () => {
  const mockNorisTaxPayersData: Partial<NorisRealEstateTax> = {
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

    dan_pozemky: '66,68',
    dan_stavby_SPOLU: '421,43',
    dan_byty: '0,01',
  }

  it('should process apartment (byt) tax details correctly', () => {
    const result = mapNorisToRealEstateDatabaseDetail(
      mockNorisTaxPayersData as NorisRealEstateTax,
    )

    const apartmentEntries = result.propertyDetails.filter(
      (entry) => entry.type === RealEstateTaxPropertyType.APARTMENT,
    )

    expect(apartmentEntries).toHaveLength(2) // byt and nebyt

    expect(apartmentEntries).toContainEqual({
      areaType: 'byt',
      type: AreaTypesEnum.APARTMENT,
      base: 10_050,
      amount: 1050,
      area: undefined,
    })

    expect(apartmentEntries).toContainEqual({
      areaType: 'nebyt',
      type: AreaTypesEnum.APARTMENT,
      base: 20_075,
      amount: 2075,
      area: undefined,
    })

    expect(result.taxFlat).toBe(1)
    expect(result.taxLand).toBe(6668)
    expect(result.taxConstructions).toBe(42_143)
  })

  it('should process ground (pozemky) tax details correctly', () => {
    const result = mapNorisToRealEstateDatabaseDetail(
      mockNorisTaxPayersData as NorisRealEstateTax,
    )

    const groundEntries = result.propertyDetails.filter(
      (entry) => entry.type === RealEstateTaxPropertyType.GROUND,
    )

    // Should have entries for all configured ground types that have data
    expect(groundEntries).toContainEqual({
      areaType: 'A',
      type: AreaTypesEnum.GROUND,
      base: 30_025,
      amount: 3025,
      area: '50',
    })

    expect(groundEntries).toContainEqual({
      areaType: 'B',
      type: AreaTypesEnum.GROUND,
      base: 40_075,
      amount: 4075,
      area: '60',
    })

    expect(groundEntries).toContainEqual({
      areaType: 'C',
      type: AreaTypesEnum.GROUND,
      base: 50_025,
      amount: 5025,
      area: '70',
    })
  })

  it('should process construction (stavba) tax details correctly', () => {
    const result = mapNorisToRealEstateDatabaseDetail(
      mockNorisTaxPayersData as NorisRealEstateTax,
    )

    const constructionEntries = result.propertyDetails.filter(
      (entry) => entry.type === RealEstateTaxPropertyType.CONSTRUCTION,
    )

    expect(constructionEntries).toContainEqual({
      areaType: 'A',
      type: AreaTypesEnum.CONSTRUCTION,
      base: 60_025,
      amount: 6025,
      area: undefined,
    })

    expect(constructionEntries).toContainEqual({
      areaType: 'B',
      type: AreaTypesEnum.CONSTRUCTION,
      base: 70_075,
      amount: 7075,
      area: undefined,
    })

    // Test for special case with 'j' prefix
    expect(constructionEntries).toContainEqual({
      areaType: 'jH',
      type: AreaTypesEnum.CONSTRUCTION,
      base: 130_075,
      amount: 13_075,
      area: undefined,
    })
  })

  it('should handle invalid number formats', () => {
    const invalidData: Partial<NorisRealEstateTax> = {
      ...mockNorisTaxPayersData,
      det_zaklad_dane_byt: 'invalid',
      det_dan_byty_byt: '10.50', // Using dot instead of comma
    }

    const result = mapNorisToRealEstateDatabaseDetail(
      invalidData as NorisRealEstateTax,
    )
    expect(result.propertyDetails).toContainEqual(
      expect.objectContaining({
        areaType: RealEstateTaxAreaType.byt,
        type: RealEstateTaxPropertyType.APARTMENT,
        amount: 1050, // '10.50'
        base: 0, // 'invalid'
      }),
    )
  })

  it('should process all configured types for each category', () => {
    const result = mapNorisToRealEstateDatabaseDetail(
      mockNorisTaxPayersData as NorisRealEstateTax,
    )

    // Check if we have entries for all configured types that have data
    const types = result.propertyDetails.map(
      (entry) => `${entry.type}-${entry.areaType}`,
    )

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

describe('mapNorisToCommunalWasteDatabaseDetail', () => {
  it('should map single address with single container correctly', () => {
    const mockData: NorisCommunalWasteTaxGrouped = {
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
    } as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.type).toBe(TaxType.KO)
    expect(result.addresses).toHaveLength(1)
    expect(result.addresses[0].addressDetail).toEqual({
      street: 'Hlavná ulica',
      orientationNumber: '22',
    })
    expect(result.addresses[0].containers).toHaveLength(1)
    expect(result.addresses[0].containers[0]).toEqual({
      objem_nadoby: 120,
      pocet_nadob: 1,
      pocet_odvozov: 52,
      sadzba: 4.314,
      poplatok: 22_433,
      druh_nadoby: 'N12',
    })
  })

  it('should convert poplatok from number to integer correctly', () => {
    const mockData: NorisCommunalWasteTaxGrouped = {
      addresses: [
        {
          addressDetail: {
            street: 'Test Street',
            orientationNumber: '1',
          },
          containers: [
            {
              objem_nadoby: 240,
              pocet_nadob: 1,
              pocet_odvozov: 26,
              sadzba: 5.5,
              poplatok: 300,
              druh_nadoby: 'N24',
            },
          ],
        },
      ],
    } as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.addresses[0].containers[0].poplatok).toBe(30_000)
    expect(typeof result.addresses[0].containers[0].poplatok).toBe('number')
  })

  it('should handle poplatok with decimal values correctly', () => {
    const mockData: NorisCommunalWasteTaxGrouped = {
      addresses: [
        {
          addressDetail: {
            street: 'Test Street',
            orientationNumber: '2',
          },
          containers: [
            {
              objem_nadoby: 60,
              pocet_nadob: 1,
              pocet_odvozov: 104,
              sadzba: 2.5,
              poplatok: 150.5,
              druh_nadoby: 'N6',
            },
          ],
        },
      ],
    } as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.addresses[0].containers[0].poplatok).toBe(15_050)
  })

  it('should handle multiple containers at same address', () => {
    const mockData: NorisCommunalWasteTaxGrouped = {
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
            {
              objem_nadoby: 240,
              pocet_nadob: 1,
              pocet_odvozov: 26,
              sadzba: 5.5,
              poplatok: 500,
              druh_nadoby: 'N24',
            },
          ],
        },
      ],
    } as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.addresses).toHaveLength(1)
    expect(result.addresses[0].containers).toHaveLength(2)
    expect(result.addresses[0].containers[0].poplatok).toBe(22_433)
    expect(result.addresses[0].containers[1].poplatok).toBe(50_000)
    expect(result.addresses[0].containers[0].druh_nadoby).toBe('N12')
    expect(result.addresses[0].containers[1].druh_nadoby).toBe('N24')
  })

  it('should handle multiple addresses correctly', () => {
    const mockData: NorisCommunalWasteTaxGrouped = {
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
        {
          addressDetail: {
            street: 'Druhá ulica',
            orientationNumber: '51',
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
    } as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.addresses).toHaveLength(2)
    expect(result.addresses[0].addressDetail.street).toBe('Hlavná ulica')
    expect(result.addresses[1].addressDetail.street).toBe('Druhá ulica')
    expect(result.addresses[0].addressDetail.orientationNumber).toBe('22')
    expect(result.addresses[1].addressDetail.orientationNumber).toBe('51')
  })

  it('should handle null address fields correctly', () => {
    const mockData: NorisCommunalWasteTaxGrouped = {
      addresses: [
        {
          addressDetail: {
            street: null,
            orientationNumber: null,
          },
          containers: [
            {
              objem_nadoby: 240,
              pocet_nadob: 1,
              pocet_odvozov: 26,
              sadzba: 5.5,
              poplatok: 300,
              druh_nadoby: 'N24',
            },
          ],
        },
      ],
    } as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.addresses[0].addressDetail.street).toBeNull()
    expect(result.addresses[0].addressDetail.orientationNumber).toBeNull()
    expect(result.addresses[0].containers[0].poplatok).toBe(30_000)
  })

  it('should preserve all container properties except poplatok conversion', () => {
    const mockData: NorisCommunalWasteTaxGrouped = {
      addresses: [
        {
          addressDetail: {
            street: 'Test Street',
            orientationNumber: '10',
          },
          containers: [
            {
              objem_nadoby: 60,
              pocet_nadob: 2,
              pocet_odvozov: 104,
              sadzba: 2.5,
              poplatok: 150.5,
              druh_nadoby: 'N6',
            },
          ],
        },
      ],
    } as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    const container = result.addresses[0].containers[0]
    expect(container.objem_nadoby).toBe(60)
    expect(container.pocet_nadob).toBe(2)
    expect(container.pocet_odvozov).toBe(104)
    expect(container.sadzba).toBe(2.5)
    expect(container.druh_nadoby).toBe('N6')
    expect(container.poplatok).toBe(15_050)
  })

  it('should handle empty containers array', () => {
    const mockData = {
      addresses: [
        {
          addressDetail: {
            street: 'Test Street',
            orientationNumber: '1',
          },
          containers: [],
        },
      ],
    } as unknown as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.addresses).toHaveLength(1)
    expect(result.addresses[0].containers).toHaveLength(0)
  })

  it('should handle empty addresses array', () => {
    const mockData = {
      addresses: [],
    } as unknown as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.type).toBe(TaxType.KO)
    expect(result.addresses).toHaveLength(0)
  })

  it('should handle complex scenario with multiple addresses and multiple containers', () => {
    const mockData: NorisCommunalWasteTaxGrouped = {
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
            {
              objem_nadoby: 240,
              pocet_nadob: 1,
              pocet_odvozov: 26,
              sadzba: 5.5,
              poplatok: 500,
              druh_nadoby: 'N24',
            },
          ],
        },
        {
          addressDetail: {
            street: 'Druhá ulica',
            orientationNumber: '51',
          },
          containers: [
            {
              objem_nadoby: 60,
              pocet_nadob: 1,
              pocet_odvozov: 104,
              sadzba: 2.5,
              poplatok: 150.5,
              druh_nadoby: 'N6',
            },
          ],
        },
      ],
    } as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.type).toBe(TaxType.KO)
    expect(result.addresses).toHaveLength(2)
    expect(result.addresses[0].containers).toHaveLength(2)
    expect(result.addresses[1].containers).toHaveLength(1)

    expect(result.addresses[0].containers[0].poplatok).toBe(22_433)
    expect(result.addresses[0].containers[1].poplatok).toBe(50_000)

    expect(result.addresses[1].containers[0].poplatok).toBe(15_050)
  })

  it('should handle poplatok with zero value', () => {
    const mockData: NorisCommunalWasteTaxGrouped = {
      addresses: [
        {
          addressDetail: {
            street: 'Test Street',
            orientationNumber: '1',
          },
          containers: [
            {
              objem_nadoby: 120,
              pocet_nadob: 1,
              pocet_odvozov: 52,
              sadzba: 4.314,
              poplatok: 0,
              druh_nadoby: 'N12',
            },
          ],
        },
      ],
    } as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.addresses[0].containers[0].poplatok).toBe(0)
  })

  it('should handle poplatok with very small decimal values', () => {
    const mockData: NorisCommunalWasteTaxGrouped = {
      addresses: [
        {
          addressDetail: {
            street: 'Test Street',
            orientationNumber: '1',
          },
          containers: [
            {
              objem_nadoby: 120,
              pocet_nadob: 1,
              pocet_odvozov: 52,
              sadzba: 4.314,
              poplatok: 0.01,
              druh_nadoby: 'N12',
            },
          ],
        },
      ],
    } as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.addresses[0].containers[0].poplatok).toBe(1)
  })

  it('should handle poplatok with large values', () => {
    const mockData: NorisCommunalWasteTaxGrouped = {
      addresses: [
        {
          addressDetail: {
            street: 'Test Street',
            orientationNumber: '1',
          },
          containers: [
            {
              objem_nadoby: 120,
              pocet_nadob: 1,
              pocet_odvozov: 52,
              sadzba: 4.314,
              poplatok: 9999.99,
              druh_nadoby: 'N12',
            },
          ],
        },
      ],
    } as NorisCommunalWasteTaxGrouped

    const result = mapNorisToCommunalWasteDatabaseDetail(mockData)

    expect(result.addresses[0].containers[0].poplatok).toBe(999_999)
  })
})

/* eslint-enable no-secrets/no-secrets */
