import { CheckboxUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import Checkbox from '@/src/components/fields/Checkbox'
import CheckboxGroup from '@/src/components/fields/CheckboxGroup'
import useRjsfAdapter, { RJSFWidgetProps } from '@/src/components/widget-wrappers/useRjsfAdapter'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

type CheckboxWidgetRJSFProps = RJSFWidgetProps<boolean | null, CheckboxUiOptions>

const CheckboxWidgetRJSF = (props: CheckboxWidgetRJSFProps) => {
  const { wrapperProps, fieldProps, specificOptions } = useRjsfAdapter(props, {
    toField: (v) => (v ? ['true'] : []),
    fromField: (v) => Array.isArray(v) && v.length === 1 && v[0] === 'true',
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
