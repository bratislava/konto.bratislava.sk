import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import type { LogNestErrorEqualExpectation } from '@bratislava/log-nest/testing'
import { createMock } from '@golevelup/ts-vitest'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ZodError } from 'zod'

import { expectAny, expectStringContaining } from '../../../__tests__/matchers'
import alertReporting from '../../../utils/constants/error.alerts'
import { CustomErrorNorisTypesEnum } from '../../noris.errors'
import {
  NorisCommunalWasteTaxSchema,
  NorisRealEstateTaxSchema,
  NorisTaxPaymentSchema,
} from '../../types/noris.schema'
import { NorisValidatorSubservice } from '../noris-validator.subservice'
import {
  allNorisCommunalWasteTaxes,
  invalidNorisCommunalWasteTax1,
  invalidNorisCommunalWasteTax3,
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

const errorFactoryService = new ErrorFactoryService({ alertReporting })

// The message is zod's serialized issue list; tests that know the invalid field override it.
const expectedValidationError: LogNestErrorEqualExpectation = {
  status: HttpStatus.BAD_REQUEST,
  errorEnum: CustomErrorNorisTypesEnum.VALIDATE_NORIS_DATA_ERROR,
  message: expectStringContaining('Invalid'),
  alert: true,
  error: expectAny<ZodError>(ZodError),
}

describe('NorisValidatorSubservice', () => {
  let service: NorisValidatorSubservice
  let logger: LineLoggerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LineLoggerService,
          useValue: createMock<LineLoggerService>(),
        },
        NorisValidatorSubservice,
        { provide: ErrorFactoryService, useValue: errorFactoryService },
      ],
    }).compile()
    service = module.get<NorisValidatorSubservice>(NorisValidatorSubservice)
    logger = module.get(LineLoggerService)
  })

  it('should alert in grafana on noris validation errors', () => {
    expect(alertReporting).toContain(
      CustomErrorNorisTypesEnum.VALIDATE_NORIS_DATA_ERROR,
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateSingleNorisData', () => {
    describe('payments', () => {
      describe('valid', () => {
        it('should validate valid payment', () => {
          const result = service.validateSingleNorisData(
            NorisTaxPaymentSchema,
            testPaymentValid,
          )
          expect(result).toEqual(testPaymentValid)
        })

        it('should not throw for string value of uhrazeno, and parse it as number', () => {
          const result = service.validateSingleNorisData(
            NorisTaxPaymentSchema,
            testPaymentStringUhrazeno,
          )
          expect(result).toEqual({
            ...testPaymentStringUhrazeno,
            uhrazeno: 1000,
          })
        })
      })

      describe('invalid', () => {
        it('should throw error for invalid variable symbol, and alert in grafana', () => {
          expect(() => {
            service.validateSingleNorisData(
              NorisTaxPaymentSchema,
              testPaymentInvalidVariabilnySymbol,
            )
          }).toThrowEqualLogNestError({
            ...expectedValidationError,
            message: expectStringContaining('variabilny_symbol'),
          })
        })
      })
    })

    describe('real estate taxes', () => {
      describe('valid', () => {
        it('should validate valid real estate taxes', () => {
          validNorisRealEstateTaxes.forEach((tax) => {
            expect(() =>
              service.validateSingleNorisData(NorisRealEstateTaxSchema, tax),
            ).not.toThrow()
          })
        })

        it('should parse uhrazeno as number', () => {
          const result = service.validateSingleNorisData(
            NorisRealEstateTaxSchema,
            {
              ...testRealEstateTax3,
            },
          )
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
              service.validateSingleNorisData(NorisRealEstateTaxSchema, tax)
            }).toThrowEqualLogNestError(expectedValidationError)
          })
        })

        it('should throw error containing the field name that is invalid', () => {
          const validate = () =>
            service.validateSingleNorisData(
              NorisRealEstateTaxSchema,
              invalidNorisRealEstateTax1,
            )

          expect(validate).toThrowEqualLogNestError({
            ...expectedValidationError,
            message: expectStringContaining('variabilny_symbol'),
          })
        })
      })
    })

    describe('communal waste taxes', () => {
      describe('valid', () => {
        it('should validate valid communal waste taxes', () => {
          validNorisCommunalWasteTaxes.forEach((tax) => {
            expect(() =>
              service.validateSingleNorisData(NorisCommunalWasteTaxSchema, tax),
            ).not.toThrow()
          })
        })

        it('should parse uhrazeno as number', () => {
          const result = service.validateSingleNorisData(
            NorisCommunalWasteTaxSchema,
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

        it('should pass for cancelled tax as well', () => {
          const result = service.validateSingleNorisData(
            NorisCommunalWasteTaxSchema,
            {
              ...testCommunalWasteTax1,
              stav_dokladu: 'S',
            },
          )
          expect(result).toEqual({
            ...testCommunalWasteTax1,
            stav_dokladu: 'S',
          })
        })
      })

      describe('invalid', () => {
        it('should throw error for invalid tax', () => {
          invalidNorisCommunalWasteTaxes.forEach((tax) => {
            expect(() => {
              service.validateSingleNorisData(NorisCommunalWasteTaxSchema, tax)
            }).toThrowEqualLogNestError(expectedValidationError)
          })
        })

        it('should throw error containing the field name that is invalid', () => {
          const validate = () =>
            service.validateSingleNorisData(
              NorisCommunalWasteTaxSchema,
              invalidNorisCommunalWasteTax1,
            )

          expect(validate).toThrowEqualLogNestError({
            ...expectedValidationError,
            message: expectStringContaining('variabilny_symbol'),
          })
        })

        it('should throw for invalid stav_dokladu', () => {
          const invalidTax = {
            ...testCommunalWasteTax1,
            stav_dokladu: 'invalid',
          }
          expect(() => {
            service.validateSingleNorisData(
              NorisCommunalWasteTaxSchema,
              invalidTax,
            )
          }).toThrowEqualLogNestError({
            ...expectedValidationError,
            message: expectStringContaining('stav_dokladu'),
          })
        })

        it('should throw error for invalid forma_uhrady', () => {
          expect(() => {
            service.validateSingleNorisData(
              NorisCommunalWasteTaxSchema,
              invalidNorisCommunalWasteTax3,
            )
          }).toThrowEqualLogNestError({
            ...expectedValidationError,
            message: expectStringContaining('forma_uhrady'),
          })
        })
      })
    })
  })

  describe('validateNorisData with array', () => {
    it('should validate all payments, return only valid and error log the rest', () => {
      const result = service.validateNorisData(NorisTaxPaymentSchema, [
        testPaymentValid,
        testPaymentStringUhrazeno,
        testPaymentInvalidVariabilnySymbol,
      ])
      expect(result).toHaveLength(2)
      expect(result).toContainEqual(testPaymentValid)
      expect(result).toContainEqual({
        ...testPaymentStringUhrazeno,
        uhrazeno: 1000,
      })
      expect(result).not.toContainEqual(testPaymentInvalidVariabilnySymbol)

      expect(vi.mocked(logger.error).mock.calls).toEqual([
        [expect.toMatchLogNestError(expectedValidationError)],
      ])
    })

    it('should validate all real estate taxes, return only valid and error log the rest', () => {
      const result = service.validateNorisData(
        NorisRealEstateTaxSchema,
        allNorisRealEstateTaxes,
      )
      expect(result).toHaveLength(3)
      expect(result).toContainEqual(testRealEstateTax1)
      expect(result).toContainEqual(testRealEstateTax2)
      expect(result).toContainEqual({ ...testRealEstateTax3, uhrazeno: 450.75 })

      expect(vi.mocked(logger.error).mock.calls).toEqual(
        invalidNorisRealEstateTaxes.map((): unknown[] => [
          expect.toMatchLogNestError(expectedValidationError),
        ]),
      )
      // field name that is invalid
      expect(vi.mocked(logger.error)).toHaveBeenNthCalledWith(
        2,
        expect.toMatchLogNestError({
          message: expectStringContaining('det_pozemky_DAN_E'),
        }),
      )
    })

    it('should validate all communal waste taxes, return only valid and error log the rest', () => {
      const result = service.validateNorisData(
        NorisCommunalWasteTaxSchema,
        allNorisCommunalWasteTaxes,
      )
      expect(result).toHaveLength(6)
      expect(result).toContainEqual(testCommunalWasteTax1)
      expect(result).toContainEqual(testCommunalWasteTax2)
      expect(result).toContainEqual(testCommunalWasteTax3)
      expect(result).toContainEqual(testCommunalWasteTax4)
      expect(result).toContainEqual(testCommunalWasteTax5)
      expect(result).toContainEqual(testCommunalWasteTax6)

      expect(vi.mocked(logger.error).mock.calls).toEqual(
        invalidNorisCommunalWasteTaxes.map((): unknown[] => [
          expect.toMatchLogNestError(expectedValidationError),
        ]),
      )
      // field name that is invalid
      expect(vi.mocked(logger.error)).toHaveBeenNthCalledWith(
        2,
        expect.toMatchLogNestError({
          message: expectStringContaining('objem_nadoby'),
        }),
      )
    })
  })
})
