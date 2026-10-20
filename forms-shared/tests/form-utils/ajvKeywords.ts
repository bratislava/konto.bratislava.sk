import { describe, expect, test } from 'vitest'

import { withFileValidateFn } from '../../src/form-utils/ajvKeywords'
import { getBaRjsfValidator } from '../../src/form-utils/validators'
import { fileUpload } from '../../src/generator/functions/fileUpload'
import { object } from '../../src/generator/object'

describe('withFileValidateFn', () => {
  const { schema } = object('wrapper', {}, [fileUpload('file', { title: 'File' }, {})])
  const formData = { file: 'e37359e2-2547-42a9-82d6-d40054f17da0' }

  test('should call fileValidateFn only inside the callback', () => {
    const validator = getBaRjsfValidator()
    const files: string[] = []

    withFileValidateFn(
      (innerSchema, data) => {
        files.push(data)
        return true
      },
      () => validator.isValid(schema, formData, schema),
    )
    validator.isValid(schema, formData, schema)

    expect(files).toEqual(['e37359e2-2547-42a9-82d6-d40054f17da0'])
  })

  test('should throw when nested', () => {
    expect(() =>
      withFileValidateFn(
        () => true,
        () =>
          withFileValidateFn(
            () => true,
            () => true,
          ),
      ),
    ).toThrow('withFileValidateFn cannot be nested')

    // The outer call still clears the active fileValidateFn
    expect(
      withFileValidateFn(
        () => true,
        () => 'ok',
      ),
    ).toBe('ok')
  })
})
