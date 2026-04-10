import { WidgetProps } from '@rjsf/utils'
import { InputUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import TextField from '@/src/components/fields/TextField'
import useRjsfAdapter from '@/src/components/widget-wrappers/useRjsfAdapter'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

const InputWidgetRJSF = (props: WidgetProps) => {
  const { wrapperProps, fieldProps, specificOptions } = useRjsfAdapter<string, InputUiOptions>(
    props,
    {
      toField: (v) => v ?? '',
      fromField: (v) => v || undefined,
    },
  )

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
