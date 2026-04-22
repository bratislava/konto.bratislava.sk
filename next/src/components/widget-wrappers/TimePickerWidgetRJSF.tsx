import { TimePickerUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { TimeValue } from 'react-aria-components'

import TimeField from '@/src/components/fields/TimeField'
import FieldBlurWrapper from '@/src/components/widget-components/FieldBlurWrapper/FieldBlurWrapper'
import {
  formatTime,
  safeParseTime,
} from '@/src/components/widget-wrappers/dateTimeParse'
import mapRjsfToReactAriaProps, {
  RJSFWidgetProps,
} from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

type TimePickerWidgetRJSFProps = RJSFWidgetProps<string | undefined, TimePickerUiOptions>

const TimePickerWidgetRJSF = (props: TimePickerWidgetRJSFProps) => {
  const { wrapperProps, fieldProps } = mapRjsfToReactAriaProps(props, {
    toFieldValue: (value) => (value ? safeParseTime(value) : null),
    fromFieldValue: (value: TimeValue | null) => (value ? formatTime(value) : undefined),
  })
  const { minValue, maxValue } = props.options

  return (
    <WidgetWrapper {...wrapperProps}>
      <FieldBlurWrapper value={fieldProps.value} onChange={fieldProps.onChange}>
        {({ value, onChange, onBlur }) => (
          <TimeField
            {...fieldProps}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            minValue={minValue ? safeParseTime(minValue) ?? undefined : undefined}
            maxValue={maxValue ? safeParseTime(maxValue) ?? undefined : undefined}
          />
        )}
      </FieldBlurWrapper>
    </WidgetWrapper>
  )
}

export default TimePickerWidgetRJSF
