import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { FieldProps, GenericObjectType } from '@rjsf/utils'
import React from 'react'
import { useDateFormatter } from 'react-aria'

import { useFormState } from '../../FormStateProvider'
import SummaryRow from './SummaryRow'

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
  const formatter = useDateFormatter()

  const formatDate = (value: string) => {
    try {
      const parsed = parseDate(value)
      return formatter.format(parsed.toDate(getLocalTimeZone()))
    } catch (error) {
      // TODO improve
      return value
    }
  }

  if (!schema.properties) {
    return null
  }

  const inputs = Object.entries(
    schema.properties as Record<string, { type: string; title: string }>,
  ).map(([key, value]) => {
    const formDataValue = formData?.[key]
    const getValue = () => {
      if (fieldType === 'dateFromTo') {
        return formatDate(formDataValue as string)
      }

      if (fieldType === 'dateTime') {
        if (key === 'dateValue') {
          return formatDate(formDataValue as string)
        }
        if (key === 'timeValue') {
          return formDataValue as string
        }

        return formDataValue as string
      }

      return formDataValue as string
    }

    return {
      label: value.title,
      value: getValue(),
      isError: Boolean(errorSchema?.[key]?.__errors),
    }
  })

  return (
    <div>
      {inputs.map(({ label, value, isError }, index) => (
        <SummaryRow
          key={index}
          data={{
            label,
            value,
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
