import { WidgetProps } from '@rjsf/utils'
import cx from 'classnames'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'
import { TextAreaUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import TextAreaField from '../widget-components/TextAreaField/TextAreaField'

interface TextAreaFieldWidgetRJSFProps extends WidgetProps {
  value: string | null
  options: TextAreaUiOptions & WidgetProps['options']
  onChange: (value?: string) => void
}

const TextAreaFieldWidgetRJSF = (props: TextAreaFieldWidgetRJSFProps) => {
  const {
    value,
    label,
    placeholder,
    rawErrors,
    required,
    disabled,
    options,
    onChange,
    readonly,
  }: TextAreaFieldWidgetRJSFProps = props

  const { helptext, tooltip, explicitOptional, className } = options

  const handleOnChange = (newValue?: string) => {
    if (!newValue || newValue === '') {
      onChange()
    } else {
      onChange(newValue)
    }
  }

  return (
    <WidgetWrapper options={options} className="max-w-[320px]">
      <TextAreaField
        value={value ?? undefined}
        label={label}
        placeholder={placeholder}
        required={required}
        disabled={disabled || readonly}
        helptext={helptext}
        tooltip={tooltip}
        className={cx('h-[196px]', className)}
        explicitOptional={explicitOptional}
        onChange={handleOnChange}
        errorMessage={rawErrors}
      />
    </WidgetWrapper>
  )
}

export default TextAreaFieldWidgetRJSF
