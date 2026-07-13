import { forwardRef, Ref } from 'react'
import { Button as RACButton } from 'react-aria-components/Button'
import { Group as RACGroup } from 'react-aria-components/Group'
import { Input as RACInput, InputProps as RACInputProps } from 'react-aria-components/Input'
import {
  SearchField as RACSearchField,
  SearchFieldProps as RACSearchFieldProps,
} from 'react-aria-components/SearchField'

import Icon from '@/src/components/icon-components/Icon'
import cn from '@/src/utils/cn'

import FieldWrapper from './_shared/FieldWrapper'
import { FieldBaseProps } from './_shared/types'

export interface SearchFieldProps
  extends
    Omit<RACSearchFieldProps, 'spellCheck'>,
    FieldBaseProps,
    Pick<RACInputProps, 'autoCapitalize' | 'autoCorrect' | 'spellCheck'> {
  placeholder?: string
}

const SearchField = (
  {
    label,
    displayOptionalLabel,
    labelSize,
    helptext,
    helptextFooter,
    errorMessage,
    placeholder,
    autoCapitalize,
    autoCorrect,
    spellCheck,
    autoComplete,
    ...rest
  }: SearchFieldProps,
  ref: Ref<HTMLInputElement>,
) => (
  <RACSearchField
    {...rest}
    isInvalid={!!errorMessage}
    validationBehavior="aria"
    className={cn('group flex w-full flex-col gap-2', rest.className)}
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
      <RACGroup
        className={({ isFocusWithin, isInvalid, isDisabled, isHovered }) =>
          cn(
            'flex w-full items-center gap-3 rounded-lg border bg-background-passive-base base-focus-ring',
            'px-3 py-2 lg:px-4 lg:py-3',
            {
              'border-border-active-default': !isInvalid && !isFocusWithin,
              'border-border-active-focused': !isInvalid && isFocusWithin,
              'border-border-error': isInvalid,
              'border-border-active-disabled bg-background-passive-tertiary text-content-passive-tertiary':
                isDisabled,
              'border-border-active-hover':
                !isDisabled && !isInvalid && !isFocusWithin && isHovered,
            },
          )
        }
      >
        <Icon name="search" />
        <RACInput
          ref={ref}
          placeholder={placeholder}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          autoComplete={autoComplete}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-size-p-small-r text-content-passive-secondary outline-hidden lg:text-size-p-small',
            'disabled:text-content-passive-tertiary',
            'placeholder:text-content-passive-tertiary',
            '[&::-webkit-search-cancel-button]:hidden',
          )}
        />
        <RACButton className="flex shrink-0 items-center justify-center rounded-md base-focus-ring group-empty:hidden">
          <Icon name="clear" />
        </RACButton>
      </RACGroup>
    </FieldWrapper>
  </RACSearchField>
)

export default forwardRef(SearchField)
