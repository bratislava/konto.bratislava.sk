import { RemoveIcon, SearchIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import { useRef, useState } from 'react'
import { useTextField } from 'react-aria'

import ButtonNew from '../../simple-components/ButtonNew'
import FieldWrapper, { FieldWrapperProps } from '../FieldWrapper'

type SearchFieldProps = FieldWrapperProps & {
  value?: string
  resetIcon?: boolean
  onChange?: (e: string) => void
  placeholder?: string
  className?: string
}

const SearchField = ({
  label,
  placeholder,
  errorMessage = [],
  helptext,
  helptextHeader,
  tooltip,
  required,
  value = '',
  disabled,
  resetIcon,
  className,
  size,
  labelSize,
  displayOptionalLabel,
  ...rest
}: SearchFieldProps) => {
  const [valueState, setValueState] = useState<string>(value)
  const ref = useRef<HTMLInputElement>(null)
  const { t } = useTranslation('account')
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
        helptextHeader={helptextHeader}
        descriptionProps={descriptionProps}
        required={required}
        tooltip={tooltip}
        errorMessage={errorMessage}
        errorMessageProps={errorMessageProps}
        disabled={disabled}
        size={size}
        labelSize={labelSize}
        displayOptionalLabel={displayOptionalLabel}
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
            <ButtonNew
              onPress={() => setValueState('')}
              variant="unstyled"
              className="absolute inset-y-1/2 right-3 flex size-6 -translate-y-2/4 cursor-pointer items-center justify-center sm:right-4"
            >
              <RemoveIcon />
              <span className="sr-only">{t('SearchField.aria.reset')}</span>
            </ButtonNew>
          )}
        </div>
      </FieldWrapper>
    </div>
  )
}

export default SearchField
