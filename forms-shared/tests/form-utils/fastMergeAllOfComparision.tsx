import { renderTestForm } from '../../test-utils/testForm'
import type { baFastMergeAllOf } from '../../src/form-utils/fastMergeAllOf'
import type mergeAllOf from 'json-schema-merge-allof'
import { BAJSONSchema7 } from '../../src/form-utils/ajvKeywords'
import { getExampleFormPairs } from '../../src/example-forms/getExampleFormPairs'
import { getBaFormDefaults } from '../../src/form-utils/formDefaults'
import { JSONSchema7 } from 'json-schema'
import { testValidatorRegistry } from '../../test-utils/validatorRegistry'

const mockFastMergeAllOf = jest.fn(
  jest.requireActual('../../src/form-utils/fastMergeAllOf')
    .baFastMergeAllOf as typeof baFastMergeAllOf,
)
jest.mock('../../src/form-utils/fastMergeAllOf', () => ({
  ...jest.requireActual('../../src/form-utils/fastMergeAllOf'),
  baFastMergeAllOf: ((...args) => mockFastMergeAllOf(...args)) as typeof baFastMergeAllOf,
}))

const mockOriginalMergeAllOf = jest.fn(
  jest.requireActual('json-schema-merge-allof') as typeof mergeAllOf,
)
jest.mock('json-schema-merge-allof', () => ({
  __esModule: true,
  default: ((...args) => mockOriginalMergeAllOf(...args)) as typeof mergeAllOf<BAJSONSchema7>,
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
      let originalFormCalls: jest.Mock['mock']['calls']
      let originalFormResults: jest.Mock['mock']['results']
      let originalFormFastCalls: jest.Mock['mock']['calls']
      let fastFormCalls: jest.Mock['mock']['calls']
      let fastFormResults: jest.Mock['mock']['results']
      let fastFormOriginalCalls: jest.Mock['mock']['calls']

      beforeEach(() => {
        mockOriginalMergeAllOf.mockClear()
        mockFastMergeAllOf.mockClear()

        originalForm = renderTestForm({
          schema: formDefinition.schema,
          formData: exampleForm.formData,
          ...getBaFormDefaults(formDefinition.schema, testValidatorRegistry),
          experimental_customMergeAllOf: undefined,
        })
        originalFormCalls = mockOriginalMergeAllOf.mock.calls
        originalFormResults = mockOriginalMergeAllOf.mock.results
        originalFormFastCalls = mockFastMergeAllOf.mock.calls

        mockOriginalMergeAllOf.mockClear()
        mockFastMergeAllOf.mockClear()

        fastForm = renderTestForm({
          schema: formDefinition.schema,
          formData: exampleForm.formData,
          ...getBaFormDefaults(formDefinition.schema, testValidatorRegistry),
        })
        fastFormCalls = mockFastMergeAllOf.mock.calls
        fastFormResults = mockFastMergeAllOf.mock.results
        fastFormOriginalCalls = mockOriginalMergeAllOf.mock.calls
      })

      it('should render identical forms', () => {
        expect(originalForm).toEqual(fastForm)
      })

      it('should use correct merge functions', () => {
        expect(originalFormResults).not.toHaveLength(0)
        expect(fastFormResults).not.toHaveLength(0)
        expect(originalFormCalls).not.toHaveLength(0)
        expect(fastFormCalls).not.toHaveLength(0)
      })

      it('should produce identical merge results', () => {
        expect(originalFormResults.every((result) => result.type === 'return')).toBe(true)
        expect(fastFormResults.every((result) => result.type === 'return')).toBe(true)

        const normalizedOriginalFormResults = originalFormResults.map((result) =>
          normalizeObject(result.value),
        )
        const normalizedFastFormResults = fastFormResults.map((result) =>
          normalizeObject(result.value),
        )
        expect(normalizedOriginalFormResults).toEqual(normalizedFastFormResults)
      })

      it('should receive identical input schemas', () => {
        const normalizedOriginalFormCalls = originalFormCalls
          .map(([schema]) => schema as JSONSchema7)
          .map(normalizeObjectAllOfs)
        const normalizedFastFormCalls = fastFormCalls
          .map(([schema]) => schema as JSONSchema7)
          .map(normalizeObjectAllOfs)
        expect(normalizedOriginalFormCalls).toEqual(normalizedFastFormCalls)
      })

      it('should not cross-use merge functions', () => {
        // Original form should not use fast merge
        expect(originalFormFastCalls).toHaveLength(0)

        // Fast form should not use original merge
        expect(fastFormOriginalCalls).toHaveLength(0)
      })
    })
  })
})
