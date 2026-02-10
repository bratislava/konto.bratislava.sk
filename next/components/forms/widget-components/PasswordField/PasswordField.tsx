import { forwardRef, useState } from 'react'

import InputField from '@/components/forms/widget-components/InputField/InputField'
import PasswordEyeButton from '@/components/forms/widget-components/PasswordField/PasswordEyeButton'

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
          <PasswordEyeButton
            isPasswordHidden={isPasswordHidden}
            onToggle={setIsPasswordHidden}
            isDisabled={disabled}
            className="absolute inset-y-1/2 right-1 aspect-square h-full -translate-y-2/4"
          />
        }
        {...rest}
      />
    )
  },
)

export default PasswordField
