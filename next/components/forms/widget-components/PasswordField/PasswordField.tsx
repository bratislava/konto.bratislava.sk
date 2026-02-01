import { EyeHiddenIcon, EyeIcon } from '@assets/ui-icons'
import InputField from 'components/forms/widget-components/InputField/InputField'
import { useTranslation } from 'next-i18next'
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
    const { t } = useTranslation('account')

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
          <button
            type="button"
            ref={buttonRef}
            aria-label={t('auth.fields.password_eyeButton.aria')}
            aria-pressed={!isPasswordHidden}
            className="absolute inset-y-1/2 right-3 flex size-6 -translate-y-2/4 cursor-pointer items-center justify-center sm:right-4"
            {...buttonProps}
          >
            {isPasswordHidden ? <EyeHiddenIcon /> : <EyeIcon />}
          </button>
        }
        {...rest}
      />
    )
  },
)

export default PasswordField
