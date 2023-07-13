import { LinkVariantIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { ReactNode } from 'react'
import slugify from 'slugify'

import MLink from '../forms/simple-components/MLink'

type WrapperProps = {
  title?: string
  children: ReactNode
  direction?: 'column' | 'row'
  noBorder?: boolean
}

export const Wrapper = ({ title, children, direction = 'row', noBorder }: WrapperProps) => {
  const wrapperClassNames = cx(
    'border-t-1 mb-10 flex flex-col border border-b-0 border-l-0 border-r-0 border-solid border-gray-800 pt-10',
    {
      'border-t-0': noBorder,
    },
  )

  const childrenClassNames = cx('flex', {
    'flex-col space-y-2': direction === 'column',
    'space-x-2 justify-between': direction === 'row',
  })

  return (
    <div className={wrapperClassNames}>
      {title && (
        <h2 id={slugify(title)} className="text-h2 pb-2">
          <MLink href={`#${slugify(title)}`} className="group">
            {title}
            <span className="pl-2 invisible group-hover:visible">
              <LinkVariantIcon className="inline" />
            </span>
          </MLink>
        </h2>
      )}
      <div className={childrenClassNames}>{children}</div>
    </div>
  )
}
