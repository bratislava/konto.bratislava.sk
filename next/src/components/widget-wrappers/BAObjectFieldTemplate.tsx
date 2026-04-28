import { Typography } from '@bratislava/component-library'
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
            <Typography variant="h2">{schema.title}</Typography>
            {options.description && (
              <Typography variant="p-small" as="div">
                <ConditionalFormMarkdown isMarkdown={options.descriptionMarkdown}>
                  {options.description}
                </ConditionalFormMarkdown>
              </Typography>
            )}
          </div>
        ) : (
          <>
            {options.title && (
              <Typography variant="h3" className="mb-3">
                {options.title}
              </Typography>
            )}
            {options.description && (
              <Typography variant="p-small" as="div" className="mb-3 whitespace-pre-wrap">
                <ConditionalFormMarkdown isMarkdown={options.descriptionMarkdown}>
                  {options.description}
                </ConditionalFormMarkdown>
              </Typography>
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
