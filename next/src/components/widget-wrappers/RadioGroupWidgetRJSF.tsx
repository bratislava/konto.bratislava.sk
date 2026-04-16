import { WithEnumOptions } from 'forms-shared/form-utils/WithEnumOptions'
import { mergeEnumOptionsMetadata } from 'forms-shared/generator/optionItems'
import { RadioGroupUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { useMemo } from 'react'

import Radio from '@/src/components/fields/Radio'
import RadioGroup from '@/src/components/fields/RadioGroup'
import mapRjsfToReactAriaProps, {
  RJSFWidgetProps,
} from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

type RadioGroupWidgetRJSFProps = RJSFWidgetProps<
  string | boolean | undefined,
  WithEnumOptions<RadioGroupUiOptions>
>

const RadioGroupWidgetRJSF = (props: RadioGroupWidgetRJSFProps) => {
  const isBoolean = props.schema.type === 'boolean'

  /**
   * RadioGroupField component only supports string as value, in RJSF we want to support both string and boolean.
   * Therefore, if the value is boolean, we need to convert it to string before passing it to the RadioGroup component.
   * We also handle conversion between null (RadioGroupField) and undefined (RJSF).
   */
  const { wrapperProps, fieldProps, specificOptions } = mapRjsfToReactAriaProps(props, {
    toFieldValue: (value) => {
      if (isBoolean) return typeof value === 'boolean' ? value.toString() : null

      return typeof value === 'string' ? value : null
    },
    fromFieldValue: (value) => {
      if (value === null) return undefined
      if (isBoolean) return value === 'true'

      return value
    },
  })

  const { enumOptions, enumMetadata, variant, orientations } = specificOptions

  const mergedOptions = useMemo(
    () => mergeEnumOptionsMetadata(enumOptions, enumMetadata),
    [enumOptions, enumMetadata],
  )

  const hasDescriptionInRadioGroup = mergedOptions.some((option) => option.description)

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
              hasDescriptionInRadioGroup={hasDescriptionInRadioGroup}
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
