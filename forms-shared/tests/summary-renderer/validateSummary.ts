import { fileUpload, input, object } from '../../src/generator/functions'
import { validateSummary } from '../../src/summary-renderer/validateSummary'
import { FileStatusType } from '../../src/form-files/fileStatus'
import { filterConsole } from '../../test-utils/filterConsole'

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
      input('requiredInput', { title: 'Required input', required: true }, {}),
      input('optionalInput', { title: 'Optional input' }, {}),
    ])

    it('should validate successfully when required field is provided', () => {
      const result = validateSummary(schema(), { requiredInput: 'some value' }, {})

      expect(result.hasErrors).toBe(false)
      expect(result.pathHasError('root_requiredInput')).toBe(false)
      expect(result.pathHasError('root_optionalInput')).toBe(false)
      expect(result.errors.length).toBe(0)
    })

    it('should report errors for missing required field', () => {
      const result = validateSummary(schema(), {}, {})

      expect(result.hasErrors).toBe(true)
      expect(result.pathHasError('root_requiredInput')).toBe(true)
      expect(result.pathHasError('root_optionalInput')).toBe(false)
      expect(result.errors.length).toBe(1)
    })
  })

  describe('File upload validation', () => {
    const { schema } = object('wrapper', {}, {}, [fileUpload('file', { title: 'File' }, {})])

    it('should validate successfully for valid file status', () => {
      const result = validateSummary(
        schema(),
        { file: 'e37359e2-2547-42a9-82d6-d40054f17da0' },
        {
          'e37359e2-2547-42a9-82d6-d40054f17da0': {
            statusType: FileStatusType.ScanDone,
            fileName: '',
          },
        },
      )

      expect(result.hasErrors).toBe(false)
      expect(result.pathHasError('root_file')).toBe(false)
      expect(result.errors.length).toBe(0)
      expect(result.filesInFormData.length).toBe(1)
    })

    it('should report errors for files with errors', () => {
      const result = validateSummary(
        schema(),
        { file: 'e37359e2-2547-42a9-82d6-d40054f17da0' },
        {
          'e37359e2-2547-42a9-82d6-d40054f17da0': {
            statusType: FileStatusType.UploadServerError,
            fileName: '',
          },
        },
      )

      expect(result.hasErrors).toBe(true)
      expect(result.pathHasError('root_file')).toBe(true)
      expect(result.errors.length).toBe(1)
      expect(result.filesInFormData.length).toBe(1)
    })

    it('should report errors for missing file information', () => {
      const result = validateSummary(schema(), { file: 'e37359e2-2547-42a9-82d6-d40054f17da0' }, {})

      expect(result.hasErrors).toBe(true)
      expect(result.pathHasError('root_file')).toBe(true)
      expect(result.errors.length).toBe(1)
      expect(result.filesInFormData.length).toBe(0)
    })
  })

  describe('Multiple file upload validation', () => {
    const { schema } = object('wrapper', {}, {}, [
      fileUpload('files', { title: 'File', multiple: true }, {}),
    ])

    it('should handle multiple file upload scenario', () => {
      const result = validateSummary(
        schema(),
        {
          files: [
            'e37359e2-2547-42a9-82d6-d40054f17da0',
            'b3d0cd96-d255-4bfb-8b1a-56a185d467f3',
            '7459535f-96c2-47ed-bf32-55143e52a4ea', // File missing in fileInfos
          ],
        },
        {
          'e37359e2-2547-42a9-82d6-d40054f17da0': {
            statusType: FileStatusType.ScanDone,
            fileName: '',
          },
          'b3d0cd96-d255-4bfb-8b1a-56a185d467f3': {
            statusType: FileStatusType.UploadServerError,
            fileName: '',
          },
          // Extra file not in the form data
          '96f23f75-6d20-4a85-af35-bbc901d02def': {
            statusType: FileStatusType.ScanDone,
            fileName: '',
          },
        },
      )

      expect(result.hasErrors).toBe(true)
      expect(result.pathHasError('root_files')).toBe(true)
      expect(result.pathHasError('root_files_0')).toBe(false)
      expect(result.pathHasError('root_files_1')).toBe(true)
      expect(result.pathHasError('root_files_2')).toBe(true)
      expect(result.errors.length).toBe(2)
      expect(result.filesInFormData.length).toBe(2)
    })
  })
})
