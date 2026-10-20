import { hashForSchema } from '@rjsf/utils'

import { BAJSONSchema7 } from './ajvKeywords'
import { getBaRjsfValidator } from './validators'

export type BaRjsfValidator = ReturnType<typeof getBaRjsfValidator>

/**
 * Registry interface for managing RJSF validators.
 *
 * Previously, a single validator instance was used:
 * ```ts
 * const validator = getBaRjsfValidator()
 * functionWithValidator(...args, validator)
 * ```
 *
 * The registry pattern was introduced because:
 * 1. Ajv/RJSF validator is stateful, it keeps every schema it has compiled (conditions are cached by their content hash
 *    and never removed) and a single root schema
 *    - On backend, it's safer to use new instance for each validation
 *
 * 2. RJSF internally calls `handleSchemaUpdate` on each `isValid` call (simplified, `@rjsf/validator-ajv8` 6.11):
 *    ```ts
 *    handleSchemaUpdate(rootSchema) {
 *      // Same root schema object as in the previous call, nothing to do
 *      if (this.lastSeenRootSchema === rootSchema) return
 *
 *      const rootSchemaId = rootSchema.$id ?? ROOT_SCHEMA_PREFIX
 *      if (this.ajv.getSchema(rootSchemaId) === undefined) {
 *        this.ajv.addSchema(rootSchema, rootSchemaId)
 *      } else if (!deepEquals(rootSchema, this.ajv.getSchema(rootSchemaId).schema)) {
 *        // Different root schema content, it is added again and recompiled when needed
 *        this.ajv.removeSchema(rootSchemaId)
 *        this.ajv.addSchema(rootSchema, rootSchemaId)
 *      }
 *      this.lastSeenRootSchema = rootSchema
 *    }
 *    ```
 *
 * On frontend, the validator is called with multiple different root schemas (the whole form, each step), which with a
 * single validator caused very expensive `handleSchemaUpdate` to be called between all validations, significantly
 * slowing down the application.
 *
 * Two implementations are provided:
 * - SingleUseValidatorRegistry: Creates new validator for each getValidator call
 *   - Used on backend where state isolation is important
 *
 * - WeakMapRegistry: Caches validators by schema reference, falling back to schema content
 *   - Used on frontend to prevent repeated schema compilations
 *   - The content fallback covers schemas recreated as new objects with the same content (see
 *     `createWeakMapRegistry`)
 *   - Uses WeakMap to allow garbage collection of unused schemas
 */
export type BaRjsfValidatorRegistry = {
  getValidator(schema: BAJSONSchema7): BaRjsfValidator
}

/**
 * Creates a registry that returns a new validator instance for each call.
 * Used on backend where state isolation is important.
 */
export const createSingleUseValidatorRegistry = (): BaRjsfValidatorRegistry => {
  return {
    getValidator() {
      return getBaRjsfValidator()
    },
  }
}

/**
 * Creates a registry that caches validators by schema reference, falling back to schema content.
 * Used on frontend to reuse compiled schemas: a validator keeps the schemas it has compiled, a new validator compiles
 * them again.
 *
 * The content fallback is needed for the step form. It gets the validator for the current step schema, which is
 * evaluated by `retrieveSchema` on every form data change. For an active conditional step (`if`/`then`),
 * `retrieveSchema` returns a new object with the same content each time, so a cache by reference alone missed on every
 * keystroke and the new validator compiled all conditions of the step again. Plain steps and the whole form schema keep
 * their objects and are found by reference.
 *
 * The content is hashed with `hashForSchema` (the same hash RJSF uses to cache conditions) only once per schema object,
 * any further calls with the same object are WeakMap hits. A hash collision only costs performance, the validator still
 * detects the different root schema in `handleSchemaUpdate`. Unlike the WeakMap, the content map keeps its validators
 * alive, so only `maxContentEntries` most recently used contents are kept.
 */
export const createWeakMapRegistry = (maxContentEntries = 50): BaRjsfValidatorRegistry => {
  const validatorByReference = new WeakMap<BAJSONSchema7, BaRjsfValidator>()
  // Map keeps insertion order, the first entry is the least recently used one
  const validatorByContent = new Map<string, BaRjsfValidator>()

  return {
    getValidator(schema: BAJSONSchema7) {
      const cachedValidator = validatorByReference.get(schema)
      if (cachedValidator) {
        return cachedValidator
      }

      const hash = hashForSchema(schema)
      let validator = validatorByContent.get(hash)
      if (validator) {
        validatorByContent.delete(hash)
      } else {
        validator = getBaRjsfValidator()
        if (validatorByContent.size >= maxContentEntries) {
          const [leastRecentlyUsedHash] = validatorByContent.keys()
          validatorByContent.delete(leastRecentlyUsedHash)
        }
      }

      validatorByContent.set(hash, validator)
      validatorByReference.set(schema, validator)

      return validator
    },
  }
}
