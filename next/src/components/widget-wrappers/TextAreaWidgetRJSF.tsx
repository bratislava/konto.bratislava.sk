import { WidgetProps } from '@rjsf/utils'
import { TextAreaUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import FieldBlurWrapper from '@/src/components/widget-components/FieldBlurWrapper/FieldBlurWrapper'
import TextAreaField from '@/src/components/widget-components/TextAreaField/TextAreaField'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'
import cn from '@/src/utils/cn'

interface TextAreaWidgetRJSFProps extends WidgetProps {
  value: string | undefined
  options: TextAreaUiOptions
  onChange: (value?: string) => void
}

const TextAreaWidgetRJSF = ({
  id,
  value,
  label,
  placeholder,
  rawErrors,
  required,
  disabled,
  options,
  onChange,
  readonly,
}: TextAreaWidgetRJSFProps) => {
  const {
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    className,
    size,
    labelSize,
  } = options

  const handleOnChange = (newValue?: string) => {
    if (!newValue || newValue === '') {
      onChange()
    } else {
      onChange(newValue)
    }
  }

  return (
    <WidgetWrapper id={id} options={options}>
      <FieldBlurWrapper value={value} onChange={handleOnChange}>
        {({ value: wrapperValue, onChange: wrapperOnChange, onBlur }) => (
          <TextAreaField
            value={wrapperValue ?? undefined}
            label={label}
            placeholder={placeholder}
            required={required}
            disabled={disabled || readonly}
            helptext={helptext}
            helptextMarkdown={helptextMarkdown}
            helptextFooter={helptextFooter}
            helptextFooterMarkdown={helptextFooterMarkdown}
            className={cn('h-[196px]', className)}
            onChange={wrapperOnChange}
            onBlur={onBlur}
            errorMessage={rawErrors}
            size={size}
            labelSize={labelSize}
            displayOptionalLabel
          />
        )}
      </FieldBlurWrapper>
    </WidgetWrapper>
  )
}

export default TextAreaWidgetRJSF
