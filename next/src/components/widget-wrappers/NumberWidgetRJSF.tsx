import { WidgetProps } from '@rjsf/utils'
import { NumberUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import NumberField from '@/src/components/fields/NumberField'
import mapRjsfToReactAriaProps from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

const NumberWidgetRJSF = (props: WidgetProps) => {
  const { schema } = props

  const { wrapperProps, fieldProps, specificOptions } = mapRjsfToReactAriaProps<
    number,
    NumberUiOptions
  >(props, {
    toFieldValue: (v) => v ?? NaN,
    fromFieldValue: (v) => (Number.isNaN(v) ? undefined : v),
  })

  const getStep = () => {
    if (schema.multipleOf != null) {
      return schema.multipleOf
    }
    if (schema.type === 'integer') {
      return 1
    }

    return undefined
  }

  const getFormatOptions = () => {
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
