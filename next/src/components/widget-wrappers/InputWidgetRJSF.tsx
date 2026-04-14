import { WidgetProps } from '@rjsf/utils'
import { InputUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import TextField from '@/src/components/fields/TextField'
import mapRjsfToReactAriaProps from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

const InputWidgetRJSF = (props: WidgetProps) => {
  const { wrapperProps, fieldProps, specificOptions } = mapRjsfToReactAriaProps<
    string,
    InputUiOptions
  >(props, {
    toFieldValue: (v) => v ?? '',
    fromFieldValue: (v) => v || undefined,
  })

  return (
    <WidgetWrapper {...wrapperProps}>
      <TextField
        {...fieldProps}
        type={specificOptions.inputType}
        placeholder={specificOptions.placeholder}
      />
    </WidgetWrapper>
  )
}

export default InputWidgetRJSF
