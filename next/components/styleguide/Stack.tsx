import cx from 'classnames'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type StackProps = {
  bg?: 'white' | 'dark'
  width?: 'desktop' | 'mobile' | 'full' | null
  direction?: 'column' | 'row'
  children: ReactNode
  className?: string
}

export const Stack = ({ direction = 'row', children, width = 'full', className }: StackProps) => {
  const classNameStyles = twMerge(
    cx('flex flex-wrap gap-2 rounded-lg border border-dashed border-gray-800 p-4 xs:p-3', {
      'flex-col items-center': direction === 'column',
      'flex-row items-end': direction === 'row',
      'w-full': width === 'full',
    }),
    className,
  )

  return <div className={classNameStyles}>{children}</div>
}
