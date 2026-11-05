import { Fragment, ReactElement, ReactNode } from 'react'

import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import cn from '@/src/utils/cn'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=26121-18285&t=9Fyat62AfTEQC01S-4
 *
 * Notes:
 * - We purposefully include horizontal padding in this wrapper and strip it from children
 * - The wrapper either takes a single child or an array of items, which are automatically separated by a divider.
 */

type Props = (
  | {
      children: ReactNode
      items?: never
      asList?: never
    }
  | {
      children?: never
      items: ReactElement[]
      asList?: boolean
    }
) & {
  className?: string
}

const RowGroupWrapper = ({ children, items, asList, className }: Props) => {
  if (items && items.length > 0) {
    const WrapperElement = asList ? 'ul' : 'div'

    return (
      <WrapperElement
        className={cn(
          'flex flex-col rounded-lg border border-border-passive-primary bg-background-passive-base px-4 py-2 lg:px-6',
          className,
        )}
      >
        {items.map((item, index) => (
          <Fragment key={item.key ?? index}>
            {index > 0 && <HorizontalDivider asListItem={asList} />}
            {asList ? <li>{item}</li> : item}
          </Fragment>
        ))}
      </WrapperElement>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-border-passive-primary bg-background-passive-base px-4 py-2 lg:px-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default RowGroupWrapper
