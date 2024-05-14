import { ChevronDownIcon } from '@assets/ui-icons'
import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  getTemplate,
  getUiOptions,
} from '@rjsf/utils'
import { ArrayFieldUiOptions } from '@shared/generator/uiOptionsTypes'
import { useTranslation } from 'next-i18next'
import { ComponentType } from 'react'

import { getArrayFieldItemTemplateTitle } from '../../../../frontend/utils/formArray'
import { useFormContext } from '../../useFormContext'
import { useFormSummary } from './useFormSummary'

type AdditionalItemTemplateProps = {
  parentUiOptions: ArrayFieldUiOptions
  parentId: string
  itemIndex: number
}

const TopLevelArrayFieldItemTemplate = ({
  index,
  children,
  parentUiOptions,
  parentId,
  itemIndex,
}: ArrayFieldTemplateItemType & AdditionalItemTemplateProps) => {
  const { t } = useTranslation('forms')
  const { itemTitle } = parentUiOptions
  const title = getArrayFieldItemTemplateTitle(itemTitle, index)

  const { isPdf } = useFormContext()
  const { fieldHasError } = useFormSummary()

  const hasError = fieldHasError(`${parentId}_${itemIndex}`)

  return (
    <details
      className="group mb-4 rounded-xl border border-gray-200 open:border-gray-700 hover:border-gray-500 hover:open:border-gray-700"
      open={isPdf}
    >
      <summary className="group flex w-full cursor-pointer p-6">
        <div className="flex grow flex-col gap-1">
          {title && <span className="text-p2-semibold">{title}</span>}
          {hasError && (
            <div className="text-p2 text-category-700 group-open:hidden">
              {t('summary.contains_errors')}
            </div>
          )}
        </div>
        {!isPdf && (
          <span className="shrink-0" aria-hidden>
            <ChevronDownIcon className="transition-transform group-open:rotate-180" />
          </span>
        )}
      </summary>
      <div className="p-6 pt-0">{children}</div>
    </details>
  )
}
export const ArrayFieldItemTemplate = (
  props: ArrayFieldTemplateItemType & AdditionalItemTemplateProps,
) => {
  const { index, children, parentUiOptions } = props
  const { itemTitle, variant } = parentUiOptions
  const title = getArrayFieldItemTemplateTitle(itemTitle, index)

  if (variant === 'topLevel') {
    return <TopLevelArrayFieldItemTemplate {...props}>{children}</TopLevelArrayFieldItemTemplate>
  }

  return (
    <div className="mb-4">
      {title && (
        <div className="text-p2-semibold mb-2 inline-block rounded-xl bg-gray-100 px-2">
          {title}
        </div>
      )}
      {children}
    </div>
  )
}
export const ArrayFieldTemplate = ({
  title,
  items,
  registry,
  uiSchema,
  idSchema,
}: ArrayFieldTemplateProps) => {
  const uiOptions = getUiOptions(uiSchema) as ArrayFieldUiOptions
  const InnerArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate'>(
    'ArrayFieldItemTemplate',
    registry,
  ) as ComponentType<ArrayFieldTemplateItemType & AdditionalItemTemplateProps>

  return (
    <div className="mt-4">
      {title && <div className="text-p2-semibold mb-4">{title}</div>}
      {items &&
        items.map(({ key, ...itemProps }) => (
          <InnerArrayFieldItemTemplate
            key={key}
            {...itemProps}
            parentUiOptions={uiOptions}
            parentId={idSchema.$id}
            itemIndex={itemProps.index}
          />
        ))}
    </div>
  )
}
