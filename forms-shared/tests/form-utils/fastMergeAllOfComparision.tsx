import { beforeEach, describe, expect, test, vi } from 'vitest'
import { renderTestForm } from '../../test-utils/testForm'
import * as fastMergeAllOfModule from '../../src/form-utils/fastMergeAllOf'
import type mergeAllOf from 'json-schema-merge-allof'
import { BAJSONSchema7 } from '../../src/form-utils/ajvKeywords'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { getBaFormDefaults } from '../../src/form-utils/formDefaults'
import { JSONSchema7 } from 'json-schema'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

const spyFastMergeAllOf = vi.spyOn(fastMergeAllOfModule, 'baFastMergeAllOf')

const mockOriginalMergeAllOf = vi.fn(
  (
    (await vi.importActual('json-schema-merge-allof')) as {
      default: typeof mergeAllOf
    }
  ).default,
)

vi.mock('json-schema-merge-allof', () => ({
  __esModule: true,
  default: (...args: Parameters<typeof mergeAllOf>) => mockOriginalMergeAllOf(...args),
}))

/**
 * `json-schema-merge-allof` returns required fields in an unpredictable order, so we sort them
 * to ensure consistent comparison between implementations.
 */
const normalizeObject = (schema: BAJSONSchema7) => {
  const normalized = { ...schema }

  if (normalized.required) {
    normalized.required = normalized.required.toSorted()
  }

  return normalized as BAJSONSchema7
}

const normalizeObjectAllOfs = (schema: BAJSONSchema7) => {
  const normalized = { ...schema }

  if (normalized.allOf) {
    normalized.allOf = (normalized.allOf as BAJSONSchema7[]).map(normalizeObject)
  }

  return normalized as BAJSONSchema7
}

/**
 * Comprehensive test suite that validates our fast allOf merge implementation against the original
 * json-schema-merge-allof library. Since both implementations should behave identically when
 * processing the same form, we can expect not just identical results, but also identical call
 * patterns (same order of calls/returns).
 *
 * Unlike simple unit tests, this suite provides stronger confidence by testing the full integration
 * within RJSF form rendering. By using real-world form examples from our codebase, we validate
 * the implementation in actual usage scenarios rather than isolated test cases.
 *
 * The test renders real-world forms and verifies that:
 * 1. Both implementations receive the same schema inputs
 * 2. Both produce the same merge results
 * 3. The final rendered forms are identical
 *
 * This ordering guarantee is possible because RJSF processes schemas deterministically,
 * and we use server-side rendering to eliminate any runtime variations. The only normalization
 * needed is for required fields, which may be ordered differently by the original implementation.
 *
 * More context:
 * https://github.com/rjsf-team/react-jsonschema-form/pull/4308
 */
describe('fastMergeAllOfComparision', () => {
  getExampleFormPairs({ includeDevForms: true }).forEach(({ formDefinition, exampleForm }) => {
    describe(`json-schema-merge-allof results for ${exampleForm.name}`, () => {
      let originalForm: ReturnType<typeof renderTestForm>
      let fastForm: ReturnType<typeof renderTestForm>
      let originalFormCalls: typeof mockOriginalMergeAllOf.mock.calls
      let originalFormResults: typeof mockOriginalMergeAllOf.mock.results
      let originalFormFastCalls: typeof spyFastMergeAllOf.mock.calls
      let fastFormCalls: typeof spyFastMergeAllOf.mock.calls
      let fastFormResults: typeof spyFastMergeAllOf.mock.results
      let fastFormOriginalCalls: typeof mockOriginalMergeAllOf.mock.calls

      beforeEach(() => {
        // Clear the existing spies/mocks.
        mockOriginalMergeAllOf.mockClear()
        spyFastMergeAllOf.mockClear()

        originalForm = renderTestForm({
          schema: formDefinition.schema,
          formData: exampleForm.formData,
          ...getBaFormDefaults(formDefinition.schema, testValidatorRegistry),
          experimental_customMergeAllOf: undefined,
        })
        originalFormCalls = mockOriginalMergeAllOf.mock.calls
        originalFormResults = mockOriginalMergeAllOf.mock.results
        originalFormFastCalls = spyFastMergeAllOf.mock.calls

        // Clear the mocks/spies before re-rendering with our custom merge.
        mockOriginalMergeAllOf.mockClear()
        spyFastMergeAllOf.mockClear()

        fastForm = renderTestForm({
          schema: formDefinition.schema,
          formData: exampleForm.formData,
          ...getBaFormDefaults(formDefinition.schema, testValidatorRegistry),
        })
        fastFormCalls = spyFastMergeAllOf.mock.calls
        fastFormResults = spyFastMergeAllOf.mock.results
        fastFormOriginalCalls = mockOriginalMergeAllOf.mock.calls
      })

      test('should render identical forms', () => {
        expect(originalForm).toEqual(fastForm)
      })

      test('should use correct merge functions', () => {
        expect(originalFormResults).not.toHaveLength(0)
        expect(fastFormResults).not.toHaveLength(0)
        expect(originalFormCalls).not.toHaveLength(0)
        expect(fastFormCalls).not.toHaveLength(0)
      })

      test('should produce identical merge results', () => {
        expect(originalFormResults.every((result) => result.type === 'return')).toBe(true)
        expect(fastFormResults.every((result) => result.type === 'return')).toBe(true)

        const normalizedOriginalFormResults = originalFormResults.map((result) =>
          normalizeObject(result.value as BAJSONSchema7),
        )
        const normalizedFastFormResults = fastFormResults.map((result) =>
          normalizeObject(result.value as BAJSONSchema7),
        )
        expect(normalizedOriginalFormResults).toEqual(normalizedFastFormResults)
      })

      test('should receive identical input schemas', () => {
        const normalizedOriginalFormCalls = originalFormCalls
          .map(([schema]) => schema as JSONSchema7)
          .map(normalizeObjectAllOfs)
        const normalizedFastFormCalls = fastFormCalls
          .map(([schema]) => schema as JSONSchema7)
          .map(normalizeObjectAllOfs)
        expect(normalizedOriginalFormCalls).toEqual(normalizedFastFormCalls)
      })

      test('should not cross-use merge functions', () => {
        // Original form should not use fast merge
        expect(originalFormFastCalls).toHaveLength(0)

        // Fast form should not use original merge
        expect(fastFormOriginalCalls).toHaveLength(0)
      })
    })
  })
})
