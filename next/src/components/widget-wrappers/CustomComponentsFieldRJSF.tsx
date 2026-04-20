import { FieldProps, getUiOptions } from '@rjsf/utils'
import { CustomComponentFieldUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import CustomComponents from '@/src/components/widget-components/CustomComponents/CustomComponents'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

const CustomComponentsFieldRJSF = ({ fieldPathId, uiSchema }: FieldProps) => {
  const id = fieldPathId.$id
  const options = getUiOptions(uiSchema) as CustomComponentFieldUiOptions
  const { customComponents } = options

  return (
    <WidgetWrapper id={id} options={options}>
      <CustomComponents id={id} components={customComponents} />
    </WidgetWrapper>
  )
}
export default CustomComponentsFieldRJSF
