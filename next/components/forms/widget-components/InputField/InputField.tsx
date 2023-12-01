import { LockIcon, PhoneIcon, ProfileIcon, RemoveIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { forwardRef, ReactNode, RefObject, useEffect, useState } from 'react'
import { useTextField } from 'react-aria'

import MailIcon from '../../../../assets/ui-icons/custom_mail.svg'
import FieldWrapper, { FieldWrapperProps } from '../FieldWrapper'

export type LeftIconVariants = 'person' | 'mail' | 'call' | 'lock'
export type InputType = 'text' | 'password' | 'email' | 'tel' | 'number'

export type InputFieldProps = FieldWrapperProps & {
  type?: InputType // capitalize input value after field un-focus with type === text
  capitalize?: boolean
  value?: string
  leftIcon?: LeftIconVariants
  resetIcon?: boolean
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
      label,
      type = 'text',
      placeholder,
      errorMessage = [],
      helptext,
      helptextHeader,
      tooltip,
      required,
      value = '',
      disabled,
      leftIcon,
      resetIcon,
      className,
      onChange,
      endIcon,
      customErrorPlace = false,
      capitalize = false,
      autoComplete,
      size,
      labelSize,
      displayOptionalLabel,
      ...rest
    },
    ref,
  ) => {
    const [valueState, setValueState] = useState<string>(value)

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
      ref as RefObject<HTMLInputElement>,
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
        default:
          return null
      }
    }

    const resetIconHandler = () => {
      if (onChange) onChange('')
      else setValueState('')
    }

    const style = cx(
      'text-p3 sm:text-16 w-full rounded-lg border-2 border-gray-200 px-3 py-2 caret-gray-700 focus:border-gray-700 focus:outline-none focus:placeholder:opacity-0 sm:px-4 sm:py-2.5',
      className,
      {
        // conditions
        'pl-12 sm:pl-[52px]': leftIcon,
        'pr-12 sm:pr-[52px]': resetIcon,
        // hover
        'hover:border-gray-400': !disabled,

        // error
        'border-negative-700 hover:border-negative-700 focus:border-negative-700':
          errorMessage?.length > 0 && !disabled,

        // disabled
        'border-gray-300 bg-gray-100': disabled,
      },
    )

    return (
      <FieldWrapper
        label={label}
        labelProps={labelProps}
        htmlFor={inputProps.id}
        helptext={helptext}
        helptextHeader={helptextHeader}
        descriptionProps={descriptionProps}
        required={required}
        tooltip={tooltip}
        disabled={disabled}
        customErrorPlace={customErrorPlace}
        errorMessage={errorMessage}
        errorMessageProps={errorMessageProps}
        size={size}
        labelSize={labelSize}
        displayOptionalLabel={displayOptionalLabel}
      >
        <div className="relative">
          {leftIcon && (
            <span
              className={cx(
                'pointer-events-none absolute inset-y-1/2 left-3 flex h-6 w-6 -translate-y-2/4 items-center justify-center sm:left-4',
                {
                  'opacity-50': disabled,
                },
              )}
            >
              {leftIconSwitcher(leftIcon)}
            </span>
          )}
          <input {...inputProps} ref={ref} name={inputProps.id} className={style} />
          {resetIcon && valueState && (
            <button
              type="button"
              tabIndex={0}
              onClick={resetIconHandler}
              className="absolute inset-y-1/2 right-3 flex h-6 w-6 -translate-y-2/4 cursor-pointer items-center justify-center sm:right-4"
            >
              <RemoveIcon />
            </button>
          )}
          {endIcon}
        </div>
      </FieldWrapper>
    )
  },
)

export default InputField
