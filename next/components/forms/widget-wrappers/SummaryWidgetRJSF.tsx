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
  ...rest
}: SummaryWidgetRJSFProps) => {
  const { goToStepOfField } = useFormState()
  // console.log('SummaryWidgetRJSF', fieldWidgetType, label, value, rest)
  return (
    <div>
      <SummaryRow
        data={{
          label: `${fieldWidgetType}/${label}`,
          value,
          schemaPath: '',
          isError: Boolean(errors),
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
