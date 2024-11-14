import { EnumOptionsType } from '@rjsf/utils'

type ValueTypeBase = string | boolean

export type OptionItem<ValueType extends ValueTypeBase> = {
  value: ValueType
  title: string
  isDefault?: boolean
  description?: string
}

// All oneOfs needed to be changed to enum because of this bug:
// https://jsonforms.discourse.group/t/function-nested-too-deeply-error-when-enum-has-many-options/1451
// For many options (250) it worked OK in Chrome, but in Firefox it was throwing an error:
// Form validation failed
// Array [ 0: Object { stack: "function nested too deeply", message: "Neznáma chyba" } ]
export const createEnumSchemaEnum = <ValueType extends ValueTypeBase>(
  list: OptionItem<ValueType>[],
) => list.map(({ value }) => value)

export const createEnumSchemaDefault = <ValueType extends ValueTypeBase>(
  list: OptionItem<ValueType>[],
) => list.find(({ isDefault }) => isDefault)?.value

export const createEnumSchemaDefaultMultiple = <ValueType extends ValueTypeBase>(
  list: OptionItem<ValueType>[],
) => list.filter(({ isDefault }) => isDefault).map(({ value }) => value)

export type EnumMetadata<ValueType extends ValueTypeBase> = {
  value: ValueType
  label: string
  description?: string
}

export const createEnumMetadata = <ValueType extends ValueTypeBase>(
  list: OptionItem<ValueType>[],
) => list.map(({ value, title, description }) => ({ value, label: title, description }))

export const mergeEnumOptionsMetadata = <ValueType extends ValueTypeBase>(
  enumOptions: EnumOptionsType[],
  enumMetadata: EnumMetadata<ValueType>[],
): EnumMetadata<ValueType>[] =>
  enumOptions.map((option) => {
    const metadata = enumMetadata.find((metadata) => metadata.value === option.value)
    if (metadata) {
      return { ...metadata, value: option.value as ValueType }
    }

    return { value: option.value as ValueType, label: '' }
  })
