import { WidgetProps } from '@rjsf/utils'
import { WithEnumOptions } from 'forms-shared/form-utils/WithEnumOptions'
import { mergeEnumOptionsMetadata } from 'forms-shared/generator/optionItems'
import { RadioGroupUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { useMemo } from 'react'

import Radio from '@/src/components/fields/Radio'
import RadioGroup from '@/src/components/fields/RadioGroup'
import mapRjsfToReactAriaProps from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

const RadioGroupWidgetRJSF = (props: WidgetProps) => {
  const isBoolean = props.schema.type === 'boolean'

  const { wrapperProps, fieldProps, specificOptions } = mapRjsfToReactAriaProps<
    string | null,
    WithEnumOptions<RadioGroupUiOptions>
  >(props, {
    toFieldValue: (v) => {
      if (isBoolean) return typeof v === 'boolean' ? v.toString() : null

      return v ?? null
    },
    fromFieldValue: (v) => {
      if (v === null) return undefined
      if (isBoolean) return v === 'true'

      return v
    },
  })

  const { enumOptions, enumMetadata, variant, orientations } = specificOptions

  const mergedOptions = useMemo(
    () => mergeEnumOptionsMetadata(enumOptions, enumMetadata),
    [enumOptions, enumMetadata],
  )

  return (
    <WidgetWrapper {...wrapperProps}>
      <RadioGroup
        {...fieldProps}
        data-cy={`radio-group-${fieldProps.label
          ?.toLowerCase()
          .replaceAll(' ', '-')
          .replace(/[?.,§/()]/g, '')}`}
        orientation={orientations === 'row' ? 'horizontal' : 'vertical'}
      >
        {mergedOptions.map((option) => {
          const radioValue =
            typeof option.value === 'boolean' ? option.value.toString() : option.value

          return (
            <Radio
              key={radioValue}
              variant={variant}
              value={radioValue}
              description={option.description}
              data-cy={`radio-${option.label.toLowerCase().replaceAll(' ', '-').replaceAll('.', '')}`}
            >
              {option.label}
            </Radio>
          )
        })}
      </RadioGroup>
    </WidgetWrapper>
  )
}

export default RadioGroupWidgetRJSF
