import NextLink from 'next/link'

import cn from '@/frontend/cn'

type Props = {
  className?: string
  href: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  children?: React.ReactNode
  icon?: React.ReactNode
  hoverIcon?: React.ReactNode
  iconPosition?: 'right' | 'left'
  iconClassName?: string
  variant?: 'primary' | 'plain'
}

const NavBarLink = ({
  className,
  href,
  target,
  children,
  icon,
  hoverIcon: iHoverIcon,
  iconPosition,
  iconClassName,
  variant = 'primary',
}: Props) => {
  const hasIcon = !!icon
  const hasIconLeft = hasIcon && iconPosition === 'left'
  const hasIconRight = hasIcon && iconPosition === 'right'

  const hoverIcon = iHoverIcon || icon

  return (
    <NextLink className={className} href={href} target={target}>
      <div
        className={cn('group flex cursor-pointer items-center', {
          'font-medium text-category-600': variant === 'primary',
        })}
      >
        <span className="group-hover:hidden">{hasIconLeft && icon}</span>
        <span className="hidden group-hover:block">{hasIconLeft && hoverIcon}</span>
        <span
          className={cn(iconClassName, {
            'pl-6': hasIconLeft,
            'pr-6': hasIconRight,
          })}
        >
          {children}
        </span>
        <span className="group-hover:hidden">{hasIconRight && icon}</span>
        <span className="hidden group-hover:block">{hasIconRight && hoverIcon}</span>
      </div>
    </NextLink>
  )
}

export default NavBarLink
