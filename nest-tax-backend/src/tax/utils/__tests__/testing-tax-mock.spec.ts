import { randomBytes } from 'node:crypto'

import { TaxAdministrator, TaxType } from '@prisma/client'

import { RequestAdminCreateTestingTaxNorisData } from '../../../admin/dtos/requests.dto'
import { DeliveryMethod } from '../../../noris/types/noris.enums'
import {
  createTestingCommunalWasteTaxMock,
  createTestingRealEstateTaxMock,
} from '../testing-tax-mock'

jest.mock('node:crypto', () => ({
  randomBytes: jest.fn(),
}))

const mockRandomBytes = randomBytes as jest.MockedFunction<typeof randomBytes>

describe('testing-tax-mock', () => {
  let mockTaxAdministrator: TaxAdministrator
  let mockNorisData: RequestAdminCreateTestingTaxNorisData

  beforeEach(() => {
    jest.clearAllMocks()

    mockRandomBytes.mockReturnValue(
      Buffer.from('abcd1234', 'hex') as unknown as ReturnType<
        typeof randomBytes
      >,
    )

    mockTaxAdministrator = {
      id: 123,
      name: 'Test Tax Administrator',
      email: 'taxadmin@test.sk',
      phoneNumber: '+421900123456',
      externalId: '42',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }

    mockNorisData = {
      deliveryMethod: DeliveryMethod.EDESK,
      fakeBirthNumber: '9001011234',
      nameSurname: 'Ján Testovací',
      taxTotal: '150,00',
      dateTaxRuling: new Date('2024-01-15'),
      variableSymbol: '2024001',
      alreadyPaid: 0,
      isCancelled: false,
    }
  })

  describe('createTestingRealEstateTaxMock', () => {
    const testCases = [
      { taxTotal: '150,00', description: 'standard amount' },
      { taxTotal: '100,50', description: 'amount with cents' },
      { taxTotal: '1234,56', description: 'large amount' },
      { taxTotal: '0,01', description: 'minimal amount' },
    ]

    it.each(testCases)(
      'should create valid real estate tax mock for $description',
      ({ taxTotal }) => {
        mockNorisData.taxTotal = taxTotal
        const year = 2024

        const result = createTestingRealEstateTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          year,
        )

        expect(result).toBeDefined()
        expect(result.ICO_RC).toBe(mockNorisData.fakeBirthNumber)
        expect(result.subjekt_nazev).toBe(mockNorisData.nameSurname)
        expect(result.dan_spolu).toBe(taxTotal)
        expect(result.rok).toBe(year)
        expect(result.datum_platnosti).toBe(mockNorisData.dateTaxRuling)
      },
    )

    it('should correctly set payment data fields', () => {
      const result = createTestingRealEstateTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      expect(result.variabilny_symbol).toBe(mockNorisData.variableSymbol)
      expect(result.uhrazeno).toBe(mockNorisData.alreadyPaid)
    })

    it('should correctly set tax administrator data', () => {
      const result = createTestingRealEstateTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      expect(result.vyb_email).toBe(mockTaxAdministrator.email)
      expect(result.cislo_poradace).toBe(+mockTaxAdministrator.externalId)
      expect(result.vyb_id).toBe(mockTaxAdministrator.id)
      expect(result.vyb_nazov).toBe(mockTaxAdministrator.name)
      expect(result.vyb_telefon_prace).toBe(mockTaxAdministrator.phoneNumber)
    })

    it('should generate a random case number using randomBytes', () => {
      const result = createTestingRealEstateTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      expect(randomBytes).toHaveBeenCalledWith(4)
      expect(result.cislo_konania).toBe('abcd1234')
    })

    describe('installment calculations', () => {
      it('should split tax total into 3 installments that sum correctly', () => {
        mockNorisData.taxTotal = '150.00'

        const result = createTestingRealEstateTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        const spl1 = parseFloat(result.SPL4_1.replace(',', '.'))
        const spl2 = parseFloat(result.SPL4_2.replace(',', '.'))
        const spl3 = parseFloat(result.SPL4_3.replace(',', '.'))

        expect(spl1 + spl2 + spl3).toBeCloseTo(150, 2)
        expect(result.SPL4_4).toBe('')
      })

      it('should have correct installment format (comma as decimal separator)', () => {
        const result = createTestingRealEstateTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.SPL4_1).toMatch(/^\d+,\d{2}$/)
        expect(result.SPL4_2).toMatch(/^\d+,\d{2}$/)
        expect(result.SPL4_3).toMatch(/^\d+,\d{2}$/)
        expect(result.SPL4_4).toBe('')
      })

      it.each([
        { taxTotal: '100.50', expected: 100.5 },
        { taxTotal: '333.33', expected: 333.33 },
        { taxTotal: '1000.00', expected: 1000 },
      ])(
        'should calculate installments correctly for taxTotal=$taxTotal',
        ({ taxTotal, expected }) => {
          mockNorisData.taxTotal = taxTotal

          const result = createTestingRealEstateTaxMock(
            mockNorisData,
            mockTaxAdministrator,
            2024,
          )

          const spl1 = parseFloat(result.SPL4_1.replace(',', '.'))
          const spl2 = parseFloat(result.SPL4_2.replace(',', '.'))
          const spl3 = parseFloat(result.SPL4_3.replace(',', '.'))

          expect(spl1 + spl2 + spl3).toBeCloseTo(expected, 2)
        },
      )

      it('should have non-empty text labels for first 3 installments', () => {
        const result = createTestingRealEstateTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.TXTSPL4_1).toBeTruthy()
        expect(result.TXTSPL4_2).toBeTruthy()
        expect(result.TXTSPL4_3).toBeTruthy()
        expect(result.TXTSPL4_4).toBe('')
      })

      it('should set SPL1 to total tax amount', () => {
        mockNorisData.taxTotal = '250,75'

        const result = createTestingRealEstateTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.SPL1).toBe('250,75')
        expect(result.TXTSPL1).toContain('TEST')
      })
    })

    describe('mock data fields', () => {
      it('should populate all required address fields with test data', () => {
        const result = createTestingRealEstateTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.ulica_tb_cislo).toBe('test ulica cislo')
        expect(result.psc_ref_tb).toBe('test psc')
        expect(result.obec_nazev_tb).toBe('test obec')
      })

      it('should set numeric fields with correct values', () => {
        const result = createTestingRealEstateTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.cislo_subjektu).toBe(123_456)
        expect(result.subjekt_refer).toBe('123456789')
      })

      it('should set akt_datum to current date in YYYY-MM-DD format', () => {
        const result = createTestingRealEstateTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.akt_datum).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })

      it('should populate tax detail fields with mock numeric values', () => {
        const result = createTestingRealEstateTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        // Check a sample of detail fields
        expect(result.det_zaklad_dane_byt).toBe('100,50')
        expect(result.det_dan_byty_byt).toBe('10,50')
        expect(result.det_pozemky_ZAKLAD_A).toBe('300,25')
        expect(result.det_stavba_ZAKLAD_A).toBe('600,25')
      })
    })
  })

  // eslint-disable-next-line no-secrets/no-secrets
  describe('createTestingCommunalWasteTaxMock', () => {
    const testCases = [
      { taxTotal: '120,00', description: 'standard amount' },
      { taxTotal: '200,40', description: 'amount with cents' },
      { taxTotal: '1500,00', description: 'large amount' },
      { taxTotal: '0,04', description: 'minimal amount' },
    ]

    it.each(testCases)(
      'should create valid communal waste tax mock for $description',
      ({ taxTotal }) => {
        mockNorisData.taxTotal = taxTotal
        const year = 2024

        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          year,
        )

        expect(result).toBeDefined()
        expect(result.type).toBe(TaxType.KO)
        expect(result.ICO_RC).toBe(mockNorisData.fakeBirthNumber)
        expect(result.subjekt_nazev).toBe(mockNorisData.nameSurname)
        expect(result.dan_spolu).toBe(taxTotal)
        expect(result.rok).toBe(year)
        expect(result.datum_platnosti).toBe(mockNorisData.dateTaxRuling)
      },
    )

    it('should set type to KO (communal waste)', () => {
      const result = createTestingCommunalWasteTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      expect(result.type).toBe(TaxType.KO)
    })

    it('should correctly set payment data fields', () => {
      const result = createTestingCommunalWasteTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      expect(result.variabilny_symbol).toBe(mockNorisData.variableSymbol)
      expect(result.uhrazeno).toBe(mockNorisData.alreadyPaid)
    })

    it('should correctly set tax administrator data', () => {
      const result = createTestingCommunalWasteTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      expect(result.vyb_email).toBe(mockTaxAdministrator.email)
      expect(result.cislo_poradace).toBe(+mockTaxAdministrator.externalId)
      expect(result.vyb_id).toBe(mockTaxAdministrator.id)
      expect(result.vyb_nazov).toBe(mockTaxAdministrator.name)
      expect(result.vyb_telefon_prace).toBe(mockTaxAdministrator.phoneNumber)
    })

    it('should generate a random case number using randomBytes', () => {
      const result = createTestingCommunalWasteTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      expect(randomBytes).toHaveBeenCalledWith(4)
      expect(result.cislo_konania).toBe('abcd1234')
    })

    describe('installment calculations', () => {
      it('should split tax total into 4 installments that sum correctly', () => {
        mockNorisData.taxTotal = '200.00'

        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        const spl1 = parseFloat(result.SPL4_1.replace(',', '.'))
        const spl2 = parseFloat(result.SPL4_2.replace(',', '.'))
        const spl3 = parseFloat(result.SPL4_3.replace(',', '.'))
        const spl4 = parseFloat(result.SPL4_4.replace(',', '.'))

        expect(spl1 + spl2 + spl3 + spl4).toBeCloseTo(200, 2)
      })

      it('should have correct installment format (comma as decimal separator)', () => {
        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.SPL4_1).toMatch(/^\d+,\d{2}$/)
        expect(result.SPL4_2).toMatch(/^\d+,\d{2}$/)
        expect(result.SPL4_3).toMatch(/^\d+,\d{2}$/)
        expect(result.SPL4_4).toMatch(/^\d+,\d{2}$/)
      })

      it.each([
        { taxTotal: '100.00', expected: 100 },
        { taxTotal: '444.44', expected: 444.44 },
        { taxTotal: '1200.00', expected: 1200 },
      ])(
        'should calculate installments correctly for taxTotal=$taxTotal',
        ({ taxTotal, expected }) => {
          mockNorisData.taxTotal = taxTotal

          const result = createTestingCommunalWasteTaxMock(
            mockNorisData,
            mockTaxAdministrator,
            2024,
          )

          const spl1 = parseFloat(result.SPL4_1.replace(',', '.'))
          const spl2 = parseFloat(result.SPL4_2.replace(',', '.'))
          const spl3 = parseFloat(result.SPL4_3.replace(',', '.'))
          const spl4 = parseFloat(result.SPL4_4.replace(',', '.'))

          expect(spl1 + spl2 + spl3 + spl4).toBeCloseTo(expected, 2)
        },
      )

      it('should have non-empty text labels for all 4 installments', () => {
        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.TXTSPL4_1).toBeTruthy()
        expect(result.TXTSPL4_2).toBeTruthy()
        expect(result.TXTSPL4_3).toBeTruthy()
        expect(result.TXTSPL4_4).toBeTruthy()
      })

      it('should set SPL1 to total tax amount', () => {
        mockNorisData.taxTotal = '180,60'

        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.SPL1).toBe('180,60')
        expect(result.TXTSPL1).toContain('TEST')
      })
    })

    describe('communal waste specific fields', () => {
      it('should populate addresses array with test data', () => {
        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.addresses).toBeDefined()
        expect(result.addresses).toHaveLength(1)
      })

      it('should have correct address detail structure', () => {
        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        const address = result.addresses[0]
        expect(address.addressDetail.street).toBe('Testovacia ulica')
        expect(address.addressDetail.orientationNumber).toBe('10A')
      })

      it('should have valid container data', () => {
        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        const container = result.addresses[0].containers[0]
        expect(container.objem_nadoby).toBe(120)
        expect(container.pocet_nadob).toBe(1)
        expect(container.pocet_odvozov).toBe(52)
        expect(container.sadzba).toBe(0.5)
        expect(container.druh_nadoby).toBe('KLASICKA_NADOBA')
      })

      it('should set container poplatok to match total in cents', () => {
        mockNorisData.taxTotal = '150.00'

        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        const container = result.addresses[0].containers[0]
        const totalInCents = Math.round(150 * 100)

        expect(container.poplatok).toBe(totalInCents)
      })
    })

    describe('common base fields', () => {
      it('should populate all required address fields with test data', () => {
        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.ulica_tb_cislo).toBe('test ulica cislo')
        expect(result.psc_ref_tb).toBe('test psc')
        expect(result.obec_nazev_tb).toBe('test obec')
      })

      it('should set numeric fields with correct values', () => {
        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.cislo_subjektu).toBe(123_456)
        expect(result.subjekt_refer).toBe('123456789')
      })

      it('should set akt_datum to current date in YYYY-MM-DD format', () => {
        const result = createTestingCommunalWasteTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          2024,
        )

        expect(result.akt_datum).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })
  })

  describe('comparison between tax types', () => {
    it('should have 3 installments for real estate tax and 4 for communal waste', () => {
      const realEstate = createTestingRealEstateTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )
      const communalWaste = createTestingCommunalWasteTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      const communalWasteSpl4 = parseFloat(
        communalWaste.SPL4_4.replace(',', '.'),
      )

      expect(realEstate.SPL4_4).toBe('')
      expect(communalWasteSpl4).toBeGreaterThan(0)
    })

    it('should share common base fields structure', () => {
      const realEstate = createTestingRealEstateTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )
      const communalWaste = createTestingCommunalWasteTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      // Common fields should match
      expect(realEstate.ICO_RC).toBe(communalWaste.ICO_RC)
      expect(realEstate.subjekt_nazev).toBe(communalWaste.subjekt_nazev)
      expect(realEstate.dan_spolu).toBe(communalWaste.dan_spolu)
      expect(realEstate.vyb_id).toBe(communalWaste.vyb_id)
    })

    it('should use same randomBytes call for case number generation', () => {
      mockRandomBytes.mockClear()

      createTestingRealEstateTaxMock(mockNorisData, mockTaxAdministrator, 2024)

      expect(randomBytes).toHaveBeenCalledTimes(1)

      mockRandomBytes.mockClear()

      createTestingCommunalWasteTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      expect(randomBytes).toHaveBeenCalledTimes(1)
    })
  })

  describe('edge cases', () => {
    it('should handle zero tax amount for real estate', () => {
      mockNorisData.taxTotal = '0,00'

      const result = createTestingRealEstateTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      expect(result.dan_spolu).toBe('0,00')
      expect(result.SPL4_1).toBe('0,00')
      expect(result.SPL4_2).toBe('0,00')
      expect(result.SPL4_3).toBe('0,00')
    })

    it('should handle zero tax amount for communal waste', () => {
      mockNorisData.taxTotal = '0,00'

      const result = createTestingCommunalWasteTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      expect(result.dan_spolu).toBe('0,00')
      expect(result.SPL4_1).toBe('0,00')
      expect(result.SPL4_2).toBe('0,00')
      expect(result.SPL4_3).toBe('0,00')
      expect(result.SPL4_4).toBe('0,00')
    })

    it('should handle amounts that do not divide evenly', () => {
      mockNorisData.taxTotal = '100.01'

      const result = createTestingRealEstateTaxMock(
        mockNorisData,
        mockTaxAdministrator,
        2024,
      )

      const spl1 = parseFloat(result.SPL4_1.replace(',', '.'))
      const spl2 = parseFloat(result.SPL4_2.replace(',', '.'))
      const spl3 = parseFloat(result.SPL4_3.replace(',', '.'))

      expect(spl1 + spl2 + spl3).toBeCloseTo(100.01, 2)
    })

    it('should handle different year values', () => {
      const years = [2020, 2024, 2025, 2030]

      years.forEach((year) => {
        const result = createTestingRealEstateTaxMock(
          mockNorisData,
          mockTaxAdministrator,
          year,
        )
        expect(result.rok).toBe(year)
      })
    })
  })
})
