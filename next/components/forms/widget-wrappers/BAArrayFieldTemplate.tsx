import { AddIcon } from '@assets/ui-icons'
import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  FormContextType,
  getTemplate,
  getUiOptions,
  RJSFSchema,
  StrictRJSFSchema,
  UIOptionsType,
} from '@rjsf/utils'
import cx from 'classnames'

import ButtonNew from '../simple-components/ButtonNew'

type BAArrayFieldUiOptions<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
> = UIOptionsType<T, S, F> & {
  title?: string
  description?: string
  addButtonLabel: string
} & (
    | {
        variant: 'topLevel'
        addTitle?: string
        addDescription?: string
      }
    | {
        variant: 'nested'
      }
  )

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
  } = props
  const uiOptions = getUiOptions(uiSchema) as BAArrayFieldUiOptions<T, S, F>
  console.log('array', props)
  const ArrayFieldDescriptionTemplate = getTemplate<'ArrayFieldDescriptionTemplate', T, S, F>(
    'ArrayFieldDescriptionTemplate',
    registry,
    uiOptions,
  )
  const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate', T, S, F>(
    'ArrayFieldItemTemplate',
    registry,
    uiOptions,
  )
  const ArrayFieldTitleTemplate = getTemplate<'ArrayFieldTitleTemplate', T, S, F>(
    'ArrayFieldTitleTemplate',
    registry,
    uiOptions,
  )

  const containerStyle = cx('flex flex-col', {
    'gap-6': uiOptions.variant === 'topLevel',
    'gap-4': uiOptions.variant === 'nested',
  })

  // const containerStyle = cx({
  //   'flex flex-col gap-6': uiOptions.variant === 'topLevel',
  //   'flex flex-col gap-6': uiOptions.variant === 'topLevel',
  //   'rounded border border-gray-300 p-2': uiOptions.variant === 'nested',
  // })

  const onAddClickPatched = () => {
    onAddClick({ preventDefault: () => {} })
  }

  return (
    <div>
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
              <ArrayFieldItemTemplate key={key} {...itemProps} />
            ))}
        </div>
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
      </div>
    </div>
  )
}

export default BAArrayFieldTemplate
