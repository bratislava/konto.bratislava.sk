import {
  ArrayFieldTemplateItemType,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils'
import { getArrayItemTitle } from 'forms-shared/form-utils/getArrayItemTitle'
import { ArrayFieldUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import { RemoveIcon } from '@/assets/ui-icons'
import cn from '@/frontend/cn'

import Button from '../simple-components/Button'

export type BAArrayFieldItemTemplateAdditionalProps = {
  parentUiOptions: ArrayFieldUiOptions
  parentSelfId: string
}

/**
 * Our custom implementation of https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/material-ui/src/ArrayFieldItemTemplate/ArrayFieldItemTemplate.tsx
 */
const BAArrayFieldItemTemplate = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends FormContextType = any,
>(
  props: ArrayFieldTemplateItemType<T, S, F> & BAArrayFieldItemTemplateAdditionalProps,
) => {
  const { children, hasRemove, index, onDropIndexClick, parentUiOptions, parentSelfId } = props
  const { variant, itemTitle } = parentUiOptions

  const boxStyle = cn({
    'rounded-lg border border-zinc-300 bg-white p-4 md:px-6 md:pt-8 md:pb-6':
      variant === 'topLevel',
    'rounded-lg bg-gray-50': variant === 'nested',
  })

  const headingStyle = cn('flex items-center gap-8', {
    'mb-8': variant === 'topLevel',
    'border-b border-gray-200 px-4 py-5 md:px-6': variant === 'nested',
  })

  const contentStyle = cn({
    'px-4 py-5 md:px-6': variant === 'nested',
  })

  const title = getArrayItemTitle(itemTitle, index)

  const onDropIndexClickPatched = (innerIndex: number) => () => {
    // The RJSF expects the event to have a `preventDefault` method, but the `onPress` handler
    // does not provide it. We need to patch it in order to make the RJSF work.
    onDropIndexClick(innerIndex)({ preventDefault: () => {} })
  }

  return (
    <div className={boxStyle} data-cy={`section-${parentSelfId}-${index}`}>
      <div className={headingStyle}>
        {variant === 'topLevel' && <h3 className="grow text-h3">{title}</h3>}
        {variant === 'nested' && <h4 className="grow text-h4">{title}</h4>}
        {hasRemove && (
          <Button
            variant="icon-wrapped"
            icon={<RemoveIcon />}
            // TODO: Translation + improve message
            aria-label="Vymazať"
            onPress={onDropIndexClickPatched(index)}
            className="self-start"
          />
        )}
      </div>
      <div className={contentStyle}>{children}</div>
    </div>
  )
}

export default BAArrayFieldItemTemplate
