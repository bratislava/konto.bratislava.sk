import { EuroIcon, LockIcon, PhoneIcon, ProfileIcon, RemoveIcon } from '@assets/ui-icons'
import { useObjectRef } from '@react-aria/utils'
import { useControlledState } from '@react-stately/utils'
import type { NumberFieldProps as ReactAriaNumberFieldProps } from '@react-types/numberfield'
import { useTranslation } from 'next-i18next'
import { forwardRef, ReactNode } from 'react'
import { useLocale, useNumberField } from 'react-aria'
import { useNumberFieldState } from 'react-stately'

import MailIcon from '../../../../assets/ui-icons/custom_mail.svg'
import cn from '../../../../frontend/cn'
import ButtonNew from '../../simple-components/ButtonNew'
import FieldWrapper, { FieldWrapperProps } from '../FieldWrapper'

export type LeftIconVariants = 'person' | 'mail' | 'call' | 'lock' | 'euro'

export type NumberFieldProps = FieldWrapperProps & {
  name?: string
  value?: number | null
  leftIcon?: LeftIconVariants
  resetIcon?: boolean
  onChange?: (value: number | null) => void
  endIcon?: ReactNode
  placeholder?: string
  className?: string
} & Pick<ReactAriaNumberFieldProps, 'minValue' | 'maxValue' | 'step' | 'formatOptions'>

/**
 * This is a temporary implementation of the NumberField component. Most of the code is copied from InputField and
 * adjusted for numbers.
 *
 * TODO: Share the common logic between InputField and NumberField in a separate component.
 *
 * The component handles conversion between our `null` value and React Aria's `NaN` value.
 */
const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      name,
      label,
      placeholder,
      errorMessage = [],
      helptext,
      helptextMarkdown,
      helptextFooter,
      helptextFooterMarkdown,
      tooltip,
      required,
      value,
      disabled,
      leftIcon,
      resetIcon,
      className,
      onChange,
      endIcon,
      customErrorPlace = false,
      size,
      labelSize,
      displayOptionalLabel,
      ...rest
    },
    forwardedRef,
  ) => {
    const ref = useObjectRef(forwardedRef)
    const { t } = useTranslation('account')
    const { locale } = useLocale()

    const [valueControlled, setValueControlled] = useControlledState(value, null, onChange)

    // React Aria's NumberField uses NaN as a value for empty input fields
    // https://github.com/adobe/react-spectrum/issues/5524
    const sharedProps = {
      ...rest,
      placeholder,
      value: valueControlled ?? NaN,
      label,
      errorMessage,
      description: helptext,
      onChange: (newValue: number) => {
        setValueControlled(Number.isNaN(newValue) ? null : newValue)
      },
      isRequired: required,
      isDisabled: disabled,
      isWheelDisabled: true,
    }
    const state = useNumberFieldState({
      ...sharedProps,
      locale,
    })

    const { labelProps, inputProps, descriptionProps, errorMessageProps } = useNumberField(
      sharedProps,
      state,
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
      setValueControlled(null)
    }

    const style = cn(
      'w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-p3 caret-gray-700 focus:border-gray-700 focus:outline-hidden focus:placeholder:opacity-0 sm:px-4 sm:py-2.5 sm:text-16',
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
        tooltip={tooltip}
        disabled={disabled}
        customErrorPlace={customErrorPlace}
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
            data-cy={`number-${name}`}
          />
          {resetIcon && value != null && (
            <ButtonNew
              onPress={resetIconHandler}
              variant="unstyled"
              className="absolute inset-y-1/2 right-3 flex size-6 -translate-y-2/4 cursor-pointer items-center justify-center sm:right-4"
            >
              <RemoveIcon />
              <span className="sr-only">{t('InputField.aria.reset')}</span>
            </ButtonNew>
          )}
          {endIcon}
        </div>
      </FieldWrapper>
    )
  },
)

export default NumberField
