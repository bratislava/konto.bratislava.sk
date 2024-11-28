import { createSchemaUtils, GenericObjectType, RJSFSchema } from '@rjsf/utils'
import Form from '@rjsf/core'
import { baRjsfValidator } from './validators'
import { baDefaultFormStateBehavior } from './defaultFormState'
import { baFastMergeAllOf } from './fastMergeAllOf'

/**
 * Omits extra data from form data.
 *
 * Until https://github.com/rjsf-team/react-jsonschema-form/issues/4081 is resolved this is the only way how to omit
 * extra data from form data.
 */
export function omitExtraData(schema: RJSFSchema, formData: GenericObjectType): GenericObjectType {
  const schemaUtils = createSchemaUtils(
    baRjsfValidator,
    schema,
    baDefaultFormStateBehavior,
    baFastMergeAllOf,
  )
  const formInstance = new Form({ schema, validator: baRjsfValidator })

  const retrievedSchema = schemaUtils.retrieveSchema(schema, formData)
  const pathSchema = schemaUtils.toPathSchema(retrievedSchema, undefined, formData)
  const fieldNames = formInstance.getFieldNames(pathSchema, formData)

  return formInstance.getUsedFormData(formData, fieldNames)
}
