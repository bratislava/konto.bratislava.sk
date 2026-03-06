import { HttpException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import noop from 'lodash/noop'

import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { EdeskRecordSchema } from '../../types/noris.types'
import { NorisValidatorSubservice } from '../noris-validator.subservice'
import {
  allEdeskRecords,
  invalidEdeskRecordMissingIdNoris,
  invalidEdeskRecordMissingUriGenerated,
  invalidEdeskRecordWrongIdNorisType,
  invalidEdeskRecordWrongUriGeneratedType,
  invalidEdeskRecords,
  testEdeskRecord1,
  testEdeskRecord2,
  validEdeskRecords,
} from './data/test.edesk-record'

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
    describe('Edesk records', () => {
      describe('valid', () => {
        it('should validate valid edesk record', () => {
          const result = service.validateNorisData(
            EdeskRecordSchema,
            testEdeskRecord1,
          )
          expect(result).toEqual(testEdeskRecord1)
        })

        it('should validate all valid edesk records', () => {
          validEdeskRecords.forEach((record) => {
            const result = service.validateNorisData(
              EdeskRecordSchema,
              record,
            )
            expect(result).toEqual(record)
          })
        })
      })

      describe('invalid', () => {
        it('should throw HttpException for invalid record', () => {
          invalidEdeskRecords.forEach((record) => {
            expect(() => {
              service.validateNorisData(EdeskRecordSchema, record)
            }).toThrow(HttpException)
          })
        })

        it('should throw error containing id_noris when missing', () => {
          expect(() => {
            service.validateNorisData(
              EdeskRecordSchema,
              invalidEdeskRecordMissingIdNoris,
            )
          }).toThrow(HttpException)

          try {
            service.validateNorisData(
              EdeskRecordSchema,
              invalidEdeskRecordMissingIdNoris,
            )
          } catch (error) {
            const response = (error as HttpException).getResponse() as Record<
              symbol | string,
              unknown
            >
            expect(response.message).toContain('id_noris')
          }
        })

        it('should throw error containing uri_generated when missing', () => {
          expect(() => {
            service.validateNorisData(
              EdeskRecordSchema,
              invalidEdeskRecordMissingUriGenerated,
            )
          }).toThrow(HttpException)

          try {
            service.validateNorisData(
              EdeskRecordSchema,
              invalidEdeskRecordMissingUriGenerated,
            )
          } catch (error) {
            const response = (error as HttpException).getResponse() as Record<
              symbol | string,
              unknown
            >
            expect(response.message).toContain('uri_generated')
          }
        })

        it('should throw for wrong type of id_noris', () => {
          expect(() => {
            service.validateNorisData(
              EdeskRecordSchema,
              invalidEdeskRecordWrongIdNorisType,
            )
          }).toThrow(HttpException)
        })

        it('should throw for wrong type of uri_generated', () => {
          expect(() => {
            service.validateNorisData(
              EdeskRecordSchema,
              invalidEdeskRecordWrongUriGeneratedType,
            )
          }).toThrow(HttpException)
        })
      })
    })

    describe('validateNorisData with array', () => {
      it('should return only valid records and error log the rest', () => {
        const errorLogSpy = jest
          .spyOn(service['logger'], 'error')
          .mockImplementation(noop)
        const result = service.validateNorisData(
          EdeskRecordSchema,
          allEdeskRecords,
        )
        expect(result).toHaveLength(validEdeskRecords.length)
        expect(result).toContainEqual(testEdeskRecord1)
        expect(result).toContainEqual(testEdeskRecord2)
        expect(errorLogSpy).toHaveBeenCalledTimes(invalidEdeskRecords.length)
      })

      it('should return empty array when all records are invalid', () => {
        const errorLogSpy = jest
          .spyOn(service['logger'], 'error')
          .mockImplementation(noop)
        const result = service.validateNorisData(
          EdeskRecordSchema,
          invalidEdeskRecords,
        )
        expect(result).toHaveLength(0)
        expect(errorLogSpy).toHaveBeenCalledTimes(invalidEdeskRecords.length)
      })

      it('should return all records when all are valid', () => {
        const errorLogSpy = jest
          .spyOn(service['logger'], 'error')
          .mockImplementation(noop)
        const result = service.validateNorisData(
          EdeskRecordSchema,
          validEdeskRecords,
        )
        expect(result).toEqual(validEdeskRecords)
        expect(errorLogSpy).not.toHaveBeenCalled()
      })
    })
  })
})
