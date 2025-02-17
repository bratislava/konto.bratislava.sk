import { beforeEach, describe, expect, test } from 'vitest'
import { validateSummary } from '../../src/summary-renderer/validateSummary'
import { FileStatusType } from '../../src/form-files/fileStatus'
import { filterConsole } from '../../test-utils/filterConsole'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'
import { input } from '../../src/generator/functions/input'
import { fileUpload } from '../../src/generator/functions/fileUpload'
import { object } from '../../src/generator/object'
import { fileUploadMultiple } from '../../src/generator/functions/fileUploadMultiple'
import { checkPathForErrors } from '../../src/summary-renderer/checkPathForErrors'

describe('validateSummary', () => {
  beforeEach(() => {
    filterConsole(
      'warn',
      (message) =>
        typeof message === 'string' && message.includes('could not merge subschemas in allOf'),
    )
  })

  describe('Simple validation', () => {
    const { schema } = object('wrapper', {}, {}, [
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
    const { schema } = object('wrapper', {}, {}, [fileUpload('file', { title: 'File' }, {})])

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
    const { schema } = object('wrapper', {}, {}, [
      fileUploadMultiple('files', { title: 'File' }, {}),
    ])

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
})
