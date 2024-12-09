import { createSchemaUtils, GenericObjectType, RJSFSchema } from '@rjsf/utils'
import Form from '@rjsf/core'
import { baDefaultFormStateBehavior } from './defaultFormState'
import { BaRjsfValidatorRegistry } from './validatorRegistry'
import { baFastMergeAllOf } from './fastMergeAllOf'

/**
 * Omits extra data from form data.
 *
 * Until https://github.com/rjsf-team/react-jsonschema-form/issues/4081 is resolved this is the only way how to omit
 * extra data from form data.
 */
export function omitExtraData(
  schema: RJSFSchema,
  formData: GenericObjectType,
  validatorRegistry: BaRjsfValidatorRegistry,
): GenericObjectType {
  const validator = validatorRegistry.getValidator(schema)
  const schemaUtils = createSchemaUtils(
    validator,
    schema,
    baDefaultFormStateBehavior,
    baFastMergeAllOf,
  )
  const formInstance = new Form({ schema, validator })

  const retrievedSchema = schemaUtils.retrieveSchema(schema, formData)
  const pathSchema = schemaUtils.toPathSchema(retrievedSchema, undefined, formData)
  const fieldNames = formInstance.getFieldNames(pathSchema, formData)

  return formInstance.getUsedFormData(formData, fieldNames)
}
