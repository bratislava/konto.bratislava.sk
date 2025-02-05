import { describe, test, expect } from 'vitest'
import { ErrorSchema } from '@rjsf/utils'
import { checkPathForErrors } from '../../src/summary-renderer/checkPathForErrors'

describe('checkPathForErrors', () => {
  // @ts-expect-error ErrorSchema type is not working properly
  const errorSchema = {
    step: {
      field: {
        __errors: ['Field error'],
      },
    },
  } as ErrorSchema

  test('returns true for a path that itself has errors', () => {
    expect(checkPathForErrors('root_step_field', errorSchema)).toBe(true)
  })

  test('returns true for a path whose children have errors', () => {
    expect(checkPathForErrors('root_step', errorSchema)).toBe(true)
  })

  test('returns false for a path without errors', () => {
    expect(checkPathForErrors('root_anotherStep', errorSchema)).toBe(false)
  })

  test('throws an error if the field ID does not start with "root"', () => {
    expect(() => checkPathForErrors('step_field', errorSchema)).toThrow(
      'Field ID must start with "root"',
    )
  })
})
