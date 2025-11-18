import { HttpException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorSymbols } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import {
  NorisRawCommunalWasteTaxSchema,
  NorisRealEstateTaxSchema,
  NorisTaxPaymentSchema,
} from '../../types/noris.schema'
import { NorisValidatorSubservice } from '../noris-validator.subservice'
import {
  allNorisCommunalWasteTaxes,
  invalidNorisCommunalWasteTax1,
  invalidNorisCommunalWasteTaxes,
  testCommunalWasteTax1,
  testCommunalWasteTax2,
  testCommunalWasteTax3,
  testCommunalWasteTax4,
  testCommunalWasteTax5,
  testCommunalWasteTax6,
  validNorisCommunalWasteTaxes,
} from './data/test.communal-waste-tax'
import {
  testPaymentInvalidVariabilnySymbol,
  testPaymentNoVariableSymbol,
  testPaymentStringUhrazeno,
  testPaymentValid,
} from './data/test.payments'
import {
  allNorisRealEstateTaxes,
  invalidNorisRealEstateTax1,
  invalidNorisRealEstateTaxes,
  testRealEstateTax1,
  testRealEstateTax2,
  testRealEstateTax3,
  validNorisRealEstateTaxes,
} from './data/test.real-estate-tax'

describe('NorisValidatorSubservice', () => {
  let service: NorisValidatorSubservice

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NorisValidatorSubservice, ThrowerErrorGuard],
    }).compile()
    service = module.get<NorisValidatorSubservice>(NorisValidatorSubservice)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateNorisData', () => {
    describe('payments', () => {
      describe('valid', () => {
        it('should validate valid payment', () => {
          const result = service.validateNorisData(
            NorisTaxPaymentSchema,
            testPaymentValid,
          )
          expect(result).toEqual(testPaymentValid)
        })

        it('should not throw for string value of uhrazeno, and parse it as number', () => {
          const result = service.validateNorisData(
            NorisTaxPaymentSchema,
            testPaymentStringUhrazeno,
          )
          expect(result).toEqual({
            ...testPaymentStringUhrazeno,
            uhrazeno: 1000,
          })
        })

        it('should not throw for missing variable symbol', () => {
          const result = service.validateNorisData(
            NorisTaxPaymentSchema,
            testPaymentNoVariableSymbol,
          )
          expect(result).toEqual(testPaymentNoVariableSymbol)
        })
      })

      describe('invalid', () => {
        it('should throw error for invalid variable symbol, and alert in grafana', () => {
          expect(() => {
            service.validateNorisData(
              NorisTaxPaymentSchema,
              testPaymentInvalidVariabilnySymbol,
            )
          }).toThrow(HttpException)

          try {
            service.validateNorisData(
              NorisTaxPaymentSchema,
              testPaymentInvalidVariabilnySymbol,
            )
          } catch (error) {
            const response = (error as HttpException).getResponse() as Record<
              symbol | string,
              unknown
            >
            expect(response[ErrorSymbols.alert]).toBe(1)
          }
        })
      })
    })

    describe('real estate taxes', () => {
      describe('valid', () => {
        it('should validate valid real estate taxes', () => {
          validNorisRealEstateTaxes.forEach((tax) => {
            service.validateNorisData(NorisRealEstateTaxSchema, tax)
            expect(true).toBe(true)
          })
        })

        it('should parse uhrazeno as number', () => {
          const result = service.validateNorisData(NorisRealEstateTaxSchema, {
            ...testRealEstateTax3,
          })
          expect(result).toEqual({
            ...testRealEstateTax3,
            uhrazeno: 450.75,
          })
        })
      })

      describe('invalid', () => {
        it('should throw error for invalid tax', () => {
          invalidNorisRealEstateTaxes.forEach((tax) => {
            expect(() => {
              service.validateNorisData(NorisRealEstateTaxSchema, tax)
            }).toThrow(HttpException)

            try {
              service.validateNorisData(NorisRealEstateTaxSchema, tax)
            } catch (error) {
              const response = (error as HttpException).getResponse() as Record<
                symbol | string,
                unknown
              >
              expect(response[ErrorSymbols.alert]).toBe(1)
            }
          })
        })

        it('should throw error containing the field name that is invalid', () => {
          expect(() => {
            service.validateNorisData(
              NorisRealEstateTaxSchema,
              invalidNorisRealEstateTax1,
            )
          }).toThrow(HttpException)

          try {
            service.validateNorisData(
              NorisRealEstateTaxSchema,
              invalidNorisRealEstateTax1,
            )
          } catch (error) {
            const response = (error as HttpException).getResponse() as Record<
              symbol | string,
              unknown
            >
            expect(response[ErrorSymbols.alert]).toBe(1)
            expect(response.message).toContain('variabilny_symbol')
          }
        })
      })
    })

    describe('communal waste taxes', () => {
      describe('valid', () => {
        it('should validate valid communal waste taxes', () => {
          validNorisCommunalWasteTaxes.forEach((tax) => {
            service.validateNorisData(NorisRawCommunalWasteTaxSchema, tax)
            expect(true).toBe(true)
          })
        })

        it('should parse uhrazeno as number', () => {
          const result = service.validateNorisData(
            NorisRawCommunalWasteTaxSchema,
            {
              ...testCommunalWasteTax1,
              uhrazeno: '448.66',
            },
          )
          expect(result).toEqual({
            ...testCommunalWasteTax1,
            uhrazeno: 448.66,
          })
        })
      })

      describe('invalid', () => {
        it('should throw error for invalid tax', () => {
          invalidNorisCommunalWasteTaxes.forEach((tax) => {
            expect(() => {
              service.validateNorisData(NorisRawCommunalWasteTaxSchema, tax)
            }).toThrow(HttpException)

            try {
              service.validateNorisData(NorisRawCommunalWasteTaxSchema, tax)
            } catch (error) {
              const response = (error as HttpException).getResponse() as Record<
                symbol | string,
                unknown
              >
              expect(response[ErrorSymbols.alert]).toBe(1)
            }
          })
        })

        it('should throw error containing the field name that is invalid', () => {
          expect(() => {
            service.validateNorisData(
              NorisRawCommunalWasteTaxSchema,
              invalidNorisCommunalWasteTax1,
            )
          }).toThrow(HttpException)

          try {
            service.validateNorisData(
              NorisRawCommunalWasteTaxSchema,
              invalidNorisCommunalWasteTax1,
            )
          } catch (error) {
            const response = (error as HttpException).getResponse() as Record<
              symbol | string,
              unknown
            >
            expect(response[ErrorSymbols.alert]).toBe(1)
            expect(response.message).toContain('variabilny_symbol')
          }
        })
      })
    })
  })

  describe('validateNorisData with array', () => {
    it('should validate all payments, return only valid and error log the rest', () => {
      const errorLogSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => {})
      const result = service.validateNorisData(NorisTaxPaymentSchema, [
        testPaymentValid,
        testPaymentStringUhrazeno,
        testPaymentNoVariableSymbol,
        testPaymentInvalidVariabilnySymbol,
      ])
      expect(result).toHaveLength(3)
      expect(result).toContainEqual(testPaymentValid)
      expect(result).toContainEqual({
        ...testPaymentStringUhrazeno,
        uhrazeno: 1000,
      })
      expect(result).toContainEqual(testPaymentNoVariableSymbol)
      expect(result).not.toContainEqual(testPaymentInvalidVariabilnySymbol)

      expect(errorLogSpy).toHaveBeenCalledTimes(1)
      expect(errorLogSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            [ErrorSymbols.alert]: 1,
          }),
        }),
      )
    })

    it('should validate all real estate taxes, return only valid and error log the rest', () => {
      const errorLogSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => {})
      const result = service.validateNorisData(
        NorisRealEstateTaxSchema,
        allNorisRealEstateTaxes,
      )
      expect(result).toHaveLength(3)
      expect(result).toContainEqual(testRealEstateTax1)
      expect(result).toContainEqual(testRealEstateTax2)
      expect(result).toContainEqual({ ...testRealEstateTax3, uhrazeno: 450.75 })

      expect(errorLogSpy).toHaveBeenCalledTimes(
        invalidNorisRealEstateTaxes.length,
      )
      expect(errorLogSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            [ErrorSymbols.alert]: 1,
          }),
        }),
      )
      expect(errorLogSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            message: expect.stringContaining('det_pozemky_DAN_E'), // It should contain the field name that is invalid
          }),
        }),
      )
    })

    it('should validate all communal waste taxes, return only valid and error log the rest', () => {
      const errorLogSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => {})
      const result = service.validateNorisData(
        NorisRawCommunalWasteTaxSchema,
        allNorisCommunalWasteTaxes,
      )
      expect(result).toHaveLength(6)
      expect(result).toContainEqual(testCommunalWasteTax1)
      expect(result).toContainEqual(testCommunalWasteTax2)
      expect(result).toContainEqual(testCommunalWasteTax3)
      expect(result).toContainEqual(testCommunalWasteTax4)
      expect(result).toContainEqual(testCommunalWasteTax5)
      expect(result).toContainEqual(testCommunalWasteTax6)

      expect(errorLogSpy).toHaveBeenCalledTimes(
        invalidNorisCommunalWasteTaxes.length,
      )
      expect(errorLogSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            [ErrorSymbols.alert]: 1,
          }),
        }),
      )
      expect(errorLogSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          response: expect.objectContaining({
            message: expect.stringContaining('objem_nadoby'), // It should contain the field name that is invalid
          }),
        }),
      )
    })
  })
})
