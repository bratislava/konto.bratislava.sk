import { LockIcon, PhoneIcon, ProfileIcon, RemoveIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { TooltipPositionType } from 'components/forms/info-components/Tooltip/Tooltip'
import { forwardRef, ReactNode, RefObject, useEffect, useState } from 'react'
import { useTextField } from 'react-aria'

import MailIcon from '../../../../assets/ui-icons/custom_mail.svg'
import { FieldAdditionalProps, FieldBaseProps } from '../FieldBase'
import FieldWrapper from '../FieldWrapper'

export type LeftIconVariants = 'person' | 'mail' | 'call' | 'lock'
export type InputType = 'text' | 'password' | 'email' | 'tel' | 'number'
export type SizeType = 'large' | 'default' | 'small'

export const isLeftIconVariant = (value: string): value is LeftIconVariants => {
  const list: LeftIconVariants[] = ['person', 'mail', 'call', 'lock']
  return list.includes(value as LeftIconVariants)
}

export const isInputSize = (value: string): value is SizeType => {
  const list: SizeType[] = ['large', 'default', 'small']
  return list.includes(value as SizeType)
}

export type InputProps = FieldBaseProps &
  Pick<FieldAdditionalProps, 'placeholder' | 'className' | 'customErrorPlace'> & {
    type?: InputType // capitalize input value after field un-focus with type === text
    capitalize?: boolean
    value?: string
    leftIcon?: LeftIconVariants
    resetIcon?: boolean
    tooltipPosition?: TooltipPositionType
    onChange?: (value?: string) => void
    onBlur?: () => void
    size?: SizeType
    endIcon?: ReactNode
    autoComplete?: string
  }

const InputField = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      type = 'text',
      placeholder,
      errorMessage = [],
      helptext,
      tooltip,
      tooltipPosition,
      required,
      explicitOptional,
      value = '',
      disabled,
      leftIcon,
      resetIcon,
      className,
      size = 'large',
      onChange,
      endIcon,
      customErrorPlace = false,
      capitalize = false,
      autoComplete,
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
      <div
        className={cx('flex flex-col', {
          'w-full': size === 'large',
          'w-fit max-w-[388px]': size === 'default',
          'w-fit max-w-[200px]': size === 'small',
        })}
      >
        <FieldWrapper
          label={label}
          labelProps={labelProps}
          htmlFor={inputProps.id}
          helptext={helptext}
          descriptionProps={descriptionProps}
          required={required}
          explicitOptional={explicitOptional}
          tooltip={tooltip}
          tooltipPosition={tooltipPosition}
          disabled={disabled}
          customErrorPlace={customErrorPlace}
          errorMessage={errorMessage}
          errorMessageProps={errorMessageProps}
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
      </div>
    )
  },
)

export default InputField
