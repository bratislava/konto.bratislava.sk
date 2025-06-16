import { NorisTaxPayersDto } from '../../../noris/noris.dto'
import { AreaTypesEnum, mapNorisToTaxDetailData } from '../tax-detail.helper'

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
