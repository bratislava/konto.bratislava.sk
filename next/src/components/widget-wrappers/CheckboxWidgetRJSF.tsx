import { WidgetProps } from '@rjsf/utils'
import { CheckboxUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import Checkbox from '@/src/components/fields/Checkbox'
import CheckboxGroup from '@/src/components/fields/CheckboxGroup'
import useRjsfAdapter from '@/src/components/widget-wrappers/useRjsfAdapter'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

const CheckboxWidgetRJSF = (props: WidgetProps) => {
  const { wrapperProps, fieldProps, specificOptions } = useRjsfAdapter<string[], CheckboxUiOptions>(
    props,
    {
      toField: (v) => (v ? ['true'] : []),
      fromField: (v) => v.includes('true'),
    },
  )

  return (
    <WidgetWrapper {...wrapperProps}>
      <CheckboxGroup
        {...fieldProps}
        data-cy={`checkbox-group-${fieldProps.label?.toLowerCase().replaceAll(' ', '-').replace(/[?.,§/()]/g, '')}`}
      >
        <Checkbox value="true" variant={specificOptions.variant ?? 'basic'} data-cy="checkbox-true">
          {specificOptions.checkboxLabel}
        </Checkbox>
      </CheckboxGroup>
    </WidgetWrapper>
  )
}

export default CheckboxWidgetRJSF
