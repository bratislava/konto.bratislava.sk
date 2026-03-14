import { forwardRef, useState } from 'react'

import { FieldWrapperProps } from '@/src/components/widget-components/FieldWrapper'
import InputField from '@/src/components/widget-components/InputField/InputField'
import PasswordEyeButton from '@/src/components/widget-components/PasswordField/PasswordEyeButton'

type Props = FieldWrapperProps & {
  value?: string
  autoComplete?: string
  onChange?: (value?: string) => void
  placeholder?: string
  className?: string
}

const PasswordField = forwardRef<HTMLInputElement, Props>(
  ({ value = '', autoComplete, onChange, placeholder, className, ...rest }, ref) => {
    const [isPasswordHidden, setIsPasswordHidden] = useState(true)

    return (
      <InputField
        type={isPasswordHidden ? 'password' : 'text'}
        {...rest}
        placeholder={placeholder}
        value={value}
        className={className}
        onChange={onChange}
        ref={ref}
        autoComplete={autoComplete}
        endIcon={
          <PasswordEyeButton
            isPasswordHidden={isPasswordHidden}
            onToggle={setIsPasswordHidden}
            isDisabled={rest.isDisabled}
            className="absolute inset-y-1/2 right-1 aspect-square h-full -translate-y-2/4"
          />
        }
        {...rest}
      />
    )
  },
)

export default PasswordField
