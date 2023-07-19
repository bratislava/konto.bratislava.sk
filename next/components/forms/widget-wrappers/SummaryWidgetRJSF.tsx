import { WidgetProps } from '@rjsf/utils'
import React from 'react'

import { useFormState } from '../FormStateProvider'
import SummaryRow from '../steps/Summary/SummaryRow'

interface SummaryWidgetRJSFProps extends WidgetProps {
  fieldWidgetType: string
}

/**
 * TODO: WORKS IN PROGRESS
 *
 * TEMPORARY IMPLEMENTATION
 */
const SummaryWidgetRJSF = ({
  id,
  fieldWidgetType,
  label,
  value,
  rawErrors,
}: SummaryWidgetRJSFProps) => {
  const { goToStepByFieldId } = useFormState()

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
          goToStepByFieldId(id)
        }}
      />
    </div>
  )
}
export default SummaryWidgetRJSF
