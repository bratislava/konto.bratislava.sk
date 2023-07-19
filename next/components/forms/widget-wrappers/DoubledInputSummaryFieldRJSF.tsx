import { FieldProps } from '@rjsf/utils'
import React from 'react'

import { useFormState } from '../FormStateProvider'
import SummaryRow from '../steps/Summary/SummaryRow'

/**
 * TODO: WORKS IN PROGRESS
 *
 * TEMPORARY IMPLEMENTATION
 */
const DoubledInputSummaryFieldRJSF = ({ id, formData, schema, errorSchema }: FieldProps) => {
  const keys = Object.keys({ ...schema.properties })

  const schemaProperties = {
    ...(schema.properties as Record<string, { type: string; title: string }>),
  }

  const getLabel = (index: 0 | 1) => schemaProperties[keys[index]].title

  const { goToStepByFieldId } = useFormState()

  return (
    <div>
      {([0, 1] as const).map((index) => (
        <SummaryRow
          data={{
            label: `${getLabel(index)}`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            value: formData?.[keys[index]],
            schemaPath: '',
            isError: Boolean(errorSchema?.[keys[index]]?.__errors),
          }}
          onGoToStep={() => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            goToStepByFieldId(id!)
          }}
        />
      ))}
    </div>
  )
}
export default DoubledInputSummaryFieldRJSF
