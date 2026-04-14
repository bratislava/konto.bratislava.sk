import { WidgetProps } from '@rjsf/utils'
import { CheckboxUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import Checkbox from '@/src/components/fields/Checkbox'
import CheckboxGroup from '@/src/components/fields/CheckboxGroup'
import mapRjsfToReactAriaProps from '@/src/components/widget-wrappers/mapRjsfToReactAriaProps'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

const CheckboxWidgetRJSF = (props: WidgetProps) => {
  const { wrapperProps, fieldProps, specificOptions } = mapRjsfToReactAriaProps<
    string[],
    CheckboxUiOptions
  >(props, {
    toFieldValue: (value) => (value ? ['true'] : []),
    fromFieldValue: (value) => Array.isArray(value) && value.length === 1 && value[0] === 'true',
  })

  return (
    <WidgetWrapper {...wrapperProps}>
      <CheckboxGroup
        {...fieldProps}
        data-cy={`checkbox-group-${fieldProps.label
          ?.toLowerCase()
          .replaceAll(' ', '-')
          .replace(/[?.,§/()]/g, '')}`}
      >
        <Checkbox value="true" variant={specificOptions.variant ?? 'basic'} data-cy="checkbox-true">
          {specificOptions.checkboxLabel}
        </Checkbox>
      </CheckboxGroup>
    </WidgetWrapper>
  )
}

export default CheckboxWidgetRJSF
