import { Prisma } from '@prisma/client'

import { FormWithSchemaAndVersion } from '../types/prisma'
import {
  getFrontendFormTitleFromForm,
  getSubjectTextFromForm,
} from './text.handler'

describe('getSubjectTextFromForm', () => {
  it('should return message subject if there is no format', () => {
    const result = getSubjectTextFromForm({
      schemaVersion: {
        schema: { messageSubject: 'Subject' },
        messageSubjectFormat: null,
      },
    } as FormWithSchemaAndVersion)
    expect(result).toBe('Subject')
  })

  it('should replace all occurences with the value at the path', () => {
    const result = getSubjectTextFromForm({
      formDataJson: {
        data1: { data2: 'data2Val' },
        data3: 'data3Val',
      } as Prisma.JsonValue,
      schemaVersion: {
        schema: { messageSubject: 'Subject' },
        messageSubjectFormat: 'Subject {data1.data2} value {data3}',
      },
    } as FormWithSchemaAndVersion)
    expect(result).toBe('Subject data2Val value data3Val')
  })

  it('should be okay if the value at the path is still an object', () => {
    const result = getSubjectTextFromForm({
      formDataJson: {
        data1: { data2: { data4: 'data4Val' } },
        data3: 'data3Val',
      } as Prisma.JsonValue,
      schemaVersion: {
        schema: { messageSubject: 'Subject' },
        messageSubjectFormat: 'Subject {data1.data2} value {data3}',
      },
    } as FormWithSchemaAndVersion)
    expect(result).toBe('Subject ??? value data3Val')
  })

  it('should print ??? if there is nothing at the path', () => {
    const result = getSubjectTextFromForm({
      formDataJson: {
        data1: {},
        data3: 'data3Val',
      } as Prisma.JsonValue,
      schemaVersion: {
        schema: { messageSubject: 'Subject' },
        messageSubjectFormat: 'Subject {data1.data2} value {data3}',
      },
    } as FormWithSchemaAndVersion)
    expect(result).toBe('Subject ??? value data3Val')
  })

  it('should correctly print if there is an array of strings', () => {
    const result = getSubjectTextFromForm({
      formDataJson: {
        data1: { data2: ['data2_1', 'data2_2', 'data2_3'] },
        data3: 'data3Val',
      } as Prisma.JsonValue,
      schemaVersion: {
        schema: { messageSubject: 'Subject' },
        messageSubjectFormat: 'Subject {data1.data2} value {data3}',
      },
    } as FormWithSchemaAndVersion)
    expect(result).toBe('Subject data2_1, data2_2, data2_3 value data3Val')
  })

  it('should print ??? if the array is not of strings', () => {
    const result = getSubjectTextFromForm({
      formDataJson: {
        data1: { data2: ['data2_1', 'data2_2', { data4: 'something' }] },
        data3: 'data3Val',
      } as Prisma.JsonValue,
      schemaVersion: {
        schema: { messageSubject: 'Subject' },
        messageSubjectFormat: 'Subject {data1.data2} value {data3}',
      },
    } as FormWithSchemaAndVersion)
    expect(result).toBe('Subject ??? value data3Val')
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
    schemaVersion: {
      uiSchema: {
        'ui:options': {
          titlePath,
          titleFallback,
        },
      },
    },
  } as unknown as FormWithSchemaAndVersion

  it('should return correct title when available in uiSchema', () => {
    const result = getFrontendFormTitleFromForm(data)
    expect(result).toBe(title)
  })

  it('should be fine without uiSchema', () => {
    const result = getFrontendFormTitleFromForm({
      ...data,
      schemaVersion: {},
    } as FormWithSchemaAndVersion)
    expect(result).toBe(result)
  })

  it('should return fallback if nothing is found on title path', () => {
    const result = getFrontendFormTitleFromForm({
      ...data,
      formDataJson: {},
    })
    expect(result).toBe(titleFallback)
  })

  it('should return null if not given fallback', () => {
    const result = getFrontendFormTitleFromForm({
      data: {},
      schemaVersion: {
        uiSchema: {
          'ui:options': {
            titlePath,
          },
        },
      },
    } as unknown as FormWithSchemaAndVersion)
    expect(result).toBeNull()
  })
})
