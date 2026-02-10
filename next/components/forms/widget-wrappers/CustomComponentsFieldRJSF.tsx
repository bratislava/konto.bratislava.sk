import { FieldProps, getUiOptions } from '@rjsf/utils'
import { CustomComponentFieldUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import CustomComponents from '@/components/forms/widget-components/CustomComponents/CustomComponents'
import WidgetWrapper from '@/components/forms/widget-wrappers/WidgetWrapper'

const CustomComponentsFieldRJSF = ({ idSchema, uiSchema }: FieldProps) => {
  const id = idSchema.$id
  const options = getUiOptions(uiSchema) as CustomComponentFieldUiOptions
  const { customComponents } = options

  return (
    <WidgetWrapper id={id} options={options}>
      <CustomComponents id={id} components={customComponents} />
    </WidgetWrapper>
  )
}
export default CustomComponentsFieldRJSF
