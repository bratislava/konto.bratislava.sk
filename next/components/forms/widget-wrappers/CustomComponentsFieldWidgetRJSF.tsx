import { WidgetProps } from '@rjsf/utils'
import { CustomComponentFieldUiOptions } from '@shared/generator/uiOptionsTypes'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

import CustomComponents from '../widget-components/CustomComponents/CustomComponents'

interface CustomComponentsWidgetRJSFProps extends WidgetProps {
  options: CustomComponentFieldUiOptions
}

const CustomComponentsWidgetRJSF = ({ id, options }: CustomComponentsWidgetRJSFProps) => {
  const { customComponents } = options

  return (
    <WidgetWrapper id={id} options={options}>
      <CustomComponents components={customComponents} />
    </WidgetWrapper>
  )
}
export default CustomComponentsWidgetRJSF
