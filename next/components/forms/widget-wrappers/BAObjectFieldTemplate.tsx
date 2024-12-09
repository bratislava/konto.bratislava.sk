import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils'
import cx from 'classnames'
import { getObjectFieldInfo } from 'forms-shared/form-utils/getObjectFieldInfo'
import { ObjectFieldUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { PropsWithChildren } from 'react'

import ConditionalFormMarkdown from '../info-components/ConditionalFormMarkdown'
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

const ColumnDisplay = ({
  uiOptions,
  children,
}: PropsWithChildren<{ uiOptions: ObjectFieldUiOptions }>) => {
  if (uiOptions.columns && uiOptions.columnsRatio) {
    const gridTemplateColumns = uiOptions.columnsRatio
      .split('/')
      .map((value) => `minmax(0, ${value}fr)`)
      .join(' ')

    return (
      // For screens below sm, we want to display them as rows
      <div className="flex flex-col gap-6 sm:grid" style={{ gridTemplateColumns }}>
        {children}
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Our custom implementation of https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/core/src/components/templates/ObjectFieldTemplate.tsx
 * This allows us to provide specific UI options for styling the template (e.g. columns).
 * This implementation removes `TitleFieldTemplate` and `DescriptionFieldTemplate` from the
 * implementation and displays them directly.
 */
const BAObjectFieldTemplate = ({
  idSchema,
  properties,
  schema,
  uiSchema,
}: ObjectFieldTemplateProps) => {
  const options = getUiOptions(uiSchema) as ObjectFieldUiOptions
  const { isStepObject, isFormObject } = getObjectFieldInfo(idSchema)
  const defaultSpacing = {
    wrapper: isFormObject ? { spaceTop: 'none' as const } : {},
    boxed: {
      spaceBottom: 'medium' as const,
      spaceTop: 'medium' as const,
    },
  }[options.objectDisplay ?? 'wrapper']

  const fieldsetClassname = cx({
    'border-grey-200 rounded-xl border p-4': options.objectDisplay === 'boxed',
  })

  return (
    <WidgetWrapper id={idSchema.$id} options={options} defaultSpacing={defaultSpacing}>
      <fieldset className={fieldsetClassname} data-cy={`fieldset-${idSchema.$id}`}>
        {isStepObject ? (
          <div className="mb-8 flex flex-col gap-4">
            <h2 className="text-h2">{schema.title}</h2>
            {schema.description && <p className="text-p2">{schema.description}</p>}
          </div>
        ) : (
          <>
            {options.title && <h3 className="text-h3 mb-3">{options.title}</h3>}
            {options.description && (
              <div className="text-p2 mb-3 whitespace-pre-wrap">
                <ConditionalFormMarkdown isMarkdown={options.descriptionMarkdown}>
                  {options.description}
                </ConditionalFormMarkdown>
              </div>
            )}
          </>
        )}
        <ColumnDisplay uiOptions={options}>
          {properties.map(({ content }, index) => {
            const isFirst = index === 0
            const isLast = index === properties.length - 1

            return (
              <WidgetSpacingContextProvider
                spacing={getPropertySpacing(Boolean(options.columns), isFirst, isLast)}
                key={index}
              >
                {content}
              </WidgetSpacingContextProvider>
            )
          })}
        </ColumnDisplay>
      </fieldset>
    </WidgetWrapper>
  )
}

export default BAObjectFieldTemplate
