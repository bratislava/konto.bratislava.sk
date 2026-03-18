import {
  ArrayFieldTemplateProps,
  FormContextType,
  getUiOptions,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils'
import { ArrayFieldUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import { AddIcon } from '@/src/assets/ui-icons'
import ConditionalFormMarkdown from '@/src/components/formatting/FormMarkdown/ConditionalFormMarkdown'
import Alert from '@/src/components/simple-components/Alert'
import { Button } from '@bratislava/component-library'
import FieldErrorMessage from '@/src/components/widget-components/FieldErrorMessage'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'
import cn from '@/src/utils/cn'

/**
 * Our custom implementation of https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/material-ui/src/ArrayFieldTemplate/ArrayFieldTemplate.tsx
 */
const BAArrayFieldTemplate = <
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  canAdd,
  disabled,
  fieldPathId,
  uiSchema,
  items,
  onAddClick,
  readonly,
  title,
  rawErrors,
}: ArrayFieldTemplateProps<T, S, F>) => {
  const uiOptions = getUiOptions(uiSchema) as ArrayFieldUiOptions
  const {
    variant,
    description,
    descriptionMarkdown,
    addButtonLabel,
    hideTitle,
    cannotAddItemMessage,
  } = uiOptions

  const containerStyle = cn('flex flex-col', {
    'gap-6': variant === 'topLevel',
    'gap-4': variant === 'nested',
  })

  const onAddClickPatched = () => {
    // The RJSF expects the event to have a `preventDefault` method, but the `onPress` handler
    // does not provide it. We need to patch it in order to make the RJSF work.
    onAddClick({ preventDefault: () => {} })
  }

  const hasErrors = rawErrors && rawErrors.length > 0

  return (
    <WidgetWrapper id={fieldPathId.$id} options={uiOptions}>
      {!hideTitle && (
        <>
          {/* ArrayFieldTitleTemplate is not used */}
          {title && variant === 'topLevel' && (
            <h3 className={cn('text-h3', { 'mb-2': description, 'mb-6': !description })}>
              {title}
            </h3>
          )}
          {title && variant === 'nested' && <h4 className="mb-4 text-h4">{title}</h4>}
        </>
      )}
      {/* ArrayFieldDescriptionTemplate is not used */}
      {/* TODO: Unified implementation of description. */}
      {description && variant === 'nested' && (
        <Alert
          type="info"
          hasIcon={false}
          message={
            <ConditionalFormMarkdown isMarkdown={descriptionMarkdown}>
              {description}
            </ConditionalFormMarkdown>
          }
          fullWidth
          className="mb-6 whitespace-pre-wrap"
        />
      )}
      {description && variant === 'topLevel' && (
        <div className="mb-6">
          <ConditionalFormMarkdown isMarkdown={descriptionMarkdown}>
            {description}
          </ConditionalFormMarkdown>
        </div>
      )}
      <div className={containerStyle}>
        <div key={`array-item-list-${fieldPathId.$id}`} className="flex flex-col gap-6">
          {items}
        </div>
        <div>
          <div className="flex flex-col gap-6">
            {variant === 'topLevel' && (uiOptions.addTitle || uiOptions.addDescription) && (
              <div className="flex flex-col gap-3">
                {uiOptions.addTitle && <span className="text-h3">{uiOptions.addTitle}</span>}
                {uiOptions.addDescription && <span>{uiOptions.addDescription}</span>}
              </div>
            )}
            <Button
              variant={({ topLevel: 'outline', nested: 'plain' } as const)[variant]}
              startIcon={<AddIcon />}
              onPress={onAddClickPatched}
              isDisabled={!canAdd || disabled || readonly}
              fullWidth
              data-cy="add-button"
            >
              {addButtonLabel}
            </Button>
            {!canAdd && cannotAddItemMessage && <span>{cannotAddItemMessage}</span>}
          </div>
          {hasErrors && <FieldErrorMessage errorMessage={rawErrors} />}
        </div>
      </div>
    </WidgetWrapper>
  )
}

export default BAArrayFieldTemplate
