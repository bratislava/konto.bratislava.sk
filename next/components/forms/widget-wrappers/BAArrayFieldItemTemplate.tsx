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

// https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/material-ui/src/ArrayFieldItemTemplate/ArrayFieldItemTemplate.tsx
/** The `ArrayFieldItemTemplate` component is the template used to render an items of an array.
 *
 * @param props - The `ArrayFieldTemplateItemType` props for the component
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
  const {
    children,
    disabled,
    hasToolbar,
    hasCopy,
    hasMoveDown,
    hasMoveUp,
    hasRemove,
    index,
    onCopyIndexClick,
    onDropIndexClick,
    onReorderClick,
    readonly,
    uiSchema,
    registry,
  } = props
  const uiOptions = getUiOptions(uiSchema) as BAArrayFieldItemUiOptions<T, S, F>

  console.log('item', props)

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
    onDropIndexClick(innerIndex)({ preventDefault: () => {} })
  }

  return (
    <div className={boxStyle}>
      <div className={headingStyle}>
        <span className="text-h5 grow">{title}</span>
        {/* hasToolbar */}
        {hasRemove && (
          <Button
            variant="icon-wrapped"
            icon={<RemoveIcon />}
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
