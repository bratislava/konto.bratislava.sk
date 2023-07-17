import { FieldProps } from '@rjsf/utils'
import React from 'react'

import { DateFromTo } from '../../groups'
import { ExplicitOptionalType } from '../../types/ExplicitOptional'
import WidgetWrapper from '../WidgetWrapper'
import { getFormSpacingType } from './utils'

interface DateFromToWidgetRJSFProps extends FieldProps {
  formData?: { startDate: string; endDate: string }
}

const DateFromToFieldRJSF = ({
  formData,
  onChange,
  schema,
  uiSchema,
  errorSchema,
}: DateFromToWidgetRJSFProps) => {
  const schemaProperties = {
    ...(schema.properties as Record<string, { type: string; title: string }>),
  }
  const uiOptions = uiSchema?.['ui:options'] ?? {}

  const handleOnChange = (valueName: string, newValue?: string | undefined) => {
    onChange({
      ...formData,
      [valueName]: newValue,
    })
  }

  // TODO fix this code block. Re check what kind of error message it returns and fix in a new way according new task
  const getErrorMessage = (propKey: string): string[] => errorSchema?.[propKey]?.__errors || []

  return (
    <WidgetWrapper
      accordion={uiSchema?.['ui:accordion']}
      spaceTop={getFormSpacingType('spaceTop', uiOptions.spaceTop)}
      spaceBottom={getFormSpacingType('spaceBottom', uiOptions.spaceBottom)}
    >
      <div className={uiOptions?.className as string}>
        <DateFromTo
          DateToTooltip={uiOptions?.DateToTooltip as string}
          DateFromTooltip={uiOptions?.DateFromTooltip as string}
          DateFromRequired={schema.required?.includes('startDate')}
          DateToRequired={schema.required?.includes('endDate')}
          DateFromErrorMessage={getErrorMessage('startDate')}
          DateToErrorMessage={getErrorMessage('endDate')}
          DateFromDescription={uiOptions?.DateFromDescription as string}
          DateToDescription={uiOptions?.DateToDescription as string}
          DateFromExplicitOptional={uiOptions?.DateFromExplicitOptional as ExplicitOptionalType}
          DateToExplicitOptional={uiOptions?.DateToExplicitOptional as ExplicitOptionalType}
          DateFromOnChange={(e) => handleOnChange('startDate', e?.toString())}
          DateToOnChange={(e) => handleOnChange('endDate', e?.toString())}
          DateFromValue={formData?.startDate}
          DateToValue={formData?.endDate}
          DateFromLabel={schemaProperties?.startDate?.title}
          DateToLabel={schemaProperties?.endDate?.title}
          DateFromDisabled={uiOptions?.DateFromDisabled as unknown as boolean}
          DateToDisabled={uiOptions?.DateToDisabled as unknown as boolean}
        />
      </div>
    </WidgetWrapper>
  )
}

export default DateFromToFieldRJSF
