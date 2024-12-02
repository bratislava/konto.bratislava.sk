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
 * 1. Ajv/RJSF validator is stateful and contains information of previous validations
 *    - On backend, it's safer to use new instance for each validation
 *
 * 2. RJSF internally calls handleSchemaUpdate on each isValid call:
 *    ```ts
 *    isValid(schema, data, rootSchema) {
 *      // On each validation, checks if schema exists or has changed
 *      if (this.ajv.getSchema(ROOT_PREFIX) === undefined) {
 *        this.ajv.addSchema(rootSchema, ROOT_PREFIX)  // Compiles schema
 *      } else if (!deepEquals(rootSchema, this.ajv.getSchema(ROOT_PREFIX).schema)) {
 *        this.ajv.removeSchema(ROOT_PREFIX)
 *        this.ajv.addSchema(rootSchema, ROOT_PREFIX)  // Recompiles schema
 *      }
 *      return this.ajv.validate()
 *    }
 *    ```
 *
 * On frontend, the validator is called with multiple different schemas, which previously caused
 * very expensive `handleSchemaUpdate` to be called between all validations, significantly slowing
 * down the application.
 *
 * Two implementations are provided:
 * - SingleUseValidatorRegistry: Creates new validator for each getValidator call
 *   - Used on backend where state isolation is important
 *
 * - WeakMapRegistry: Caches validators by schema reference
 *   - Used on frontend to prevent repeated schema compilations
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
 * Creates a registry that caches validators by schema reference.
 * Used on frontend to prevent repeated schema compilations when validating the same schema multiple times.
 */
export const createWeakMapRegistry = (): BaRjsfValidatorRegistry => {
  const validatorCache = new WeakMap<BAJSONSchema7, BaRjsfValidator>()

  return {
    getValidator(schema: BAJSONSchema7) {
      let validator = validatorCache.get(schema)

      if (!validator) {
        validator = getBaRjsfValidator()
        validatorCache.set(schema, validator)
      }

      return validator
    },
  }
}
