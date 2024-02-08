import Form from '@rjsf/core'
import { createSchemaUtils, RJSFSchema } from '@rjsf/utils'
import { useMemo } from 'react'

import { defaultFormStateBehavior, rjsfValidator } from '../../frontend/utils/form'

export const useFormOmitData = (schema: RJSFSchema) => {
  const schemaUtils = useMemo(
    () => createSchemaUtils(rjsfValidator, schema, defaultFormStateBehavior),
    [schema],
  )
  const formInstance = useMemo(() => new Form({ schema, validator: rjsfValidator }), [schema])

  const omitData = (formData: RJSFSchema) => {
    const form = formInstance
    const retrievedSchema = schemaUtils.retrieveSchema(schema, formData)
    const pathSchema = schemaUtils.toPathSchema(retrievedSchema, '', formData)

    const fieldNames = form.getFieldNames(pathSchema, formData)

    return form.getUsedFormData(formData, fieldNames)
  }

  return { omitData }
}
