import { WithEnumOptions } from 'forms-shared/form-utils/WithEnumOptions'
import { mergeEnumOptionsMetadata } from 'forms-shared/generator/optionItems'
import { CheckboxGroupUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { useMemo } from 'react'

import Checkbox from '@/src/components/fields/Checkbox'
import CheckboxGroup from '@/src/components/fields/CheckboxGroup'
import mapRjsfToReactAriaProps, {
  RJSFWidgetProps,
} from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'
import { isDefined } from '@/src/frontend/utils/general'

type CheckboxGroupWidgetRJSFProps = RJSFWidgetProps<
  string[] | undefined,
  WithEnumOptions<CheckboxGroupUiOptions>
>

const CheckboxGroupWidgetRJSF = (props: CheckboxGroupWidgetRJSFProps) => {
  const { maxItems } = props.schema

  const { wrapperProps, fieldProps, specificOptions } = mapRjsfToReactAriaProps(props, {
    toFieldValue: (value) => value ?? [],
    fromFieldValue: (value) => value,
  })

  const { enumOptions, enumMetadata, variant = 'basic' } = specificOptions

  const mergedOptions = useMemo(
    () => mergeEnumOptionsMetadata(enumOptions, enumMetadata),
    [enumOptions, enumMetadata],
  )

  const hasDescriptionInCheckboxGroup = mergedOptions.some((option) => option.description)

  const isOptionDisabled = (optionValue: string) => {
    return (
      isDefined(maxItems) &&
      fieldProps.value.length === maxItems &&
      !fieldProps.value.includes(optionValue)
    )
  }

  return (
    <WidgetWrapper {...wrapperProps}>
      <CheckboxGroup
        {...fieldProps}
        data-cy={`checkbox-group-${fieldProps.label
          ?.toLowerCase()
          .replaceAll(' ', '-')
          .replace(/[?.,§/()]/g, '')}`}
      >
        {mergedOptions.map((option) => (
          <Checkbox
            key={option.value}
            value={option.value}
            variant={variant}
            description={option.description}
            hasDescriptionInCheckboxGroup={hasDescriptionInCheckboxGroup}
            isDisabled={isOptionDisabled(option.value)}
            data-cy={`checkbox-${option.value}`}
          >
            {option.label}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </WidgetWrapper>
  )
}

export default CheckboxGroupWidgetRJSF
