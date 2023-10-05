import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { WidgetProps } from '@rjsf/utils'
import React from 'react'
import { useDateFormatter } from 'react-aria'

import { useFormState } from '../../useFormState'
import SummaryFiles from './SummaryFiles'
import SummaryRow from './SummaryRow'
import { useFormSummary } from './useFormSummary'

export type SummaryWidgetType =
  | 'select'
  | 'input'
  | 'radio'
  | 'textarea'
  | 'checkboxes'
  | 'upload'
  | 'datepicker'
  | 'timepicker'

export type SummaryWidgetRJSFProps = Pick<
  WidgetProps,
  'id' | 'label' | 'value' | 'uiSchema' | 'readonly'
> & {
  widgetType: SummaryWidgetType
  options: WidgetProps['options']
}

const ValueComponent = ({
  widgetType,
  value,
  options,
  uiSchema,
}: Pick<SummaryWidgetRJSFProps, 'widgetType' | 'value' | 'options' | 'uiSchema'>) => {
  const formatter = useDateFormatter()

  if (value == null || (Array.isArray(value) && value.length === 0)) {
    return <>-</>
  }

  switch (widgetType) {
    case 'select':
      const selectArray = Array.isArray(value) ? value : [value]
      const selectLabels = selectArray.map(
        (innerValue) =>
          options.enumOptions?.find((option) => option.value === innerValue)?.label ??
          (innerValue as string),
      )

      return <>{selectLabels.join(', ')}</>
    case 'radio':
      return (
        <>
          {options.enumOptions?.find((option) => option.value === value)?.label ??
            (value as string)}
        </>
      )
    case 'textarea':
      return <span className="line-clamp-3 whitespace-pre-wrap">{value}</span>
    case 'checkboxes':
      return (
        <>
          {(value as string[])
            .map(
              (checkboxValue) =>
                options.enumOptions?.find((option) => option.value === checkboxValue)?.label ??
                checkboxValue,
            )
            .join(', ')}
        </>
      )
    case 'upload':
      return <SummaryFiles files={value} />
    case 'datepicker':
      try {
        const parsed = parseDate(value as string)
        return <>{formatter.format(parsed.toDate(getLocalTimeZone()))}</>
      } catch (error) {
        // TODO improve
        return <>{value as string}</>
      }
    case 'timepicker':
      return <>{value as string}</>
    case 'input':
      if (uiSchema?.['ui:options']?.type === 'password') {
        return <>{(value as string).replace(/./g, '●')}</>
      }
      return <>{value as string}</>
    default:
      return <>-</>
  }
}

const SummaryWidgetRJSF = ({
  id,
  widgetType,
  label,
  value,
  options,
  uiSchema,
}: SummaryWidgetRJSFProps) => {
  const { fieldHasError } = useFormSummary()
  const { goToStepByFieldId, isReadonly } = useFormState()

  return (
    <div>
      <SummaryRow
        data={{
          label,
          value: (
            <ValueComponent
              widgetType={widgetType}
              value={value}
              options={options}
              uiSchema={uiSchema}
            />
          ),
          isError: fieldHasError(id),
        }}
        onGoToStep={() => {
          goToStepByFieldId(id)
        }}
        isEditable={!isReadonly}
      />
    </div>
  )
}
export default SummaryWidgetRJSF
