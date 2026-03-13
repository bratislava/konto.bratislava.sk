import { useObjectRef } from '@react-aria/utils'
import { useTranslation } from 'next-i18next'
import { forwardRef, ReactNode, useEffect, useState } from 'react'
import { useTextField } from 'react-aria'

import { EuroIcon, LockIcon, PhoneIcon, ProfileIcon } from '@/src/assets/ui-icons'
import MailIcon from '@/src/assets/ui-icons/custom_mail.svg'
import FieldWrapper, { FieldWrapperProps } from '@/src/components/widget-components/FieldWrapper'
import cn from '@/src/utils/cn'

export type LeftIconVariants = 'person' | 'mail' | 'call' | 'lock' | 'euro'
export type InputType = 'text' | 'password' | 'email' | 'tel'

export type InputFieldProps = FieldWrapperProps & {
  type?: InputType // capitalize input value after field un-focus with type === text
  name?: string
  capitalize?: boolean
  value?: string
  leftIcon?: LeftIconVariants
  onChange?: (value?: string) => void
  onBlur?: () => void
  endIcon?: ReactNode
  autoComplete?: string
  placeholder?: string
  className?: string
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      name,
      label,
      type = 'text',
      placeholder,
      errorMessage = [],
      helptext,
      helptextMarkdown,
      helptextFooter,
      helptextFooterMarkdown,
      required,
      value = '',
      disabled,
      leftIcon,
      className,
      onChange,
      endIcon,
      capitalize = false,
      autoComplete,
      size,
      labelSize,
      displayOptionalLabel,
      ...rest
    },
    forwardedRef,
  ) => {
    const ref = useObjectRef(forwardedRef)
    const [valueState, setValueState] = useState<string>(value)
    const { t } = useTranslation('account')

    useEffect(() => {
      setValueState(onChange ? value : valueState)
    }, [valueState, value, onChange])

    const { labelProps, inputProps, descriptionProps, errorMessageProps } = useTextField(
      {
        ...rest,
        placeholder,
        value: onChange && value ? value : valueState,
        type,
        label,
        errorMessage,
        description: helptext,
        onChange(inputValue) {
          if (onChange) {
            onChange(inputValue.startsWith(' ') ? inputValue.trim() : inputValue)
          } else {
            setValueState(inputValue.startsWith(' ') ? inputValue.trim() : inputValue)
          }
        },
        onFocusChange(isFocused) {
          if (!isFocused && type === 'text' && capitalize) {
            if (onChange) {
              onChange(valueState.replace(/^\w/, (c) => c.toUpperCase()))
            } else {
              setValueState(valueState.replace(/^\w/, (c) => c.toUpperCase()))
            }
          }
        },
        isRequired: required,
        isDisabled: disabled,
        autoComplete,
      },
      ref,
    )
    const leftIconSwitcher = (icon: string): ReactNode | null => {
      switch (icon) {
        case 'person':
          return <ProfileIcon />
        case 'mail':
          return <MailIcon />
        case 'call':
          return <PhoneIcon />
        case 'lock':
          return <LockIcon />
        case 'euro':
          return <EuroIcon />
        default:
          return null
      }
    }

    const resetIconHandler = () => {
      if (onChange) onChange('')
      else setValueState('')
    }

    const style = cn(
      'w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-p3 caret-gray-700 focus:border-gray-700 focus:outline-hidden focus:placeholder:opacity-0 sm:px-4 sm:py-2.5 sm:text-16',
      {
        // conditions
        'pl-12 sm:pl-[52px]': leftIcon,
        // hover
        'hover:border-gray-400': !disabled,

        // error
        'border-negative-700 hover:border-negative-700 focus:border-negative-700':
          errorMessage?.length > 0 && !disabled,

        // disabled
        'border-gray-300 bg-gray-100': disabled,
      },
      className,
    )

    return (
      <FieldWrapper
        label={label}
        labelProps={labelProps}
        htmlFor={inputProps.id}
        helptext={helptext}
        helptextMarkdown={helptextMarkdown}
        helptextFooter={helptextFooter}
        helptextFooterMarkdown={helptextFooterMarkdown}
        descriptionProps={descriptionProps}
        required={required}
        disabled={disabled}
        errorMessage={errorMessage}
        errorMessageProps={errorMessageProps}
        size={size}
        labelSize={labelSize}
        displayOptionalLabel={displayOptionalLabel}
      >
        <div className="relative" data-cy={`required-${name}`}>
          {leftIcon && (
            <span
              className={cn(
                'pointer-events-none absolute inset-y-1/2 left-3 flex h-6 w-6 -translate-y-2/4 items-center justify-center sm:left-4',
                {
                  'opacity-50': disabled,
                },
              )}
            >
              {leftIconSwitcher(leftIcon)}
            </span>
          )}
          <input
            {...inputProps}
            ref={ref}
            name={inputProps.id}
            className={style}
            data-cy={`input-${name}`}
          />
          {endIcon}
        </div>
      </FieldWrapper>
    )
  },
)

export default InputField
