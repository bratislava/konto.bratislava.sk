import {
  getUiOptions,
  ObjectFieldTemplatePropertyType,
  ObjectFieldTemplateProps,
} from '@rjsf/utils'
import cx from 'classnames'

type ObjectFieldUiOptions = {
  objectDisplay?: 'columns'
  /**
   * Slash separated numeric values, e.g. '1/2' or '1/2/3'
   */
  objectColumnRatio?: string
}

/**
 * Our custom implementation of https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/core/src/components/templates/ObjectFieldTemplate.tsx
 * This allows us to provide specific UI options for styling the template (e.g. columns).
 * This implementation removes titles and descriptions from objects. It might be needed to add it back.
 *
 * TODO: Consider adding WidgetWrapper.
 */
const BAObjectFieldTemplate = ({ idSchema, properties, uiSchema }: ObjectFieldTemplateProps) => {
  const options = getUiOptions(uiSchema) as ObjectFieldUiOptions

  const fieldsetClassname = cx({
    'block sm:grid sm:gap-4': options.objectDisplay === 'columns',
  })

  const gridTemplateColumns =
    options.objectDisplay === 'columns' && typeof options.objectColumnRatio === 'string'
      ? options.objectColumnRatio
          .split('/')
          .map((value) => `${value}fr`)
          .join(' ')
      : undefined

  return (
    <fieldset id={idSchema.$id} className={fieldsetClassname} style={{ gridTemplateColumns }}>
      {properties.map((prop: ObjectFieldTemplatePropertyType) => prop.content)}
    </fieldset>
  )
}

export default BAObjectFieldTemplate
