import { EyeIcon } from '@assets/ui-icons'
import InputField from 'components/forms/widget-components/InputField/InputField'
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
      helptextFooter,
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
    const [type, setType] = useState<'password' | 'text'>('password')
    const buttonRef = useRef<HTMLButtonElement>(null)

    const { buttonProps } = useButton(
      {
        elementType: 'button',
        isDisabled: disabled,
        onPressStart() {
          setType('text')
        },
        onPressEnd() {
          setType('password')
        },
      },
      buttonRef,
    )

    return (
      <InputField
        type={type}
        label={label}
        placeholder={placeholder}
        errorMessage={errorMessage}
        helptext={helptext}
        helptextFooter={helptextFooter}
        value={value}
        className={className}
        required={required}
        disabled={disabled}
        tooltip={tooltip}
        onChange={onChange}
        ref={ref}
        autoComplete={autoComplete}
        endIcon={
          <button
            type="button"
            ref={buttonRef}
            className="absolute inset-y-1/2 right-3 flex size-6 -translate-y-2/4 cursor-pointer items-center justify-center sm:right-4"
            {...buttonProps}
          >
            <EyeIcon />
          </button>
        }
        {...rest}
      />
    )
  },
)

export default PasswordField
