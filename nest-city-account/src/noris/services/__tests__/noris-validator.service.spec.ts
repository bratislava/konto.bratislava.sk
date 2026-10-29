import { ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import type { LogNestErrorEqualExpectation } from '@bratislava/log-nest/testing'
import { createMock } from '@golevelup/ts-vitest'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import z from 'zod'

import { expectAny, expectStringContaining } from '../../../__tests__/matchers'
import alertReporting from '../../../utils/constants/error.alerts'
import { CustomErrorNorisTypesEnum } from '../../noris.errors'
import { EdeskRecordSchema } from '../../types/noris.types'
import { NorisValidatorService } from '../noris-validator.service'
import {
  allEdeskRecords,
  edeskRecordWithNewlineUri,
  edeskRecordWithTabUri,
  edeskRecordWithWhitespaceUri,
  invalidEdeskRecordMissingIdNoris,
  invalidEdeskRecordMissingUriGenerated,
  invalidEdeskRecords,
  invalidEdeskRecordWrongIdNorisType,
  invalidEdeskRecordWrongUriGeneratedType,
  testEdeskRecord1,
  testEdeskRecord2,
  validEdeskRecords,
} from './data/test.edesk-record'

// The message is zod's own issue dump, so only a distinctive part of it is asserted.
const expectValidationError = (messagePart?: string): LogNestErrorEqualExpectation => ({
  status: HttpStatus.BAD_REQUEST,
  errorEnum: CustomErrorNorisTypesEnum.VALIDATE_NORIS_DATA_ERROR,
  message: messagePart ? expectStringContaining(messagePart) : expectAny<string>(String),
  console: { issues: expectAny<unknown[]>(Array) },
  error: expectAny<z.ZodError>(z.ZodError),
})

describe('NorisValidatorService', () => {
  let service: NorisValidatorService
  let logger: LineLoggerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LineLoggerService, useValue: createMock<LineLoggerService>() },
        NorisValidatorService,
        { provide: ErrorFactoryService, useValue: new ErrorFactoryService({ alertReporting }) },
      ],
    }).compile()
    service = module.get<NorisValidatorService>(NorisValidatorService)
    logger = module.get(LineLoggerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateNorisData', () => {
    describe('Edesk records', () => {
      describe('valid', () => {
        it('should validate valid edesk record', () => {
          const result = service.validateNorisData(EdeskRecordSchema, testEdeskRecord1)
          expect(result).toEqual(testEdeskRecord1)
        })

        it('should validate all valid edesk records', () => {
          validEdeskRecords.forEach((record) => {
            const result = service.validateNorisData(EdeskRecordSchema, record)
            expect(result).toEqual(record)
          })
        })
      })

      describe('invalid', () => {
        it('should throw validation error for invalid record', () => {
          invalidEdeskRecords.forEach((record) => {
            expect(() => {
              service.validateNorisData(EdeskRecordSchema, record)
            }).toThrowEqualLogNestError(expectValidationError())
          })
        })

        it('should throw error containing id_noris when missing', () => {
          expect(() => {
            service.validateNorisData(EdeskRecordSchema, invalidEdeskRecordMissingIdNoris)
          }).toThrowEqualLogNestError(expectValidationError('id_noris'))
        })

        it('should throw error containing uri_generated when missing', () => {
          expect(() => {
            service.validateNorisData(EdeskRecordSchema, invalidEdeskRecordMissingUriGenerated)
          }).toThrowEqualLogNestError(expectValidationError('uri_generated'))
        })

        it('should throw for wrong type of id_noris', () => {
          expect(() => {
            service.validateNorisData(EdeskRecordSchema, invalidEdeskRecordWrongIdNorisType)
          }).toThrowEqualLogNestError(expectValidationError('id_noris'))
        })

        it('should throw for wrong type of uri_generated', () => {
          expect(() => {
            service.validateNorisData(EdeskRecordSchema, invalidEdeskRecordWrongUriGeneratedType)
          }).toThrowEqualLogNestError(expectValidationError('uri_generated'))
        })
      })
    })

    describe('URI sanitization', () => {
      it('should strip whitespace and set uri_new when URI contains spaces', () => {
        const result = service.validateNorisData(EdeskRecordSchema, edeskRecordWithWhitespaceUri)
        expect(result.uri_generated).toBe('rc://sk/0011225544_uri_test')
        expect(result.uri_new).toBe('rc://sk/0011225544_uri_test')
      })

      it('should strip whitespace and set uri_new when URI contains newlines', () => {
        const result = service.validateNorisData(EdeskRecordSchema, edeskRecordWithNewlineUri)
        expect(result.uri_generated).toBe('rc://sk/0011225544_uri_test')
        expect(result.uri_new).toBe('rc://sk/0011225544_uri_test')
      })

      it('should strip whitespace and set uri_new when URI contains tabs', () => {
        const result = service.validateNorisData(EdeskRecordSchema, edeskRecordWithTabUri)
        expect(result.uri_generated).toBe('rc://sk/0011225544_uri_test')
        expect(result.uri_new).toBe('rc://sk/0011225544_uri_test')
      })

      it('should not set uri_new when URI is already clean', () => {
        const result = service.validateNorisData(EdeskRecordSchema, testEdeskRecord1)
        expect(result.uri_new).toBeUndefined()
      })
    })

    describe('validateNorisData with array', () => {
      it('should return only valid records and error log the rest', () => {
        const result = service.validateNorisData(EdeskRecordSchema, allEdeskRecords)
        expect(result).toHaveLength(validEdeskRecords.length)
        expect(result).toContainEqual(testEdeskRecord1)
        expect(result).toContainEqual(testEdeskRecord2)
        expect(vi.mocked(logger.error)).toHaveBeenCalledTimes(invalidEdeskRecords.length)
        expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
          expect.toMatchLogNestError(expectValidationError()),
          { index: expectAny<number>(Number), itemCount: expectAny<number>(Number) }
        )
      })

      it('should return empty array when all records are invalid', () => {
        const result = service.validateNorisData(EdeskRecordSchema, invalidEdeskRecords)
        expect(result).toHaveLength(0)
        expect(vi.mocked(logger.error)).toHaveBeenCalledTimes(invalidEdeskRecords.length)
        expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
          expect.toMatchLogNestError(expectValidationError()),
          { index: expectAny<number>(Number), itemCount: expectAny<number>(Number) }
        )
      })

      it('should return all records when all are valid', () => {
        const result = service.validateNorisData(EdeskRecordSchema, validEdeskRecords)
        expect(result).toEqual(validEdeskRecords)
        expect(vi.mocked(logger.error)).not.toHaveBeenCalled()
      })
    })
  })
})
