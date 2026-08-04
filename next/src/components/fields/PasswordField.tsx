import { useTranslation } from 'next-i18next/pages'
import { forwardRef, Ref, useState } from 'react'
import { Input as RACInput } from 'react-aria-components/Input'
import { TextField as RACTextField } from 'react-aria-components/TextField'
import { ToggleButton as RACToggleButton } from 'react-aria-components/ToggleButton'

import Icon from '@/src/components/icon-components/Icon'
import cn from '@/src/utils/cn'

import FieldWrapper from './_shared/FieldWrapper'
import { TextFieldProps } from './TextField'

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'placeholder'>

const PasswordField = (
  {
    label,
    displayOptionalLabel,
    labelSize,
    helptext,
    helptextFooter,
    errorMessage,
    autoCapitalize,
    autoCorrect,
    spellCheck,
    autoComplete,
    ...rest
  }: PasswordFieldProps,
  ref: Ref<HTMLInputElement>,
) => {
  const { t } = useTranslation('account')
  const [isHidden, setIsHidden] = useState(true)

  return (
    <RACTextField
      {...rest}
      type={isHidden ? 'password' : 'text'}
      isInvalid={!!errorMessage}
      validationBehavior="aria"
      className={cn('flex w-full flex-col gap-2', rest.className)}
    >
      <FieldWrapper
        label={label}
        isRequired={rest.isRequired}
        displayOptionalLabel={displayOptionalLabel}
        labelSize={labelSize}
        helptext={helptext}
        helptextFooter={helptextFooter}
        errorMessage={errorMessage}
      >
        <div className="relative">
          <RACInput
            ref={ref}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            spellCheck={spellCheck}
            autoComplete={autoComplete}
            data-cy={rest.name ? `input-${rest.name}` : undefined}
            className={({ isFocused, isDisabled, isInvalid }) =>
              cn(
                'w-full rounded-lg border bg-background-passive-base text-size-p-small-r text-content-passive-secondary base-focus-ring outline-hidden lg:text-size-p-small',
                'px-3 py-2 lg:px-4 lg:py-3',
                'placeholder:text-content-passive-tertiary',
                {
                  'border-border-active-default': !isInvalid && !isFocused,
                  'border-border-active-focused': !isInvalid && isFocused,
                  'border-border-error': isInvalid,
                  'border-border-active-disabled bg-background-passive-tertiary': isDisabled,
                  'hover:border-border-active-hover': !isDisabled && !isInvalid && !isFocused,
                },
              )
            }
          />
          <RACToggleButton
            aria-label={t('PasswordField.aria.showPassword')}
            isSelected={!isHidden}
            onChange={(selected) => setIsHidden(!selected)}
            isDisabled={rest.isDisabled}
            className="absolute inset-y-0 right-0 flex items-center justify-center rounded-lg p-3 base-focus-ring"
          >
            {isHidden ? <Icon name="eye-hide" /> : <Icon name="eye" />}
          </RACToggleButton>
        </div>
      </FieldWrapper>
    </RACTextField>
  )
}

export default forwardRef(PasswordField)
