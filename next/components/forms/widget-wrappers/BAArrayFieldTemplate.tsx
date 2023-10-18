import { AddIcon } from '@assets/ui-icons'
import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  FormContextType,
  getTemplate,
  getUiOptions,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils'
import cx from 'classnames'
import { ComponentType } from 'react'
import { ArrayFieldUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import FieldErrorMessage from '../info-components/FieldErrorMessage'
import ButtonNew from '../simple-components/ButtonNew'
import WidgetWrapper from './WidgetWrapper'

/**
 * Our custom implementation of https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/material-ui/src/ArrayFieldTemplate/ArrayFieldTemplate.tsx
 */
const BAArrayFieldTemplate = <
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(
  props: ArrayFieldTemplateProps<T, S, F>,
) => {
  const {
    canAdd,
    disabled,
    idSchema,
    uiSchema,
    items,
    onAddClick,
    readonly,
    registry,
    required,
    schema,
    title,
    rawErrors,
  } = props
  const uiOptions = getUiOptions(uiSchema) as ArrayFieldUiOptions
  const ArrayFieldDescriptionTemplate = getTemplate<'ArrayFieldDescriptionTemplate', T, S, F>(
    'ArrayFieldDescriptionTemplate',
    registry,
    uiOptions,
  )
  const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate', T, S, F>(
    'ArrayFieldItemTemplate',
    registry,
    uiOptions,
  ) as ComponentType<ArrayFieldTemplateItemType<T, S, F> & { parentUiOptions: ArrayFieldUiOptions }>
  const ArrayFieldTitleTemplate = getTemplate<'ArrayFieldTitleTemplate', T, S, F>(
    'ArrayFieldTitleTemplate',
    registry,
    uiOptions,
  )

  const containerStyle = cx('flex flex-col', {
    'gap-6': uiOptions.variant === 'topLevel',
    'gap-4': uiOptions.variant === 'nested',
  })

  const onAddClickPatched = () => {
    // The RJSF expects the event to have a `preventDefault` method, but the `onPress` handler
    // does not provide it. We need to patch it in order to make the RJSF work.
    onAddClick({ preventDefault: () => {} })
  }

  const hasErrors = rawErrors && rawErrors?.length > 0

  return (
    <WidgetWrapper options={uiOptions}>
      <ArrayFieldTitleTemplate
        idSchema={idSchema}
        title={uiOptions.title || title}
        schema={schema}
        uiSchema={uiSchema}
        required={required}
        registry={registry}
      />
      <ArrayFieldDescriptionTemplate
        idSchema={idSchema}
        description={uiOptions.description || schema.description}
        schema={schema}
        uiSchema={uiSchema}
        registry={registry}
      />
      <div className={containerStyle}>
        <div key={`array-item-list-${idSchema.$id}`} className="flex flex-col gap-6">
          {items &&
            items.map(({ key, ...itemProps }: ArrayFieldTemplateItemType<T, S, F>) => (
              <ArrayFieldItemTemplate key={key} {...itemProps} parentUiOptions={uiOptions} />
            ))}
        </div>
        {(canAdd || hasErrors) && (
          <div>
            {canAdd && (
              <div>
                {uiOptions.variant === 'topLevel' && (
                  <>
                    {uiOptions.addTitle && <span>{uiOptions.addTitle}</span>}
                    {uiOptions.addDescription && <span>{uiOptions.addDescription}</span>}
                  </>
                )}
                <ButtonNew
                  variant={
                    { topLevel: 'black-outline' as const, nested: 'black-plain' as const }[
                      uiOptions.variant
                    ]
                  }
                  startIcon={<AddIcon />}
                  onPress={onAddClickPatched}
                  isDisabled={disabled || readonly}
                  fullWidth
                >
                  {uiOptions.addButtonLabel}
                </ButtonNew>
              </div>
            )}
            {hasErrors && <FieldErrorMessage errorMessage={rawErrors} />}
          </div>
        )}
      </div>
    </WidgetWrapper>
  )
}

export default BAArrayFieldTemplate
