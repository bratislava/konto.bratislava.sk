import { WidgetProps } from '@rjsf/utils'
import { TextAreaUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import TextAreaField from '@/src/components/fields/TextAreaField'
import FieldBlurWrapper from '@/src/components/widget-components/FieldBlurWrapper/FieldBlurWrapper'
import mapRjsfToReactAriaProps from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

const TextAreaWidgetRJSF = (props: WidgetProps) => {
  const { wrapperProps, fieldProps, specificOptions } = mapRjsfToReactAriaProps<
    string,
    TextAreaUiOptions
  >(props, {
    toFieldValue: (v) => v ?? '',
    fromFieldValue: (v) => v || undefined,
  })

  return (
    <WidgetWrapper {...wrapperProps}>
      <FieldBlurWrapper value={fieldProps.value} onChange={fieldProps.onChange}>
        {({ value, onChange, onBlur }) => (
          <TextAreaField
            {...fieldProps}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={specificOptions.placeholder}
          />
        )}
      </FieldBlurWrapper>
    </WidgetWrapper>
  )
}

export default TextAreaWidgetRJSF
