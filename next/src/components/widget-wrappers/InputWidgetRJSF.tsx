import { WidgetProps } from '@rjsf/utils'
import { InputUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import TextField from '@/src/components/widget-components/TextField/TextField'
import { useRjsfAriaAdapter } from '@/src/components/widget-components/TextField/useRjsfAriaAdapter'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

interface InputWidgetRJSFProps extends WidgetProps {
  options: InputUiOptions
  // value: string
  // onChange: (value: string) => void
}

const InputWidgetRJSF = (props: InputWidgetRJSFProps) => {
  const { id, label, options, placeholder, name } = props
  const {
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    className,
    // leftIcon,
    inputType,
    size,
    labelSize,
  } = options

  const racProps = useRjsfAriaAdapter(props, {
    emptyValue: '',
  })

  return (
    <WidgetWrapper id={id} options={options}>
      <TextField
        name={name}
        label={label}
        type={inputType}
        placeholder={placeholder}
        {...racProps}
        helptext={helptext}
        isMarkdownHelptext={helptextMarkdown}
        helptextFooter={helptextFooter}
        isMarkdownHelptextFooter={helptextFooterMarkdown}
        className={className}
        // startIcon={leftIcon} // TODO: Not implemented in TextField yet
        size={size}
        labelSize={labelSize}
      />
    </WidgetWrapper>
  )
}
export default InputWidgetRJSF
