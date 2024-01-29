import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { WidgetProps } from '@rjsf/utils'
import cx from 'classnames'
import React from 'react'
import { useDateFormatter } from 'react-aria'
import { CheckboxUiOptions, SelectUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import { useFormContext } from '../../useFormContext'
import { useFormState } from '../../useFormState'
import SummaryFiles from './SummaryFiles'
import SummaryRow from './SummaryRow'
import { useFormSummary } from './useFormSummary'

export type SummaryWidgetType =
  | 'select'
  | 'input'
  | 'radioGroup'
  | 'textArea'
  | 'checkbox'
  | 'checkboxGroup'
  | 'fileUpload'
  | 'datePicker'
  | 'timePicker'

export type SummaryWidgetRJSFProps = Pick<
  WidgetProps,
  'id' | 'label' | 'value' | 'uiSchema' | 'readonly' | 'name'
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
  const { isPdf } = useFormSummary()

  if (value == null || (Array.isArray(value) && value.length === 0)) {
    return <>-</>
  }

  switch (widgetType) {
    case 'select':
      const selectArray = (Array.isArray(value) ? value : [value]) as string[]

      const selectLabels = selectArray.map(
        (innerValue) =>
          (options as SelectUiOptions)?.selectOptions?.[innerValue]?.title ?? innerValue,
      )

      return <>{selectLabels.join(', ')}</>
    case 'radioGroup':
      return (
        <>
          {options.enumOptions?.find((option) => option.value === value)?.label ??
            (value as string)}
        </>
      )
    case 'textArea':
      return <span className={cx('whitespace-pre-wrap', { 'line-clamp-3': !isPdf })}>{value}</span>
    case 'checkbox':
      if (value) {
        return <>{(options as CheckboxUiOptions).checkboxLabel}</>
      }
      return <>-</>
    case 'checkboxGroup':
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
    case 'fileUpload':
      return <SummaryFiles files={value} />
    case 'datePicker':
      try {
        const parsed = parseDate(value as string)
        return <>{formatter.format(parsed.toDate(getLocalTimeZone()))}</>
      } catch (error) {
        // TODO improve
        return <>{value as string}</>
      }
    case 'timePicker':
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
  name,
}: SummaryWidgetRJSFProps) => {
  const { isReadonly } = useFormContext()
  const { fieldHasError, isPdf } = useFormSummary()
  const { goToStepByFieldId } = useFormState()

  return (
    <div>
      <SummaryRow
        data={{
          label,
          value: (
            // className="break-words" doesn't work
            <div style={{ wordBreak: 'break-word' }}>
              <ValueComponent
                widgetType={widgetType}
                value={value}
                options={options}
                uiSchema={uiSchema}
              />
            </div>
          ),
          name,
          isError: fieldHasError(id),
        }}
        onGoToStep={() => {
          goToStepByFieldId(id)
        }}
        isEditable={isPdf ? false : !isReadonly}
        size="small"
        // variant={isPdf ? 'vertical' : 'horizontal'}
      />
    </div>
  )
}
export default SummaryWidgetRJSF
