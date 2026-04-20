import NextLink from 'next/link'
import { usePlausible } from 'next-plausible'
import { ComponentProps, forwardRef } from 'react'

import cn from '@/src/utils/cn'

export type LinkAnalyticsProps = { id: string }

export type MLinkProps = Omit<ComponentProps<typeof NextLink>, 'as' | 'passHref'> & {
  /**
   * 'standard' variant is always underlined on mobile, but underlined only on hover on desktop
   * @default unstyled
   */
  variant?: 'unstyled' | 'standard' | 'underlined' | 'underlined-medium'
  analyticsProps?: LinkAnalyticsProps
  /**
   * Similar to this:
   * https://getbootstrap.com/docs/4.3/utilities/stretched-link/
   */
  stretched?: boolean
}

const MLink = forwardRef<HTMLAnchorElement, MLinkProps>(
  (
    { href, children, className, variant = 'unstyled', stretched = false, analyticsProps, ...rest },
    ref,
  ) => {
    const plausible = usePlausible()

    const styles = cn(
      'base-focus-ring rounded-xs underline-offset-2 transition',
      {
        'max-lg:underline lg:hover:underline': variant === 'standard',
        'underline hover:opacity-80': variant === 'underlined' || variant === 'underlined-medium',
        'font-medium': variant === 'underlined-medium',

        // https://github.com/tailwindlabs/tailwindcss/issues/1041#issuecomment-957425345
        'after:absolute after:inset-0': stretched,
      },
      className,
    )

    return (
      <NextLink
        href={href}
        passHref
        ref={ref}
        {...rest}
        className={styles}
        onClick={() => {
          if (analyticsProps) {
            plausible('Link click', { props: analyticsProps })
          }
        }}
      >
        {children}
      </NextLink>
    )
  },
)

export default MLink
