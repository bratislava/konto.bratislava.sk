import Link from 'next/link'
import { ComponentProps, forwardRef, ReactNode } from 'react'
import cn from '../../../frontend/cn'

export type LinkProps = Omit<ComponentProps<typeof Link>, 'as' | 'passHref'> & {
  children: ReactNode
  className?: string
  label?: string
  labelCenter?: boolean
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
}

const MLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, label, labelCenter, children, className, target, ...rest }, ref) => {
    const regEx = /^http/

    return regEx.test(href) ? (
      <a
        ref={ref}
        target={target || '_blank'}
        rel="noreferrer"
        {...rest}
        className={className}
        href={href}
      >
        <p>{label}</p>
        {children}
      </a>
    ) : (
      <Link href={href} passHref ref={ref} {...rest} className={className}>
        <p className={cn({ 'w-full text-center': labelCenter })}>{label}</p>
        {children}
      </Link>
    )
  },
)

export default MLink
