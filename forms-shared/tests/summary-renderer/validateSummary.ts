import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { FileStatusType } from '../../src/form-files/fileStatus'
import { createCachedValidatorRegistry } from '../../src/form-utils/validatorRegistry'
import { getBaRjsfValidator } from '../../src/form-utils/validators'
import { conditionalFields } from '../../src/generator/functions/conditionalFields'
import { fileUpload } from '../../src/generator/functions/fileUpload'
import { fileUploadMultiple } from '../../src/generator/functions/fileUploadMultiple'
import { input } from '../../src/generator/functions/input'
import { createCondition } from '../../src/generator/helpers'
import { object } from '../../src/generator/object'
import { checkPathForErrors } from '../../src/summary-renderer/checkPathForErrors'
import { validateSummary } from '../../src/summary-renderer/validateSummary'
import { filterConsole } from '../../test-utils/filterConsole'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

describe('validateSummary', () => {
  beforeEach(() => {
    filterConsole(
      'warn',
      (message) =>
        typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Simple validation', () => {
    const { schema } = object('wrapper', {}, [
      input('requiredInput', { type: 'text', title: 'Required input', required: true }, {}),
      input('optionalInput', { type: 'text', title: 'Optional input' }, {}),
    ])

    test('should validate successfully when required field is provided', () => {
      const result = validateSummary({
        schema,
        formData: { requiredInput: 'some value' },
        fileInfos: {},
        validatorRegistry: testValidatorRegistry,
      })

      expect(result.hasErrors).toBe(false)
      expect(checkPathForErrors('root_requiredInput', result.validationData.errorSchema)).toBe(
        false,
      )
      expect(checkPathForErrors('root_optionalInput', result.validationData.errorSchema)).toBe(
        false,
      )
      expect(result.validationData.errors.length).toBe(0)
    })

    test('should report errors for missing required field', () => {
      const result = validateSummary({
        schema,
        formData: {},
        fileInfos: {},
        validatorRegistry: testValidatorRegistry,
      })

      expect(result.hasErrors).toBe(true)
      expect(checkPathForErrors('root_requiredInput', result.validationData.errorSchema)).toBe(true)
      expect(checkPathForErrors('root_optionalInput', result.validationData.errorSchema)).toBe(
        false,
      )
      expect(result.validationData.errors.length).toBe(1)
    })
  })

  describe('File upload validation', () => {
    const { schema } = object('wrapper', {}, [fileUpload('file', { title: 'File' }, {})])

    test('should validate successfully for valid file status', () => {
      const result = validateSummary({
        schema,
        formData: { file: 'e37359e2-2547-42a9-82d6-d40054f17da0' },
        fileInfos: {
          'e37359e2-2547-42a9-82d6-d40054f17da0': {
            id: 'e37359e2-2547-42a9-82d6-d40054f17da0',
            statusType: FileStatusType.ScanDone,
            fileName: '',
          },
        },
        validatorRegistry: testValidatorRegistry,
      })

      expect(result.hasErrors).toBe(false)
      expect(checkPathForErrors('root_file', result.validationData.errorSchema)).toBe(false)
      expect(result.validationData.errors.length).toBe(0)
      expect(result.filesInFormData.length).toBe(1)
      expect(result.filesInFormData.map(({ id }) => id)).toEqual([
        'e37359e2-2547-42a9-82d6-d40054f17da0',
      ])
    })

    test('should report errors for files with errors', () => {
      const result = validateSummary({
        schema,
        formData: { file: 'e37359e2-2547-42a9-82d6-d40054f17da0' },
        fileInfos: {
          'e37359e2-2547-42a9-82d6-d40054f17da0': {
            id: 'e37359e2-2547-42a9-82d6-d40054f17da0',
            statusType: FileStatusType.UploadServerError,
            fileName: '',
          },
        },
        validatorRegistry: testValidatorRegistry,
      })

      expect(result.hasErrors).toBe(true)
      expect(checkPathForErrors('root_file', result.validationData.errorSchema)).toBe(true)
      expect(result.validationData.errors.length).toBe(1)
      expect(result.filesInFormData.length).toBe(1)
      expect(result.filesInFormData.map(({ id }) => id)).toEqual([
        'e37359e2-2547-42a9-82d6-d40054f17da0',
      ])
    })

    test('should report errors for missing file information', () => {
      const result = validateSummary({
        schema,
        formData: { file: 'e37359e2-2547-42a9-82d6-d40054f17da0' },
        fileInfos: {},
        validatorRegistry: testValidatorRegistry,
      })

      expect(result.hasErrors).toBe(true)
      expect(checkPathForErrors('root_file', result.validationData.errorSchema)).toBe(true)
      expect(result.validationData.errors.length).toBe(1)
      expect(result.filesInFormData.length).toBe(0)
    })
  })

  describe('Multiple file upload validation', () => {
    const { schema } = object('wrapper', {}, [fileUploadMultiple('files', { title: 'File' }, {})])

    test('should handle multiple file upload scenario', () => {
      const result = validateSummary({
        schema,
        formData: {
          files: [
            'e37359e2-2547-42a9-82d6-d40054f17da0',
            'b3d0cd96-d255-4bfb-8b1a-56a185d467f3',
            '7459535f-96c2-47ed-bf32-55143e52a4ea', // File missing in fileInfos
          ],
        },
        fileInfos: {
          'e37359e2-2547-42a9-82d6-d40054f17da0': {
            id: 'e37359e2-2547-42a9-82d6-d40054f17da0',
            statusType: FileStatusType.ScanDone,
            fileName: '',
          },
          'b3d0cd96-d255-4bfb-8b1a-56a185d467f3': {
            id: 'b3d0cd96-d255-4bfb-8b1a-56a185d467f3',
            statusType: FileStatusType.UploadServerError,
            fileName: '',
          },
          // Extra file not in the form data
          '96f23f75-6d20-4a85-af35-bbc901d02def': {
            id: '96f23f75-6d20-4a85-af35-bbc901d02def',
            statusType: FileStatusType.ScanDone,
            fileName: '',
          },
        },
        validatorRegistry: testValidatorRegistry,
      })

      expect(result.hasErrors).toBe(true)
      expect(checkPathForErrors('root_files', result.validationData.errorSchema)).toBe(true)
      expect(checkPathForErrors('root_files_0', result.validationData.errorSchema)).toBe(false)
      expect(checkPathForErrors('root_files_1', result.validationData.errorSchema)).toBe(true)
      expect(checkPathForErrors('root_files_2', result.validationData.errorSchema)).toBe(true)
      expect(result.validationData.errors.length).toBe(2)
      expect(result.filesInFormData.length).toBe(2)
      expect(result.filesInFormData.map(({ id }) => id)).toEqual([
        'e37359e2-2547-42a9-82d6-d40054f17da0',
        'b3d0cd96-d255-4bfb-8b1a-56a185d467f3',
      ])
    })
  })

  describe('Conditional file upload validation', () => {
    const { schema } = object('wrapper', {}, [
      input('type', { type: 'text', title: 'Type' }, {}),
      conditionalFields(
        createCondition([[['type'], { const: 'a' }]]),
        [fileUpload('fileA', { title: 'File A' }, {})],
        [fileUpload('fileB', { title: 'File B' }, {})],
      ),
    ])

    test('should validate only files in the active branch', () => {
      const result = validateSummary({
        schema,
        formData: {
          type: 'a',
          fileA: 'e37359e2-2547-42a9-82d6-d40054f17da0',
          // Left over from the inactive branch, missing in fileInfos
          fileB: 'b3d0cd96-d255-4bfb-8b1a-56a185d467f3',
        },
        fileInfos: {
          'e37359e2-2547-42a9-82d6-d40054f17da0': {
            id: 'e37359e2-2547-42a9-82d6-d40054f17da0',
            statusType: FileStatusType.ScanDone,
            fileName: '',
          },
        },
        validatorRegistry: testValidatorRegistry,
      })

      expect(result.hasErrors).toBe(false)
      expect(result.filesInFormData.map(({ id }) => id)).toEqual([
        'e37359e2-2547-42a9-82d6-d40054f17da0',
      ])
    })
  })

  describe('Cached validator', () => {
    const { schema } = object('wrapper', {}, [fileUpload('file', { title: 'File' }, {})])
    const formData = { file: 'e37359e2-2547-42a9-82d6-d40054f17da0' }

    test('should use file infos of the current call when the validator is reused', () => {
      const validatorRegistry = createCachedValidatorRegistry()

      const resultWithError = validateSummary({
        schema,
        formData,
        fileInfos: {},
        validatorRegistry,
      })
      const resultWithoutError = validateSummary({
        schema,
        formData,
        fileInfos: {
          'e37359e2-2547-42a9-82d6-d40054f17da0': {
            id: 'e37359e2-2547-42a9-82d6-d40054f17da0',
            statusType: FileStatusType.ScanDone,
            fileName: '',
          },
        },
        validatorRegistry,
      })

      expect(resultWithError.hasErrors).toBe(true)
      expect(resultWithError.filesInFormData.length).toBe(0)
      expect(resultWithoutError.hasErrors).toBe(false)
      expect(resultWithoutError.filesInFormData.length).toBe(1)
    })

    test('should not validate files outside of validateSummary', () => {
      const validator = getBaRjsfValidator()

      validateSummary({
        schema,
        formData,
        fileInfos: {},
        validatorRegistry: { getValidator: () => validator },
      })

      // The file is missing in fileInfos, but `baFile` is only an annotation outside of `validateSummary`
      expect(validator.validateFormData(formData, schema).errors).toEqual([])
    })
  })
})
