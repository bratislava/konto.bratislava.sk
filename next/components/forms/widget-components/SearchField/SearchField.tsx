import { RemoveIcon, SearchIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { useRef, useState } from 'react'
import { useTextField } from 'react-aria'

import { FieldAdditionalProps, FieldBaseProps } from '../FieldBase'
import FieldWrapper from '../FieldWrapper'

type SearchFieldProps = FieldBaseProps &
  Pick<FieldAdditionalProps, 'placeholder' | 'className'> & {
    value?: string
    resetIcon?: boolean
    onChange?: (e: string) => void
  }

const SearchField = ({
  label,
  placeholder,
  errorMessage = [],
  helptext,
  tooltip,
  required,
  explicitOptional,
  value = '',
  disabled,
  resetIcon,
  className,
  ...rest
}: SearchFieldProps) => {
  const [valueState, setValueState] = useState<string>(value)
  const ref = useRef<HTMLInputElement>(null)
  const { labelProps, inputProps, descriptionProps, errorMessageProps } = useTextField(
    {
      ...rest,
      placeholder,
      value,
      label,
      errorMessage,
      description: helptext,
      onChange(value) {
        setValueState(value.startsWith(' ') ? value.trim() : value)
      },
      isRequired: required,
      isDisabled: disabled,
    },
    ref,
  )

  const style = cx(
    'sm:text-16 text-p3 w-full rounded-lg border-2 border-gray-200 px-12 py-2 caret-gray-700 focus:border-gray-700 focus:placeholder-transparent focus:outline-none sm:px-[52px] sm:py-2.5',
    className,
    {
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
    <div className="flex w-full max-w-xs flex-col">
      <FieldWrapper
        label={label}
        labelProps={labelProps}
        htmlFor={inputProps?.id}
        helptext={helptext}
        descriptionProps={descriptionProps}
        required={required}
        explicitOptional={explicitOptional}
        tooltip={tooltip}
        errorMessage={errorMessage}
        errorMessageProps={errorMessageProps}
        disabled={disabled}
      >
        <div className="relative">
          <i
            className={cx(
              'absolute inset-y-1/2 left-3 flex h-6 w-6 -translate-y-2/4 items-center justify-center sm:left-4',
              {
                'opacity-50': disabled,
              },
            )}
          >
            <SearchIcon />
          </i>
          <input
            {...inputProps}
            ref={ref}
            value={valueState}
            name={inputProps.id}
            className={style}
          />
          {resetIcon && valueState && (
            <i
              role="button"
              tabIndex={0}
              onKeyDown={() => setValueState('')}
              onClick={() => setValueState('')}
              className="absolute inset-y-1/2 right-3 flex h-6 w-6 -translate-y-2/4 cursor-pointer items-center justify-center sm:right-4"
            >
              <RemoveIcon />
            </i>
          )}
        </div>
      </FieldWrapper>
    </div>
  )
}

export default SearchField
