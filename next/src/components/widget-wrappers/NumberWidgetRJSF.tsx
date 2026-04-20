import { NumberUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import NumberField from '@/src/components/fields/NumberField'
import mapRjsfToReactAriaProps, {
  RJSFWidgetProps,
} from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

type NumberWidgetRJSFProps = RJSFWidgetProps<number | undefined, NumberUiOptions>

const NumberWidgetRJSF = (props: NumberWidgetRJSFProps) => {
  const { schema } = props

  const { wrapperProps, fieldProps, specificOptions } = mapRjsfToReactAriaProps(props, {
    toFieldValue: (value) => value ?? NaN,
    fromFieldValue: (value) => (Number.isNaN(value) ? undefined : value),
  })

  const getStep = () => {
    if (schema.multipleOf != null) {
      return schema.multipleOf
    }
    // `multipleOf` is required form schema.type === 'number' and optional for schema.type === 'integer', we add
    // `step` attribute only for integer values if not present
    if (schema.type === 'integer') {
      return 1
    }

    return undefined
  }

  const getFormatOptions = () => {
    // Ensure that no fraction digits can be entered to integer field
    if (schema.type === 'integer' && !specificOptions.formatOptions?.maximumFractionDigits) {
      return { ...specificOptions.formatOptions, maximumFractionDigits: 0 }
    }

    return specificOptions.formatOptions
  }

  return (
    <WidgetWrapper {...wrapperProps}>
      <NumberField
        {...fieldProps}
        placeholder={specificOptions.placeholder}
        minValue={schema.minimum}
        maxValue={schema.maximum}
        formatOptions={getFormatOptions()}
        step={getStep()}
      />
    </WidgetWrapper>
  )
}

export default NumberWidgetRJSF
