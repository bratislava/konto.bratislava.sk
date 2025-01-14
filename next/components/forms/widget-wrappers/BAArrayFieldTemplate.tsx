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
import { ArrayFieldUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { ComponentType } from 'react'

import Alert from '../info-components/Alert'
import ConditionalFormMarkdown from '../info-components/ConditionalFormMarkdown'
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
>({
  canAdd,
  disabled,
  idSchema,
  uiSchema,
  items,
  onAddClick,
  readonly,
  registry,
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
  const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate', T, S, F>(
    'ArrayFieldItemTemplate',
    registry,
    uiOptions,
  ) as ComponentType<ArrayFieldTemplateItemType<T, S, F> & { parentUiOptions: ArrayFieldUiOptions }>

  const containerStyle = cx('flex flex-col', {
    'gap-6': variant === 'topLevel',
    'gap-4': variant === 'nested',
  })

  const onAddClickPatched = () => {
    // The RJSF expects the event to have a `preventDefault` method, but the `onPress` handler
    // does not provide it. We need to patch it in order to make the RJSF work.
    onAddClick({ preventDefault: () => {} })
  }

  const hasErrors = rawErrors && rawErrors?.length > 0

  return (
    <WidgetWrapper id={idSchema.$id} options={uiOptions}>
      {!hideTitle && (
        <>
          {/* ArrayFieldTitleTemplate is not used */}
          {title && variant === 'topLevel' && <h3 className="text-h3 mb-6">{title}</h3>}
          {title && variant === 'nested' && <h4 className="text-h4 mb-4">{title}</h4>}
        </>
      )}
      {/* ArrayFieldDescriptionTemplate is not used */}
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
      <div className={containerStyle}>
        <div key={`array-item-list-${idSchema.$id}`} className="flex flex-col gap-6">
          {items &&
            items.map(({ key, ...itemProps }: ArrayFieldTemplateItemType<T, S, F>) => (
              <ArrayFieldItemTemplate key={key} {...itemProps} parentUiOptions={uiOptions} />
            ))}
        </div>
        <div>
          <div className="flex flex-col gap-6">
            {/* eslint-disable-next-line unicorn/consistent-destructuring */}
            {variant === 'topLevel' && (uiOptions.addTitle || uiOptions.addDescription) && (
              <div className="flex flex-col gap-3">
                {/* eslint-disable-next-line unicorn/consistent-destructuring */}
                {uiOptions.addTitle && <span className="text-h3">{uiOptions.addTitle}</span>}
                {/* eslint-disable-next-line unicorn/consistent-destructuring */}
                {uiOptions.addDescription && <span>{uiOptions.addDescription}</span>}
              </div>
            )}
            <ButtonNew
              variant={
                { topLevel: 'black-outline' as const, nested: 'black-plain' as const }[variant]
              }
              startIcon={<AddIcon />}
              onPress={onAddClickPatched}
              isDisabled={!canAdd || disabled || readonly}
              fullWidth
              data-cy="add-button"
            >
              {addButtonLabel}
            </ButtonNew>
            {!canAdd && cannotAddItemMessage && <span>{cannotAddItemMessage}</span>}
          </div>
          {hasErrors && <FieldErrorMessage errorMessage={rawErrors} />}
        </div>
      </div>
    </WidgetWrapper>
  )
}

export default BAArrayFieldTemplate
