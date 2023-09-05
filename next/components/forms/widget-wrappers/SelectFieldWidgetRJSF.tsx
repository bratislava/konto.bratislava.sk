import { EnumOptionsType, RJSFSchema, WidgetProps } from '@rjsf/utils'
import { WidgetOptions } from 'components/forms/types/WidgetOptions'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import useEnum from 'frontend/hooks/useEnum'
import React from 'react'

import SelectField from '../widget-components/SelectField/SelectFieldNew'

// TODO most of these ignored currently as we simplified the designs, use them when needed
export type SelectRJSFOptions = {
  enumOptions?: EnumOptionsType[]
  dropdownDivider?: boolean
  selectAllOption?: boolean
  explicitOptional?: boolean
  hideScrollbar?: boolean
  maxWordSize?: number
  // selectType?: 'one' | 'multiple' | 'arrow' | 'radio'
} & WidgetOptions

interface RJSFSelectSchema extends RJSFSchema {
  ciselnik?: {
    id: string
  }
}

interface SelectFieldWidgetRJSFProps extends WidgetProps {
  value: string | null
  options: SelectRJSFOptions
  schema: RJSFSelectSchema
  onChange: (value: unknown) => void
}

const SelectFieldWidgetRJSF = (props: SelectFieldWidgetRJSFProps) => {
  const {
    schema,
    value,
    label,
    placeholder,
    rawErrors,
    required,
    disabled,
    options,
    onChange,
  }: SelectFieldWidgetRJSFProps = props

  const {
    enumOptions,
    helptext,
    tooltip,
    accordion,
    explicitOptional,
    className,
    spaceBottom = 'none',
    spaceTop = 'large',
  }: SelectRJSFOptions = options

  const { data } = useEnum(schema.ciselnik?.id)
  // pull description from subschema into top level enumOption where it exists
  const mappedSchemaEnumOptions = enumOptions?.map((option) => ({
    ...option,
    description: option.schema?.description,
  }))
  const resolvedOptions = mappedSchemaEnumOptions ?? data

  return (
    <WidgetWrapper accordion={accordion} spaceBottom={spaceBottom} spaceTop={spaceTop}>
      <SelectField
        value={value}
        options={resolvedOptions}
        label={label}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        helptext={helptext}
        tooltip={tooltip}
        className={className}
        explicitOptional={explicitOptional}
        onChange={onChange}
        errorMessage={rawErrors}
      />
    </WidgetWrapper>
  )
}

export default SelectFieldWidgetRJSF
