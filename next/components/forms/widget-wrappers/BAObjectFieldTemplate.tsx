import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils'
import cx from 'classnames'
import { ObjectFieldUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import FormMarkdown from '../info-components/FormMarkdown'
import { WidgetSpacingContextProvider } from './useWidgetSpacingContext'
import WidgetWrapper from './WidgetWrapper'

const getPropertySpacing = (isInColumnObject: boolean, isFirst: boolean, isLast: boolean) => {
  // The column object itself has spacing, therefore its children should not have one
  if (isInColumnObject) {
    return {
      spaceTop: 'none' as const,
      spaceBottom: 'none' as const,
    }
  }
  return {
    ...(isFirst && { spaceTop: 'none' as const }),
    ...(isLast && { spaceBottom: 'none' as const }),
  }
}

/**
 * Our custom implementation of https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/core/src/components/templates/ObjectFieldTemplate.tsx
 * This allows us to provide specific UI options for styling the template (e.g. columns).
 * This implementation removes titles and descriptions from objects. It might be needed to add it back.
 */
const BAObjectFieldTemplate = ({ idSchema, properties, uiSchema }: ObjectFieldTemplateProps) => {
  const options = getUiOptions(uiSchema) as ObjectFieldUiOptions

  const defaultSpacing = {
    boxed: { spaceBottom: 'medium' as const, spaceTop: 'medium' as const },
    columns: {},
    noObjectDisplay: { spaceTop: 'none' as const, spaceBottom: 'none' as const },
  }[options.objectDisplay ?? 'noObjectDisplay']

  const fieldsetClassname = cx({
    'flex flex-col gap-6 sm:grid': options.objectDisplay === 'columns',
    'border-grey-200 rounded-xl border p-4': options.objectDisplay === 'boxed',
  })

  const gridTemplateColumns =
    options.objectDisplay === 'columns' && typeof options.objectColumnRatio === 'string'
      ? options.objectColumnRatio
          .split('/')
          .map((value) => `minmax(0, ${value}fr)`)
          .join(' ')
      : undefined

  return (
    <WidgetWrapper id={idSchema.$id} options={options} defaultSpacing={defaultSpacing}>
      <fieldset className={fieldsetClassname} style={{ gridTemplateColumns }}>
        {options.objectDisplay === 'boxed' && options.title && (
          <h3 className="text-h3 mb-3">{options.title}</h3>
        )}
        {options.objectDisplay === 'boxed' && options.description && (
          <div className="text-p2 whitespace-pre-wrap">
            <FormMarkdown>{options.description}</FormMarkdown>
          </div>
        )}
        {properties.map(({ content }, index) => {
          const isInColumnObject = options.objectDisplay === 'columns'
          const isFirst = index === 0
          const isLast = index === properties.length - 1

          return (
            <WidgetSpacingContextProvider
              spacing={getPropertySpacing(isInColumnObject, isFirst, isLast)}
              key={index}
            >
              {content}
            </WidgetSpacingContextProvider>
          )
        })}
      </fieldset>
    </WidgetWrapper>
  )
}

export default BAObjectFieldTemplate
