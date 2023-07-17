import { FieldProps } from '@rjsf/utils'
import React from 'react'

import { DateTimePicker } from '../../groups'
import { ExplicitOptionalType } from '../../types/ExplicitOptional'
import WidgetWrapper from '../WidgetWrapper'
import { getFormSpacingType } from './utils'

interface DateTimeWidgetRJSFProps extends FieldProps {
  formData?: { dateValue: string; timeValue: string }
}

const DateTimeFieldRJSF = ({
  formData,
  onChange,
  schema,
  uiSchema,
  errorSchema,
}: DateTimeWidgetRJSFProps) => {
  const schemaProperties = {
    ...(schema.properties as Record<string, { type: string; title: string }>),
  }
  const uiOptions = uiSchema?.['ui:options'] ?? {}

  const handleOnChange = (valueName: string, newValue?: string | undefined) => {
    onChange({
      ...formData,
      [valueName]: newValue || undefined,
    })
  }

  // TODO: fix this code block. Re check what kind of error message it returns and fix in a new way according new task
  const getErrorMessage = (propKey: string): string[] => errorSchema?.[propKey]?.__errors || []

  return (
    <WidgetWrapper
      accordion={uiSchema?.['ui:accordion']}
      spaceTop={getFormSpacingType('spaceTop', uiOptions.spaceTop)}
      spaceBottom={getFormSpacingType('spaceBottom', uiOptions.spaceBottom)}
    >
      <div className={uiOptions?.className as string}>
        <DateTimePicker
          DateTooltip={uiOptions?.DateTooltip as string}
          TimeTooltip={uiOptions?.TimeTooltip as string}
          DateDescription={uiOptions?.DateDescription as string}
          TimeDescription={uiOptions?.TimeDescription as string}
          DateExplicitOptional={uiOptions?.DateExplicitOptional as ExplicitOptionalType}
          TimeExplicitOptional={uiOptions?.TimeExplicitOptional as ExplicitOptionalType}
          DateRequired={schema.required?.includes('dateValue')}
          TimeRequired={schema.required?.includes('timeValue')}
          DateErrorMessage={getErrorMessage('dateValue')}
          TimeErrorMessage={getErrorMessage('timeValue')}
          DateOnChange={(e) => handleOnChange('dateValue', e?.toString())}
          TimeOnChange={(e) => handleOnChange('timeValue', e?.toString())}
          DateValue={formData?.dateValue}
          TimeValue={formData?.timeValue}
          DateLabel={schemaProperties?.dateValue?.title}
          TimeLabel={schemaProperties?.timeValue?.title}
          DateDisabled={uiOptions?.DateDisabled as unknown as boolean}
          TimeDisabled={uiOptions?.TimeDisabled as unknown as boolean}
        />
      </div>
    </WidgetWrapper>
  )
}

export default DateTimeFieldRJSF
