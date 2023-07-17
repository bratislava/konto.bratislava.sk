import { FieldProps } from '@rjsf/utils'
import React from 'react'

import { TimeFromTo } from '../../groups'
import { ExplicitOptionalType } from '../../types/ExplicitOptional'
import WidgetWrapper from '../WidgetWrapper'
import { getFormSpacingType } from './utils'

interface TimeFromToWidgetRJSFProps extends FieldProps {
  formData?: { startTime: string; endTime: string }
}

const TimeFromToWidgetRJSF = ({
  formData,
  onChange,
  schema,
  uiSchema,
  errorSchema,
}: TimeFromToWidgetRJSFProps) => {
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
        <TimeFromTo
          TimeToTooltip={uiOptions?.TimeToTooltip as string}
          TimeFromTooltip={uiOptions?.TimeFromTooltip as string}
          TimeFromDescription={uiOptions?.TimeFromDescription as string}
          TimeToDescription={uiOptions?.TimeToDescription as string}
          TimeFromRequired={schema.required?.includes('startTime')}
          TimeToRequired={schema.required?.includes('endTime')}
          TimeFromErrorMessage={getErrorMessage('startTime')}
          TimeToErrorMessage={getErrorMessage('endTime')}
          TimeFromExplicitOptional={uiOptions?.TimeFromExplicitOptional as ExplicitOptionalType}
          TimeToExplicitOptional={uiOptions?.TimeToExplicitOptional as ExplicitOptionalType}
          TimeFromOnChange={(e) => handleOnChange('startTime', e?.toString())}
          TimeToOnChange={(e) => handleOnChange('endTime', e?.toString())}
          TimeFromValue={formData?.startTime}
          TimeToValue={formData?.endTime}
          TimeFromLabel={schemaProperties?.startTime?.title}
          TimeToLabel={schemaProperties?.endTime?.title}
          TimeFromDisabled={uiOptions?.TimeFromDisabled as unknown as boolean}
          TimeToDisabled={uiOptions?.TimeToDisabled as unknown as boolean}
        />
      </div>
    </WidgetWrapper>
  )
}

export default TimeFromToWidgetRJSF
