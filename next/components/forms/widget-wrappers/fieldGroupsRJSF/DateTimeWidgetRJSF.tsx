import { FieldProps } from '@rjsf/utils'
import React from 'react'
import { FormSpacingType } from 'schema-generator/generator/uiOptionsTypes'

import { DateTimePicker } from '../../groups'
import WidgetWrapper, { isFormSpacingType } from '../WidgetWrapper'

type DateTimeWidgetRJSFProps = FieldProps<{
  dateValue?: string | undefined
  timeValue?: string | undefined
}>
const DateTimeWidgetRJSF = ({
  formData = {},
  onChange,
  schema,
  uiSchema,
  errorSchema,
  readonly,
}: DateTimeWidgetRJSFProps) => {
  const schemaProperties = {
    ...(schema.properties as Record<string, { type: string; title: string }>),
  }
  const localUiSchema = uiSchema?.['ui:options']

  const handleOnChange = (valueName: string, newValue?: string | undefined) => {
    onChange({
      ...formData,
      [valueName]: newValue || undefined,
    })
  }

  const getFormSpacingType = (
    formSpacingType: 'spaceTop' | 'spaceBottom',
  ): FormSpacingType | undefined => {
    const formSpacingTypeVariant = localUiSchema?.[formSpacingType]
    return typeof formSpacingTypeVariant === 'string' && isFormSpacingType(formSpacingTypeVariant)
      ? formSpacingTypeVariant
      : undefined
  }

  // TODO: fix this code block. Re check what kind of error message it returns and fix in a new way according new task
  const getErrorMessage = (propKey: 'dateValue' | 'timeValue'): string[] =>
    errorSchema?.[propKey]?.__errors || []

  return (
    <WidgetWrapper
      accordion={uiSchema?.['ui:accordion']}
      additionalLinks={uiSchema?.['ui:additionalLinks']}
      spaceTop={getFormSpacingType('spaceTop')}
      spaceBottom={getFormSpacingType('spaceBottom')}
    >
      <div className={localUiSchema?.className as string}>
        <DateTimePicker
          DateTooltip={localUiSchema?.DateTooltip as string}
          TimeTooltip={localUiSchema?.TimeTooltip as string}
          DateDescription={localUiSchema?.DateDescription as string}
          TimeDescription={localUiSchema?.TimeDescription as string}
          DateExplicitOptional={localUiSchema?.DateExplicitOptional as boolean}
          TimeExplicitOptional={localUiSchema?.TimeExplicitOptional as boolean}
          DateRequired={schema.required?.includes('dateValue')}
          TimeRequired={schema.required?.includes('timeValue')}
          DateErrorMessage={getErrorMessage('dateValue')}
          TimeErrorMessage={getErrorMessage('timeValue')}
          DateOnChange={(e) => handleOnChange('dateValue', e ?? undefined)}
          TimeOnChange={(e) => handleOnChange('timeValue', e?.toString())}
          DateValue={formData.dateValue ?? null}
          TimeValue={formData.timeValue}
          DateLabel={schemaProperties?.dateValue?.title}
          TimeLabel={schemaProperties?.timeValue?.title}
          DateDisabled={(localUiSchema?.DateDisabled as unknown as boolean) || readonly}
          TimeDisabled={(localUiSchema?.TimeDisabled as unknown as boolean) || readonly}
        />
      </div>
    </WidgetWrapper>
  )
}

export default DateTimeWidgetRJSF
