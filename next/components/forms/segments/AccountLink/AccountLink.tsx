import Link, { LinkProps } from 'next/link'

import cn from '../../../../frontend/cn'

interface Props {
  label: string
  description: string
  href: LinkProps['href']
  variant?: 'black' | 'category'
}

const AccountLink = ({ description, label, href, variant = 'black' }: Props) => {
  // TODO OAuth revisit data-cy attribute and href.toString()
  // const name = typeof href === 'string' ? href.replaceAll('/', '') : href.href?.replaceAll('/', '')
  return (
    <div className="flex flex-col justify-between md:flex-row">
      <div className="text-16-semibold text-gray-800">{description}</div>
      <Link
        href={href}
        // data-cy={`${name}-button`}
        className={cn('font-semibold underline', {
          'text-category-700 hover:text-gray-600 focus:text-category-800': variant === 'black',
          'text-gray-700 hover:text-category-600 focus:text-gray-800': variant === 'category',
        })}
      >
        {label}
      </Link>
    </div>
  )
}

export default AccountLink
