import { StrictRJSFSchema } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { CustomComponentFieldUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import CustomComponents from '../widget-components/CustomComponents/CustomComponents'

interface CustomComponentsWidgetRJSFProps {
  id?: string | undefined
  schema: StrictRJSFSchema & { uiOptions: CustomComponentFieldUiOptions }
}

const CustomComponentsWidgetRJSF = ({ id, schema }: CustomComponentsWidgetRJSFProps) => {
  const { customComponents } = schema.uiOptions

  return (
    <WidgetWrapper id={id!} options={schema.uiOptions}>
      <CustomComponents components={customComponents} />
    </WidgetWrapper>
  )
}
export default CustomComponentsWidgetRJSF
