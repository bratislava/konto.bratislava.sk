import { FieldProps } from '@rjsf/utils'
import React from 'react'
import { FormSpacingType } from 'schema-generator/generator/uiOptionsTypes'

import { TimeFromTo } from '../../groups'
import WidgetWrapper, { isFormSpacingType } from '../WidgetWrapper'

type TimeFromToWidgetRJSFProps = FieldProps<{
  startTime?: string | undefined
  endTime?: string | undefined
}>

const TimeFromToWidgetRJSF = ({
  formData,
  onChange,
  schema,
  uiSchema,
  errorSchema,
  readonly,
}: TimeFromToWidgetRJSFProps) => {
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
  const getErrorMessage = (propKey: 'startTime' | 'endTime'): string[] =>
    errorSchema?.[propKey]?.__errors || []

  return (
    <WidgetWrapper
      accordion={uiSchema?.['ui:accordion']}
      additionalLinks={uiSchema?.['ui:additionalLinks']}
      spaceTop={getFormSpacingType('spaceTop')}
      spaceBottom={getFormSpacingType('spaceBottom')}
    >
      <div className={localUiSchema?.className as string}>
        <TimeFromTo
          TimeToTooltip={localUiSchema?.TimeToTooltip as string}
          TimeFromTooltip={localUiSchema?.TimeFromTooltip as string}
          TimeFromDescription={localUiSchema?.TimeFromDescription as string}
          TimeToDescription={localUiSchema?.TimeToDescription as string}
          TimeFromRequired={schema.required?.includes('startTime')}
          TimeToRequired={schema.required?.includes('endTime')}
          TimeFromErrorMessage={getErrorMessage('startTime')}
          TimeToErrorMessage={getErrorMessage('endTime')}
          TimeFromExplicitOptional={localUiSchema?.TimeFromExplicitOptional as boolean}
          TimeToExplicitOptional={localUiSchema?.TimeToExplicitOptional as boolean}
          TimeFromOnChange={(e) => handleOnChange('startTime', e?.toString())}
          TimeToOnChange={(e) => handleOnChange('endTime', e?.toString())}
          TimeFromValue={formData?.startTime}
          TimeToValue={formData?.endTime}
          TimeFromLabel={schemaProperties?.startTime?.title}
          TimeToLabel={schemaProperties?.endTime?.title}
          TimeFromDisabled={(localUiSchema?.TimeFromDisabled as unknown as boolean) || readonly}
          TimeToDisabled={(localUiSchema?.TimeToDisabled as unknown as boolean) || readonly}
        />
      </div>
    </WidgetWrapper>
  )
}

export default TimeFromToWidgetRJSF
