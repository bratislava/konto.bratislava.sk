import { DateValue } from '@internationalized/date'
import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import { WidgetOptions } from 'components/forms/types/WidgetOptions'
import React from 'react'

import { useFormState } from '../FormStateProvider'
import SummaryRow from '../steps/Summary/SummaryRow'

interface SummaryWidgetRJSFProps extends WidgetProps {
  label: string
  options: WidgetOptions
  value: string | null
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  schema: StrictRJSFSchema
  onChange: (value?: string) => void
  // rawErrors?: string[]
  fieldWidgetType: string
}

const SummaryWidgetRJSF = ({
  id,
  fieldWidgetType,
  label,
  value,
  rawErrors,
  errors,
  uiSchema,
  schema,
  ...rest
}: SummaryWidgetRJSFProps) => {
  const keys = Object.keys({ ...schema.properties })

  const schemaProperties = {
    ...(schema.properties as Record<string, { type: string; title: string }>),
  }
  const localUiSchema = uiSchema?.['ui:options']

  const getLabel = (index: 0 | 1) => schemaProperties[keys[index]].title

  if (fieldWidgetType === 'doubledInput') {
    console.log(rest)
  }

  const { goToStepOfField } = useFormState()
  // console.log('SummaryWidgetRJSF', fieldWidgetType, label, value, rest)
  return (
    <div>
      <SummaryRow
        data={{
          label: `${fieldWidgetType}/${label}`,
          value,
          schemaPath: '',
          isError: Boolean(rawErrors && rawErrors.length > 0),
        }}
        onGoToStep={() => {
          goToStepOfField(id)
        }}
      />
      {/* {type}/{label}: {value} */}
    </div>
  )
}
export default SummaryWidgetRJSF
