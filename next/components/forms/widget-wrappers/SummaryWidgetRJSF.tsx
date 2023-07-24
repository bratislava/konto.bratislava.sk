import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { WidgetProps } from '@rjsf/utils'
import React from 'react'
import { useDateFormatter } from 'react-aria'

import { useFormState } from '../FormStateProvider'
import SummaryRow from '../steps/Summary/SummaryRow'
import { CheckboxesRJSFOptions } from './CheckboxWidgetRJSF'
import { RadioButtonRJSFOptions } from './RadioButtonWidgetRJSF'
import { SelectRJSFOptions } from './SelectFieldWidgetRJSF'

export type SummaryWidgetType =
  | 'select'
  | 'input'
  | 'radio'
  | 'textarea'
  | 'checkboxes'
  | 'upload'
  | 'datepicker'
  | 'timepicker'

type X =
  | {
      widgetType: 'select'
      options: SelectRJSFOptions
    }
  | {
      widgetType: 'radio'
      options: RadioButtonRJSFOptions
    }
  | {
      widgetType: 'checkboxes'
      options: CheckboxesRJSFOptions
    }
  | {
      widgetType: Omit<SummaryWidgetType, 'select' | 'radio' | 'checkboxes'>
      options: WidgetProps['options']
    }

export type SummaryWidgetRJSFProps = Pick<
  WidgetProps,
  'id' | 'label' | 'value' | 'rawErrors' | 'uiSchema'
> &
  X

const ValueComponent = ({
  widgetType,
  value,
  options,
  uiSchema,
}: Pick<SummaryWidgetRJSFProps, 'widgetType' | 'value' | 'options' | 'uiSchema'>) => {
  const formatter = useDateFormatter()

  if (!value) {
    return <>-</>
  }

  switch (widgetType) {
    case 'select':
      const selectOptions = options as SelectRJSFOptions
      return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {selectOptions.enumOptions?.find((option) => option.value === value)?.label ??
            (value as string)}
        </>
      )
    case 'radio':
      const radioOptions = options as RadioButtonRJSFOptions
      return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {radioOptions.enumOptions?.find((option) => option.value === value)?.label ??
            (value as string)}
        </>
      )
    case 'textarea':
      return <span className="line-clamp-3 whitespace-pre-wrap">{value}</span>
    case 'checkboxes':
      const checkboxesOptions = options as CheckboxesRJSFOptions
      return (
        <>
          {(value as string[])
            .map(
              (checkboxValue) =>
                checkboxesOptions.enumOptions?.find((option) => option.value === checkboxValue)
                  ?.label ?? checkboxValue,
            )
            .join(', ')}
        </>
      )
    case 'upload':
      return <a href={value}>File</a>
    case 'datepicker':
      const parsed = parseDate(value as string)
      return <>{formatter.format(parsed.toDate(getLocalTimeZone()))}</>
    case 'timepicker':
      // eslint-disable-next-line react/jsx-no-useless-fragment
      return <>{value as string}</>
    case 'input':
      if (uiSchema?.['ui:options']?.type === 'password') {
        return <>{(value as string).replace(/./g, '●')}</>
      }
      // eslint-disable-next-line react/jsx-no-useless-fragment
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
  rawErrors,
  options,
  uiSchema,
  ...rest
}: SummaryWidgetRJSFProps) => {
  const { goToStepByFieldId } = useFormState()

  return (
    <div>
      <SummaryRow
        data={{
          label: `${widgetType}/${label}`,
          value: (
            <ValueComponent
              widgetType={widgetType}
              value={value}
              options={options}
              uiSchema={uiSchema}
            />
          ),
          isError: Boolean(rawErrors && rawErrors.length > 0),
        }}
        onGoToStep={() => {
          console.log(id, widgetType, label, value, rawErrors, rest)
          // goToStepByFieldId(id)
        }}
      />
    </div>
  )
}
export default SummaryWidgetRJSF
