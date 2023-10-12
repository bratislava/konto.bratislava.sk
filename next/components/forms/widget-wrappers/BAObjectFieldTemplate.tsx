import {
  getUiOptions,
  ObjectFieldTemplatePropertyType,
  ObjectFieldTemplateProps,
} from '@rjsf/utils'
import cx from 'classnames'
import { ObjectFieldUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import WidgetWrapper from './WidgetWrapper'

/**
 * Our custom implementation of https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/core/src/components/templates/ObjectFieldTemplate.tsx
 * This allows us to provide specific UI options for styling the template (e.g. columns).
 * This implementation removes titles and descriptions from objects. It might be needed to add it back.
 */
const BAObjectFieldTemplate = ({ idSchema, properties, uiSchema }: ObjectFieldTemplateProps) => {
  const options = {
    // Spacing must be `none` for objects, but default is different in WidgetWrapper
    spaceTop: 'none' as const,
    spaceBottom: 'none' as const,
    ...(getUiOptions(uiSchema) as ObjectFieldUiOptions),
  }

  const fieldsetClassname = cx({
    'block sm:grid sm:gap-4': options.objectDisplay === 'columns',
    'border-grey-200 rounded-xl border p-4': options.objectDisplay === 'boxed',
  })

  const gridTemplateColumns =
    options.objectDisplay === 'columns' && typeof options.objectColumnRatio === 'string'
      ? options.objectColumnRatio
          .split('/')
          .map((value) => `${value}fr`)
          .join(' ')
      : undefined

  return (
    <WidgetWrapper options={options}>
      <fieldset id={idSchema.$id} className={fieldsetClassname} style={{ gridTemplateColumns }}>
        {properties.map((prop: ObjectFieldTemplatePropertyType) => prop.content)}
      </fieldset>
    </WidgetWrapper>
  )
}

export default BAObjectFieldTemplate
