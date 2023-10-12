import { WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'
import { CustomComponentFieldUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import CustomComponents from '../widget-components/CustomComponents/CustomComponents'

interface CustomComponentsWidgetRJSFProps extends WidgetProps {
  options: CustomComponentFieldUiOptions & WidgetProps['options']
}

const CustomComponentsWidgetRJSF = ({ options }: CustomComponentsWidgetRJSFProps) => {
  const { customComponents } = options

  return (
    <WidgetWrapper options={options}>
      <CustomComponents components={customComponents} />
    </WidgetWrapper>
  )
}
export default CustomComponentsWidgetRJSF
