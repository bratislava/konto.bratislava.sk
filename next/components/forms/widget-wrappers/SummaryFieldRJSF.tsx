import { ErrorSchema, FieldProps, GenericObjectType, RJSFSchema } from '@rjsf/utils'
import React from 'react'

import { useFormState } from '../FormStateProvider'
import SummaryRow from '../steps/Summary/SummaryRow'

export type SummaryFieldType = 'doubledInput' | 'dateFromTo' | 'timeFromTo' | 'dateTime'

export type SummaryFieldRJSFProps = Pick<
  FieldProps<GenericObjectType>,
  'formData' | 'schema' | 'errorSchema' | 'idSchema'
> & {
  fieldType: SummaryFieldType
}

const SummaryFieldRJSF = ({
  formData,
  schema,
  errorSchema,
  idSchema,
  fieldType,
}: SummaryFieldRJSFProps) => {
  const { goToStepByFieldId } = useFormState()

  if (!schema.properties) {
    return null
  }

  const inputs = Object.entries(
    schema.properties as Record<string, { type: string; title: string }>,
  ).map(([key, value]) => {
    return {
      label: value.title,
      value: formData?.[key],
      isError: Boolean(errorSchema?.[key]?.__errors),
    }
  })

  return (
    <div>
      {inputs.map(({ label, value, isError }) => (
        <SummaryRow
          data={{
            label,
            value,
            schemaPath: '',
            isError,
          }}
          onGoToStep={() => {
            goToStepByFieldId(idSchema.$id)
          }}
        />
      ))}
    </div>
  )
}
export default SummaryFieldRJSF
