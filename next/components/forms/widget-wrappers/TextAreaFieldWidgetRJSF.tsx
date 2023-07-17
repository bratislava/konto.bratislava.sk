import { WidgetProps } from '@rjsf/utils'
import cx from 'classnames'
import { WidgetOptions } from 'components/forms/types/WidgetOptions'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

import TextAreaField from '../widget-components/TextAreaField/TextAreaField'

type TextAreaRJSFOptions = WidgetOptions

interface TextAreaFieldWidgetRJSFProps extends WidgetProps {
  value: string | null
  options: TextAreaRJSFOptions
  onChange: (value?: string) => void
}

const TextAreaFieldWidgetRJSF = ({
  options: {
    helptext,
    tooltip,
    accordion,
    explicitOptional,
    className,
    spaceBottom = 'none',
    spaceTop = 'large',
  },
  value,
  label,
  placeholder,
  rawErrors,
  required,
  disabled,
  onChange,
}: TextAreaFieldWidgetRJSFProps) => {
  const handleOnChange = (newValue?: string) => {
    onChange(newValue || undefined)
  }

  return (
    <WidgetWrapper
      className="max-w-[320px]"
      accordion={accordion}
      spaceBottom={spaceBottom}
      spaceTop={spaceTop}
    >
      <TextAreaField
        className={cx('h-[196px]', className)}
        value={value ?? undefined}
        onChange={handleOnChange}
        errorMessage={rawErrors}
        label={label}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        helptext={helptext}
        tooltip={tooltip}
        explicitOptional={explicitOptional}
      />
    </WidgetWrapper>
  )
}

export default TextAreaFieldWidgetRJSF
