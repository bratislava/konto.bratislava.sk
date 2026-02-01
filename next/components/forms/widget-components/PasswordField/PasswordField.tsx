import InputField from 'components/forms/widget-components/InputField/InputField'
import PasswordEyeButton from 'components/forms/widget-components/PasswordField/PasswordEyeButton'
import { forwardRef, useRef, useState } from 'react'
import { useButton } from 'react-aria'

import { FieldWrapperProps } from '../FieldWrapper'

type Props = FieldWrapperProps & {
  value?: string
  autoComplete?: string
  onChange?: (value?: string) => void
  placeholder?: string
  className?: string
}

const PasswordField = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      placeholder,
      errorMessage = [],
      helptext,
      helptextMarkdown,
      helptextFooter,
      helptextFooterMarkdown,
      tooltip,
      required,
      value = '',
      disabled,
      className,
      onChange,
      autoComplete,
      ...rest
    },
    ref,
  ) => {
    const [isPasswordHidden, setIsPasswordHidden] = useState(true)

    const buttonRef = useRef<HTMLButtonElement>(null)

    const { buttonProps } = useButton(
      {
        elementType: 'button',
        isDisabled: disabled,
        onPress() {
          setIsPasswordHidden(!isPasswordHidden)
        }
      },
      buttonRef,
    )

    return (
      <InputField
        type={isPasswordHidden ? 'password' : 'text'}
        label={label}
        placeholder={placeholder}
        errorMessage={errorMessage}
        helptext={helptext}
        helptextMarkdown={helptextMarkdown}
        helptextFooter={helptextFooter}
        helptextFooterMarkdown={helptextFooterMarkdown}
        value={value}
        className={className}
        required={required}
        disabled={disabled}
        tooltip={tooltip}
        onChange={onChange}
        ref={ref}
        autoComplete={autoComplete}
        endIcon={
          <PasswordEyeButton isPasswordHidden={isPasswordHidden} {...buttonProps} />
        }
        {...rest}
      />
    )
  },
)

export default PasswordField
