import { NorisTaxPayersDto } from '../../noris/noris.dto'
import { taxDetail } from '../utils/tax-detail.helper'

describe('taxDetail', () => {
  it('should process complete tax data for all types', () => {
    const mockData: NorisTaxPayersDto = {
      // Apartment (byt) data
      det_zaklad_dane_byt: '100,00',
      det_dan_byty_byt: '10,00',
      det_zaklad_dane_nebyt: '200,00',
      det_dan_byty_nebyt: '20,00',

      // Ground (pozemky) data
      det_pozemky_ZAKLAD_A: '300,00',
      det_pozemky_DAN_A: '30,00',
      det_pozemky_VYMERA_A: '150',
      det_pozemky_ZAKLAD_B: '400,00',
      det_pozemky_DAN_B: '40,00',
      det_pozemky_VYMERA_B: '200',

      // Construction (stavba) data
      det_stavba_ZAKLAD_A: '500,00',
      det_stavba_DAN_A: '50,00',
      det_stavba_j_ZAKLAD_H: '600,00',
      det_stavba_j_DAN_H: '60,00',
    } as NorisTaxPayersDto

    const result = taxDetail(mockData, 1)

    // Test apartment entries
    expect(result).toContainEqual({
      taxId: 1,
      areaType: 'byt',
      type: 'APARTMENT',
      base: 10_000, // 100,00 converted to cents
      amount: 1000,
      area: null,
    })

    expect(result).toContainEqual({
      taxId: 1,
      areaType: 'nebyt',
      type: 'APARTMENT',
      base: 20_000,
      amount: 2000,
      area: null,
    })

    // Test ground entries
    expect(result).toContainEqual({
      taxId: 1,
      areaType: 'A',
      type: 'GROUND',
      base: 30_000,
      amount: 3000,
      area: '150',
    })

    expect(result).toContainEqual({
      taxId: 1,
      areaType: 'B',
      type: 'GROUND',
      base: 40_000,
      amount: 4000,
      area: '200',
    })

    // Test construction entries
    expect(result).toContainEqual({
      taxId: 1,
      areaType: 'A',
      type: 'CONSTRUCTION',
      base: 50_000,
      amount: 5000,
      area: null,
    })
  })

  it('should handle missing data with zero values', () => {
    const mockData: NorisTaxPayersDto = {
      det_zaklad_dane_byt: '',
      det_dan_byty_byt: '',
    } as NorisTaxPayersDto

    const result = taxDetail(mockData, 1)

    expect(result.find((item) => item.areaType === 'byt')).toEqual({
      taxId: 1,
      areaType: 'byt',
      type: 'APARTMENT',
      base: 0,
      amount: 0,
      area: null,
    })
  })

  it('should process all ground types (A through H)', () => {
    const mockData: NorisTaxPayersDto = {
      det_pozemky_ZAKLAD_A: '100,00',
      det_pozemky_DAN_A: '10,00',
      det_pozemky_VYMERA_A: '50',
      det_pozemky_ZAKLAD_H: '800,00',
      det_pozemky_DAN_H: '80,00',
      det_pozemky_VYMERA_H: '400',
    } as NorisTaxPayersDto

    const result = taxDetail(mockData, 1)
    const groundEntries = result.filter((item) => item.type === 'GROUND')

    expect(groundEntries).toHaveLength(8) // A through H
    expect(groundEntries[0]).toEqual({
      taxId: 1,
      areaType: 'A',
      type: 'GROUND',
      base: 10_000,
      amount: 1000,
      area: '50',
    })
  })

  it('should process all construction types including special cases', () => {
    const mockData: NorisTaxPayersDto = {
      det_stavba_ZAKLAD_A: '100,00',
      det_stavba_DAN_A: '10,00',
      det_stavba_j_ZAKLAD_H: '200,00',
      det_stavba_j_DAN_H: '20,00',
      det_stavba_j_ZAKLAD_I: '300,00',
      det_stavba_j_DAN_I: '30,00',
    } as NorisTaxPayersDto

    const result = taxDetail(mockData, 1)
    const constructionEntries = result.filter(
      (item) => item.type === 'CONSTRUCTION',
    )

    expect(constructionEntries).toHaveLength(10) // A through G + jH + jI + H
  })

  it('should handle decimal numbers with commas correctly', () => {
    const mockData: NorisTaxPayersDto = {
      det_zaklad_dane_byt: '1,50',
      det_dan_byty_byt: '0,75',
    } as NorisTaxPayersDto

    const result = taxDetail(mockData, 1)

    expect(result.find((item) => item.areaType === 'byt')).toEqual({
      taxId: 1,
      areaType: 'byt',
      type: 'APARTMENT',
      base: 150,
      amount: 75,
      area: null,
    })
  })

  it('should return correct total number of entries', () => {
    const mockData = {} as NorisTaxPayersDto
    const result = taxDetail(mockData, 1)

    // 8 (ground) + 10 (construction) + 2 (apartment) = 20 total items
    expect(result).toHaveLength(20)
  })

  it('should use provided taxId for all entries', () => {
    const mockData = {} as NorisTaxPayersDto
    const taxId = 12_345
    const result = taxDetail(mockData, taxId)

    expect(result.every((item) => item.taxId === taxId)).toBe(true)
  })
})
