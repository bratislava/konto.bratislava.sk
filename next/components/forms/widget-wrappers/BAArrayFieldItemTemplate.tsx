import { RemoveIcon } from '@assets/ui-icons'
import {
  ArrayFieldTemplateItemType,
  FormContextType,
  getUiOptions,
  RJSFSchema,
  StrictRJSFSchema,
  UIOptionsType,
} from '@rjsf/utils'
import cx from 'classnames'

import Button from '../simple-components/ButtonNew'

type BAArrayFieldItemUiOptions<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends FormContextType = any,
> = {
  variant: 'topLevel' | 'nested'
  itemTitle: string
} & UIOptionsType<T, S, F>

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
  props: ArrayFieldTemplateItemType<T, S, F>,
) => {
  const { children, hasRemove, index, onDropIndexClick, uiSchema } = props
  const uiOptions = getUiOptions(uiSchema) as BAArrayFieldItemUiOptions<T, S, F>

  const boxStyle = cx({
    'rounded-lg border border-zinc-300 bg-white px-6 pb-6 pt-8': uiOptions.variant === 'topLevel',
    'rounded-lg bg-gray-50': uiOptions.variant === 'nested',
  })

  const headingStyle = cx('flex items-center gap-8', {
    // 'rounded-lg border border-zinc-300 bg-white px-6 pb-6 pt-8': uiOptions.variant === 'topLevel',
    'border-b border-gray-200 px-6 py-5': uiOptions.variant === 'nested',
  })

  const contentStyle = cx({
    'p-6': uiOptions.variant === 'nested',
  })

  const title = (uiOptions.itemTitle ?? '').replace('{index}', String(index + 1))

  const onDropIndexClickPatched = (innerIndex: number) => () => {
    // The RJSF expects the event to have a `preventDefault` method, but the `onPress` handler
    // does not provide it. We need to patch it in order to make the RJSF work.
    onDropIndexClick(innerIndex)({ preventDefault: () => {} })
  }

  return (
    <div className={boxStyle}>
      <div className={headingStyle}>
        <span className="text-h5 grow">{title}</span>
        {hasRemove && (
          <Button
            variant="icon-wrapped"
            icon={<RemoveIcon />}
            // TODO: Translation + improve message
            aria-label="Vymazať"
            onPress={onDropIndexClickPatched(index)}
          />
        )}
      </div>
      <div className={contentStyle}>{children}</div>
    </div>
  )
}

export default BAArrayFieldItemTemplate
