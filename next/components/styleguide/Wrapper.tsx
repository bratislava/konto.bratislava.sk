import { ReactNode } from 'react'
import slugify from 'slugify'

import { LinkVariantIcon } from '@/assets/ui-icons'
import MLink from '@/components/forms/simple-components/MLink'
import cn from '@/frontend/cn'

type WrapperProps = {
  title?: string
  children: ReactNode
  direction?: 'column' | 'row'
  noBorder?: boolean
}

const mySlugify = (text: string) => {
  return slugify(text, { lower: true })
}

export const Wrapper = ({ title, children, direction = 'row', noBorder }: WrapperProps) => {
  const wrapperClassNames = cn(
    'mb-10 flex flex-col border border-t-1 border-r-0 border-b-0 border-l-0 border-solid border-gray-800 pt-10',
    {
      'border-t-0': noBorder,
    },
  )

  const childrenClassNames = cn('flex gap-2', {
    'flex-col': direction === 'column',
    'flex-row': direction === 'row',
  })

  return (
    <div className={wrapperClassNames}>
      {title && (
        <h2 id={mySlugify(title)} className="pb-2 text-h2">
          <MLink href={`#${mySlugify(title)}`} className="group">
            {title}
            <span className="invisible pl-2 group-hover:visible">
              <LinkVariantIcon className="inline" />
            </span>
          </MLink>
        </h2>
      )}
      <div className={childrenClassNames}>{children}</div>
    </div>
  )
}
