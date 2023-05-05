import HiddenIcon from '@assets/images/new-icons/ui/eye.svg'
import InputField from 'components/forms/widget-components/InputField/InputField'
import { forwardRef, useRef, useState } from 'react'
import { useButton } from 'react-aria'

import { ExplicitOptionalType } from '../../types/ExplicitOptional'

interface Props {
  label: string
  placeholder: string
  errorMessage?: string[]
  helptext?: string
  className?: string
  value?: string
  required?: boolean
  explicitOptional?: ExplicitOptionalType
  disabled?: boolean
  tooltip?: string
  autoComplete?: string
  onChange?: (value?: string) => void
}

const PasswordField = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      placeholder,
      errorMessage = [],
      helptext,
      tooltip,
      required,
      explicitOptional,
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
      buttonRef ,
    )

    return (
      <InputField
        type={type}
        label={label}
        placeholder={placeholder}
        errorMessage={errorMessage}
        helptext={helptext}
        value={value}
        className={className}
        required={required}
        disabled={disabled}
        tooltip={tooltip}
        onChange={onChange}
        explicitOptional={explicitOptional}
        ref={ref}
        autoComplete={autoComplete}
        endIcon={
          <button
            type="button"
            ref={buttonRef}
            className="flex items-center justify-center absolute inset-y-1/2 right-3 sm:right-4 h-6 w-6 -translate-y-2/4 cursor-pointer"
            {...buttonProps}
          >
            <HiddenIcon />
          </button>
        }
        {...rest}
      />
    )
  },
)

export default PasswordField
