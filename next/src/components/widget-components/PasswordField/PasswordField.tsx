import { forwardRef, useState } from 'react'

import { FieldWrapperProps } from '@/src/components/widget-components/FieldWrapper'
import InputField from '@/src/components/widget-components/InputField/InputField'

type Props = FieldWrapperProps & {
  value?: string
  autoComplete?: string
  onChange?: (value?: string) => void
  placeholder?: string
  className?: string
}

const PasswordField = forwardRef<HTMLInputElement, Props>(
  ({ value = '', autoComplete, onChange, placeholder, className, ...rest }, ref) => {
    const [isPasswordHidden] = useState(true)

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
        {...rest}
      />
    )
  },
)

export default PasswordField
