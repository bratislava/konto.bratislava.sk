import { describe, expect, test } from 'vitest'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import {
  extractEmailFormEmail,
  extractEmailFormName,
  extractFormSubjectPlain,
  extractFormSubjectTechnical,
} from '../../src/form-utils/formDataExtractors'
import {
  FormDefinition,
  FormDefinitionEmail,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionType,
  isEmailFormDefinition,
  isSlovenskoSkGenericFormDefinition,
} from '../../src/definitions/formDefinitionTypes'
import {
  SchemaFormDataExtractor,
  SchemalessFormDataExtractor,
} from '../../src/form-utils/evaluateFormDataExtractor'
import { BAJSONSchema7 } from '../../src/form-utils/ajvKeywords'

describe('formDataExtractors', () => {
  describe('extractFormSubjectPlain', () => {
    test('should return form definition title if subject.extractPlain is not provided', () => {
      const formDefinition = {
        title: 'Test Form Title',
      } as FormDefinition
      const formData = {}

      const result = extractFormSubjectPlain(formDefinition, formData)
      expect(result).toBe('Test Form Title')
    })

    test('should return form definition title if formData is null (schema extractor)', () => {
      const extractSubjectMock: SchemaFormDataExtractor<any> = {
        type: 'schema',
        schema: { type: 'object' } as BAJSONSchema7,
        extractFn: (formData) => 'Extracted Subject',
      }

      const formDefinition = {
        title: 'Test Form Title',
        subject: { extractPlain: extractSubjectMock },
      } as FormDefinition
      const formData = null

      const result = extractFormSubjectPlain(formDefinition, formData)
      expect(result).toBe('Test Form Title')
    })

    test('should return result of subject.extractPlain if provided and formData is not null (schema path, validation pass)', () => {
      type FormDataType = {
        subjectField: string
      }
      const extractSubjectMock: SchemaFormDataExtractor<FormDataType> = {
        type: 'schema',
        schema: {
          type: 'object',
          properties: { subjectField: { type: 'string' } },
          required: ['subjectField'],
        } as BAJSONSchema7,
        extractFn: (formData) => formData.subjectField,
      }

      const formDefinition = {
        title: 'Test Form Title',
        subject: {
          extractPlain: extractSubjectMock,
        },
      } as FormDefinition
      const formData: FormDataType = { subjectField: 'Extracted Subject from Schema Extractor' }

      const result = extractFormSubjectPlain(formDefinition, formData)
      expect(result).toBe('Extracted Subject from Schema Extractor')
    })

    test('should return form definition title if schema validation fails (schema path)', () => {
      type FormDataType = { subjectField: string }
      const extractSubjectMock: SchemaFormDataExtractor<FormDataType> = {
        type: 'schema',
        schema: {
          type: 'object',
          properties: { subjectField: { type: 'string' } },
          required: ['subjectField'],
        } as BAJSONSchema7,
        extractFn: (formData) => formData.subjectField,
      }

      const formDefinition = {
        title: 'Fallback Title Due To Schema Fail',
        subject: { extractPlain: extractSubjectMock },
      } as FormDefinition
      const formData = { wrongProperty: 'some value' }

      const result = extractFormSubjectPlain(formDefinition, formData)
      expect(result).toBe('Fallback Title Due To Schema Fail')
    })

    test('should return extractor specific fallback if schema validation fails and fallback is provided (schema path)', () => {
      type FormDataType = { subjectField: string }
      const extractSubjectMock: SchemaFormDataExtractor<FormDataType> = {
        type: 'schema',
        schema: {
          type: 'object',
          properties: { subjectField: { type: 'string' } },
          required: ['subjectField'],
        } as BAJSONSchema7,
        extractFn: (formData) => formData.subjectField,
        schemaValidationFailedFallback: 'Extractor Specific Fallback',
      }

      const formDefinition = {
        title: 'Parent Fallback Title',
        subject: { extractPlain: extractSubjectMock },
      } as FormDefinition
      const formData = { anotherWrongProperty: 'another value' }

      const result = extractFormSubjectPlain(formDefinition, formData)
      expect(result).toBe('Extractor Specific Fallback')
    })

    test('should throw error when extractFn (from Schema extractor) returns empty result after schema validation', () => {
      type FormDataType = { subjectField?: string | null }
      const extractSubjectMock: SchemaFormDataExtractor<FormDataType> = {
        type: 'schema',
        schema: {
          type: 'object',
          properties: { subjectField: { type: ['string', 'null'] } },
          required: ['subjectField'],
        } as BAJSONSchema7,
        extractFn: (formData) => formData.subjectField as unknown as string,
      }

      const formDefinition = {
        title: 'Test Form Title',
        subject: { extractPlain: extractSubjectMock },
      } as FormDefinition
      const formData = { subjectField: null }

      expect(() => extractFormSubjectPlain(formDefinition, formData)).toThrow(
        `Extraction returned an empty string for form data: ${JSON.stringify(formData)}.`,
      )
    })

    getExampleFormPairs().forEach(({ formDefinition, exampleForm }) => {
      test(`${exampleForm.name} form subject should match snapshot`, () => {
        const result = extractFormSubjectPlain(formDefinition, exampleForm.formData)
        expect(result).toMatchSnapshot()
      })
    })
  })

  describe('extractFormSubjectTechnical', () => {
    test('should return form definition title if extractFormSubjectTechnical is not provided', () => {
      const formDefinition = {
        title: 'Test Form Title',
        ginisAssignment: {},
      } as FormDefinitionSlovenskoSkGeneric
      const formData = {}

      const result = extractFormSubjectTechnical(formDefinition, formData)
      expect(result).toBe('Test Form Title')
    })

    test('should return result of subject.extractTechnical if provided and returns value', () => {
      type FormDataType = {
        subject: string
      }
      const extractTechnicalSubjectMock: SchemalessFormDataExtractor<FormDataType> = {
        type: 'schemaless',
        extractFn: (formData) => formData.subject,
      }

      const formDefinition = {
        title: 'Test Form Title',
        subject: {
          extractTechnical: extractTechnicalSubjectMock,
        },
      } as FormDefinitionSlovenskoSkGeneric
      const formData: FormDataType = {
        subject: 'Extracted Subject',
      }

      const result = extractFormSubjectTechnical(formDefinition, formData)
      expect(result).toBe('Extracted Subject')
    })

    test('should throw error when extraction returns empty result', () => {
      type FormDataType = {
        subject: string
      }
      const extractTechnicalSubjectMock: SchemalessFormDataExtractor<FormDataType> = {
        type: 'schemaless',
        extractFn: (formData) => formData.subject,
      }

      const formDefinition = {
        title: 'Test Form Title',
        subject: {
          extractTechnical: extractTechnicalSubjectMock,
        },
      } as FormDefinitionSlovenskoSkGeneric
      const formData = {
        wrongSubject: 'Extracted Subject',
      }

      expect(() => extractFormSubjectTechnical(formDefinition, formData)).toThrow()
    })

    getExampleFormPairs({
      formDefinitionFilterFn: isSlovenskoSkGenericFormDefinition,
    }).forEach(({ formDefinition, exampleForm }) => {
      test(`${exampleForm.name} GINIS subject should match snapshot`, () => {
        const result = extractFormSubjectTechnical(formDefinition, exampleForm.formData)
        expect(result).toMatchSnapshot()
      })
    })
  })

  describe('extractEmailFormEmail', () => {
    test('should return result of extractEmail', () => {
      const extractEmailMock: SchemalessFormDataExtractor<any> = {
        type: 'schemaless',
        extractFn: (formData) => formData.email,
      }

      const formDefinition = {
        type: FormDefinitionType.Email,
        email: {
          extractEmail: extractEmailMock,
        },
      } as FormDefinitionEmail
      const formData = {
        email: 'test@example.com',
      }

      const result = extractEmailFormEmail(formDefinition, formData)
      expect(result).toBe('test@example.com')
    })

    test('should throw error when extractEmailFormEmail on wrong data provided', () => {
      const extractEmailMock: SchemalessFormDataExtractor<any> = {
        type: 'schemaless',
        extractFn: (formData) => formData.email,
      }

      const formDefinition = {
        type: FormDefinitionType.Email,
        email: {
          extractEmail: extractEmailMock,
        },
      } as FormDefinitionEmail
      const formData = {
        wrongEmail: 'test@example.com',
      }

      expect(() => extractEmailFormEmail(formDefinition, formData)).toThrow()
    })

    getExampleFormPairs({
      formDefinitionFilterFn: isEmailFormDefinition,
    }).forEach(({ formDefinition, exampleForm }) => {
      test(`${exampleForm.name} email should match snapshot`, () => {
        const result = extractEmailFormEmail(formDefinition, exampleForm.formData)
        expect(result).toMatchSnapshot()
      })
    })
  })

  describe('extractEmailFormName', () => {
    test('should return undefined if extractName is not provided', () => {
      const formDefinition = {
        type: FormDefinitionType.Email,
        email: {},
      } as FormDefinitionEmail
      const formData = {}

      const result = extractEmailFormName(formDefinition, formData)
      expect(result).toBeUndefined()
    })

    test('should return result of extractName if provided', () => {
      const extractNameMock: SchemalessFormDataExtractor<any> = {
        type: 'schemaless',
        extractFn: (formData) => formData.name,
      }

      const formDefinition = {
        type: FormDefinitionType.Email,
        email: {
          extractName: extractNameMock,
        },
      } as FormDefinitionEmail
      const formData = {
        name: 'Test User',
      }

      const result = extractEmailFormName(formDefinition, formData)
      expect(result).toBe('Test User')
    })

    test('should throw error when extractEmailFormName on wrong data provided', () => {
      const extractNameMock: SchemalessFormDataExtractor<any> = {
        type: 'schemaless',
        extractFn: (formData) => formData.name,
      }

      const formDefinition = {
        type: FormDefinitionType.Email,
        email: {
          extractName: extractNameMock,
        },
      } as FormDefinitionEmail
      const formData = {
        wrongName: 'Test User',
      }

      expect(() => extractEmailFormName(formDefinition, formData)).toThrow()
    })

    getExampleFormPairs({
      formDefinitionFilterFn: isEmailFormDefinition,
    }).forEach(({ formDefinition, exampleForm }) => {
      test(`${exampleForm.name} name should match snapshot`, () => {
        const result = extractEmailFormName(formDefinition, exampleForm.formData)
        expect(result).toMatchSnapshot()
      })
    })
  })
})
