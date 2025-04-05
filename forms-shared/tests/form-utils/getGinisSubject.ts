import { describe, expect, test } from 'vitest'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { getGinisSubject } from '../../src/form-utils/getGinisSubject'
import {
  FormDefinitionSlovenskoSkGeneric,
  isSlovenskoSkGenericFormDefinition,
} from '../../src/definitions/formDefinitionTypes'

describe('getGinisSubject', () => {
  test('should return form title if extractGinisSubject is not provided', () => {
    const formDefinition = {
      title: 'Test Form Title',
      ginisAssignment: {},
    } as FormDefinitionSlovenskoSkGeneric
    const formData = {}

    const result = getGinisSubject(formDefinition, formData)
    expect(result).toBe('Test Form Title')
  })

  test('should return result of extractGinisSubject if provided and returns value', () => {
    const formDefinition = {
      title: 'Test Form Title',
      ginisAssignment: {
        extractGinisSubject: (formData) => formData.subject,
      },
    } as FormDefinitionSlovenskoSkGeneric
    const formData = {
      subject: 'Extracted Subject',
    }

    const result = getGinisSubject(formDefinition, formData)
    expect(result).toBe('Extracted Subject')
  })

  test('should return form title if extractGinisSubject returns undefined', () => {
    const formDefinition = {
      title: 'Test Form Title',
      ginisAssignment: {
        extractGinisSubject: (formData) => undefined,
      },
    } as FormDefinitionSlovenskoSkGeneric
    const formData = {}

    const result = getGinisSubject(formDefinition, formData)
    expect(result).toBe('Test Form Title')
  })

  getExampleFormPairs({
    formDefinitionFilterFn: isSlovenskoSkGenericFormDefinition,
  }).forEach(({ formDefinition, exampleForm }) => {
    test(`${exampleForm.name} GINIS subject should match snapshot`, () => {
      const result = getGinisSubject(formDefinition, exampleForm.formData)
      expect(result).toMatchSnapshot()
    })
  })
})
