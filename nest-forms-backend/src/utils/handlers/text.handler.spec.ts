import { Forms, Prisma } from '@prisma/client'
import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { Schemas } from 'forms-shared/generator/functions'

import {
  getFrontendFormTitleFromForm,
  getSubjectTextFromForm,
} from './text.handler'

describe('getSubjectTextFromForm', () => {
  it('should return message subject if there is no format', () => {
    const result = getSubjectTextFromForm(
      {
        formDefinitionSlug: 'no-format',
      } as Forms,
      { messageSubjectDefault: 'Subject' } as FormDefinition,
    )
    expect(result).toBe('Subject')
  })

  it('should replace all occurences with the value at the path', () => {
    const result = getSubjectTextFromForm(
      {
        formDataJson: {
          data1: { data2: 'data2Val' },
          data3: 'data3Val',
        } as Prisma.JsonValue,
      } as Forms,
      {
        messageSubjectFormat: 'Subject {data1.data2} value {data3}',
      } as FormDefinition,
    )
    expect(result).toBe('Subject data2Val value data3Val')
  })

  it('should be okay if the value at the path is still an object', () => {
    const result = getSubjectTextFromForm(
      {
        formDataJson: {
          data1: { data2: { data4: 'data4Val' } },
          data3: 'data3Val',
        } as Prisma.JsonValue,
      } as Forms,
      {
        messageSubjectFormat: 'Subject {data1.data2} value {data3}',
      } as FormDefinition,
    )
    expect(result).toBe('Subject  value data3Val')
  })

  it('should print empty string if there is nothing at the path', () => {
    const result = getSubjectTextFromForm(
      {
        formDataJson: {
          data1: {},
          data3: 'data3Val',
        } as Prisma.JsonValue,
      } as Forms,
      {
        messageSubjectFormat: 'Subject {data1.data2} value {data3}',
      } as FormDefinition,
    )
    expect(result).toBe('Subject  value data3Val')
  })

  it('should correctly print if there is an array of strings', () => {
    const result = getSubjectTextFromForm(
      {
        formDataJson: {
          data1: { data2: ['data2_1', 'data2_2', 'data2_3'] },
          data3: 'data3Val',
        } as Prisma.JsonValue,
      } as Forms,
      {
        messageSubjectFormat: 'Subject {data1.data2} value {data3}',
      } as FormDefinition,
    )
    expect(result).toBe('Subject data2_1, data2_2, data2_3 value data3Val')
  })

  it('should print empty string if the array is not of strings', () => {
    const result = getSubjectTextFromForm(
      {
        formDataJson: {
          data1: { data2: ['data2_1', 'data2_2', { data4: 'something' }] },
          data3: 'data3Val',
        } as Prisma.JsonValue,
      } as Forms,
      {
        messageSubjectFormat: 'Subject {data1.data2} value {data3}',
      } as FormDefinition,
    )
    expect(result).toBe('Subject  value data3Val')
  })
})

describe('getFrontendFormTitleFromForm', () => {
  const titleFallback = 'Title fallback'
  const titlePath = 'deep.path.to.title'
  const title = 'Title'

  const data = {
    formDataJson: {
      deep: {
        path: {
          to: {
            title,
          },
        },
      },
    },
  } as unknown as Forms

  it('should return correct title when available in uiSchema', () => {
    const result = getFrontendFormTitleFromForm(data, {
      schemas: {
        uiSchema: {
          'ui:options': {
            titlePath,
            titleFallback,
          },
        },
        schema: {},
      } as Schemas,
    } as FormDefinition)
    expect(result).toBe(title)
  })

  it('should be fine without uiSchema', () => {
    const result = getFrontendFormTitleFromForm(data, {
      schemas: {
        uiSchema: {
          'ui:options': {
            titlePath,
            titleFallback,
          },
        },
        schema: {},
      } as Schemas,
    } as FormDefinition)
    expect(result).toBe(result)
  })

  it('should return fallback if nothing is found on title path', () => {
    const result = getFrontendFormTitleFromForm(
      {
        ...data,
        formDataJson: {},
      },
      {
        schemas: {
          uiSchema: {
            'ui:options': {
              titlePath,
              titleFallback,
            },
          },
          schema: {},
        } as Schemas,
      } as FormDefinition,
    )
    expect(result).toBe(titleFallback)
  })

  it('should return null if not given fallback', () => {
    const result = getFrontendFormTitleFromForm(
      {} as Forms,
      {
        schemas: {
          uiSchema: {
            'ui:options': {
              titlePath,
            },
          },
          schema: {},
        } as Schemas,
      } as FormDefinition,
    )
    expect(result).toBeNull()
  })
})
