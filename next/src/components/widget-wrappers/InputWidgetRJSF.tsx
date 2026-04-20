import { InputUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import TextField from '@/src/components/fields/TextField'
import mapRjsfToReactAriaProps, {
  RJSFWidgetProps,
} from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

type InputWidgetRJSFProps = RJSFWidgetProps<string | undefined, InputUiOptions>

const InputWidgetRJSF = (props: InputWidgetRJSFProps) => {
  const { wrapperProps, fieldProps, specificOptions } = mapRjsfToReactAriaProps(props, {
    toFieldValue: (value) => value ?? '',
    fromFieldValue: (value) => (value.length > 0 ? value : undefined),
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
