import type { WidgetProps } from '@rjsf/utils'

import { transformRawErrors } from '@/src/components/widget-components/TextField/transformRawErrors'

type AdapterOptions<T> = {
  toAria?: (value: any) => T
  fromAria?: (value: T) => any
  emptyValue?: T
}

export function useRjsfAriaAdapter<T = string>(props: WidgetProps, options?: AdapterOptions<T>) {
  const { value, onChange, onBlur, onFocus, id, required, disabled, readonly, rawErrors } = props

  const { toAria = (v) => v as T, fromAria = (v) => v, emptyValue } = options || {}

  // normalize value for React Aria
  const adaptedValue = value == null ? (emptyValue as T) : toAria(value)

  // adapt onChange → RJSF signature
  const adaptedOnChange = (val: T) => {
    onChange(fromAria(val))
  }

  // optional: adapt blur/focus if needed
  const adaptedOnBlur = () => {
    onBlur?.(id, value)
  }

  const adaptedOnFocus = () => {
    onFocus?.(id, value)
  }

  return {
    value: adaptedValue,
    onChange: adaptedOnChange,
    onBlur: adaptedOnBlur,
    onFocus: adaptedOnFocus,
    isRequired: required,
    isDisabled: disabled,
    isReadOnly: readonly,
    errorMessage: transformRawErrors(rawErrors),
  }
}
