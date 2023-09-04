import { WidgetProps } from '@rjsf/utils'
import cx from 'classnames'
import { WidgetOptions } from 'components/forms/types/WidgetOptions'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

import SelectField from '../widget-components/SelectField/SelectFieldNew/SelectMultiNew'

type SelectRJSFOptions = WidgetOptions

interface SelectFieldWidgetRJSFProps extends WidgetProps {
  value: string | null
  options: SelectRJSFOptions
  onChange: (value: unknown) => void
}

const SelectFieldWidgetRJSF = (props: SelectFieldWidgetRJSFProps) => {
  const {
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
    helptext,
    tooltip,
    accordion,
    explicitOptional,
    className,
    spaceBottom = 'none',
    spaceTop = 'large',
  }: SelectRJSFOptions = options

  return (
    <WidgetWrapper
      accordion={accordion}
      className="max-w-[320px]"
      spaceBottom={spaceBottom}
      spaceTop={spaceTop}
    >
      <SelectField
        value={value}
        label={label}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        helptext={helptext}
        tooltip={tooltip}
        className={cx('h-[196px]', className)}
        explicitOptional={explicitOptional}
        onChange={onChange}
        errorMessage={rawErrors}
      />
    </WidgetWrapper>
  )
}

export default SelectFieldWidgetRJSF
