import {
  renderFormAdditionalInfo,
  renderFormTemplate,
} from '../../src/string-templates/renderTemplate'
import { FormDefinition } from '../../src/definitions/formDefinitionTypes'

describe('renderFormTemplate', () => {
  it('should render a simple template', () => {
    const formData = { name: 'John', age: 30 }
    const templateString = 'Name: <%= it.formData.name %>, Age: <%= it.formData.age %>'
    const result = renderFormTemplate(formData, templateString)
    expect(result).toBe('Name: John, Age: 30')
  })

  it('should use helper functions', () => {
    const formData = { numbers: [1, 2, 3] }
    const templateString = 'Numbers: <%= it.helpers.safeArray(it.formData.numbers).join(", ") %>'
    const result = renderFormTemplate(formData, templateString)
    expect(result).toBe('Numbers: 1, 2, 3')
  })

  it('should return null on error', () => {
    const formData = {}
    const templateString = '<%= nonExistentFunction() %>'
    const result = renderFormTemplate(formData, templateString)
    expect(result).toBeNull()
  })

  it('should return null when rendered string is empty', () => {
    const formData = { emptyArray: [] }
    const templateString = '<%= it.formData.emptyArray.join(", ") %>'
    const result = renderFormTemplate(formData, templateString)
    expect(result).toBeNull()
  })

  it('should return null when rendered string contains only whitespace', () => {
    const formData = {}
    const templateString = '  \n\t  '
    const result = renderFormTemplate(formData, templateString)
    expect(result).toBeNull()
  })
})

describe('renderFormAdditionalInfo', () => {
  it('should return null if no additionalInfoTemplate', () => {
    const formDefinition = {
      additionalInfoTemplate: undefined,
    } as FormDefinition
    const formData = {}
    const result = renderFormAdditionalInfo(formDefinition, formData)
    expect(result).toBeNull()
  })

  it('should render additional info template', () => {
    const formDefinition = {
      additionalInfoTemplate: 'Additional info: <%= it.formData.info %>',
    } as FormDefinition
    const formData = { info: 'Some extra information' }
    const result = renderFormAdditionalInfo(formDefinition, formData)
    expect(result).toBe('Additional info: Some extra information')
  })
})
