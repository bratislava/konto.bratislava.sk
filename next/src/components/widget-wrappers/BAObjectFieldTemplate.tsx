import { getUiOptions, ObjectFieldTemplateProps } from '@rjsf/utils'
import { getObjectFieldInfo } from 'forms-shared/form-utils/getObjectFieldInfo'
import { ObjectFieldUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import ConditionalFormMarkdown from '@/src/components/formatting/FormMarkdown/ConditionalFormMarkdown'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'
import cn from '@/src/utils/cn'

/**
 * Our custom implementation of https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/core/src/components/templates/ObjectFieldTemplate.tsx
 * This implementation removes `TitleFieldTemplate` and `DescriptionFieldTemplate` from the
 * implementation and displays them directly.
 */
const BAObjectFieldTemplate = ({
  fieldPathId,
  properties,
  schema,
  uiSchema,
}: ObjectFieldTemplateProps) => {
  const options = getUiOptions(uiSchema) as ObjectFieldUiOptions
  const { isStepObject } = getObjectFieldInfo(fieldPathId)
  const fieldsetClassname = cn({
    'rounded-xl border border-grey-200 p-4': options.objectDisplay === 'boxed',
  })

  return (
    <WidgetWrapper id={fieldPathId.$id} options={options}>
      <fieldset className={fieldsetClassname} data-cy={`fieldset-${fieldPathId.$id}`}>
        {isStepObject ? (
          <div className="mb-8 flex flex-col gap-4">
            <h2 className="text-h2">{schema.title}</h2>
            {options.description && (
              <span className="text-p2">
                <ConditionalFormMarkdown isMarkdown={options.descriptionMarkdown}>
                  {options.description}
                </ConditionalFormMarkdown>
              </span>
            )}
          </div>
        ) : (
          <>
            {options.title && <h3 className="mb-3 text-h3">{options.title}</h3>}
            {options.description && (
              <div className="mb-3 text-p2 whitespace-pre-wrap">
                <ConditionalFormMarkdown isMarkdown={options.descriptionMarkdown}>
                  {options.description}
                </ConditionalFormMarkdown>
              </div>
            )}
          </>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 sm:*:col-span-4">
          {properties.map(({ content }) => content)}
        </div>
      </fieldset>
    </WidgetWrapper>
  )
}

export default BAObjectFieldTemplate
