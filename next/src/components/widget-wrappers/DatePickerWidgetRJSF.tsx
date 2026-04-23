import { DatePickerUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { DateValue } from 'react-aria-components'

import DatePicker from '@/src/components/fields/DatePicker/DatePicker'
import { safeParseDate } from '@/src/components/widget-wrappers/dateTimeParse'
import mapRjsfToReactAriaProps, {
  RJSFWidgetProps,
} from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

type DatePickerWidgetRJSFProps = RJSFWidgetProps<string | undefined, DatePickerUiOptions>

const DatePickerWidgetRJSF = (props: DatePickerWidgetRJSFProps) => {
  const { wrapperProps, fieldProps } = mapRjsfToReactAriaProps(props, {
    toFieldValue: (value) => (value ? safeParseDate(value) : null),
    fromFieldValue: (value: DateValue | null) => (value ? value.toString() : undefined),
  })

  return (
    <WidgetWrapper {...wrapperProps}>
      <DatePicker {...fieldProps} />
    </WidgetWrapper>
  )
}

export default DatePickerWidgetRJSF
