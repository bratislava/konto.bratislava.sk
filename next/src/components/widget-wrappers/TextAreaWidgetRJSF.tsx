import { TextAreaUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import TextAreaField from '@/src/components/fields/TextAreaField'
import FieldBlurWrapper from '@/src/components/widget-components/FieldBlurWrapper/FieldBlurWrapper'
import mapRjsfToReactAriaProps, {
  RJSFWidgetProps,
} from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

type TextAreaWidgetRJSFProps = RJSFWidgetProps<string | undefined, TextAreaUiOptions>

const TextAreaWidgetRJSF = (props: TextAreaWidgetRJSFProps) => {
  const { wrapperProps, fieldProps, specificOptions } = mapRjsfToReactAriaProps(props, {
    toFieldValue: (value) => value ?? '',
    fromFieldValue: (value) => value || undefined,
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
