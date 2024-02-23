import cx from 'classnames'
import NextLink from 'next/link'
import { usePlausible } from 'next-plausible'
import { ComponentProps, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

export type LinkPlausibleProps = { id: string }

export type MLinkNewProps = Omit<ComponentProps<typeof NextLink>, 'as' | 'passHref'> & {
  /**
   * 'standard' variant is always underlined on mobile, but underlined only on hover on desktop
   * @default unstyled
   */
  variant?: 'unstyled' | 'standard' | 'underlined' | 'underlined-medium'
  plausibleProps?: LinkPlausibleProps
  /**
   * Similar to this:
   * https://getbootstrap.com/docs/4.3/utilities/stretched-link/
   */
  stretched?: boolean
}

const MLink = forwardRef<HTMLAnchorElement, MLinkNewProps>(
  (
    { href, children, className, variant = 'unstyled', stretched = false, plausibleProps, ...rest },
    ref,
  ) => {
    const plausible = usePlausible()

    const styles = twMerge(
      cx('underline-offset-2 transition', {
        'max-lg:underline lg:hover:underline': variant === 'standard',
        'underline hover:opacity-80': variant === 'underlined' || variant === 'underlined-medium',
        'font-medium': variant === 'underlined-medium',

        // https://github.com/tailwindlabs/tailwindcss/issues/1041#issuecomment-957425345
        'after:absolute after:inset-0': stretched,
      }),
      className,
    )

    return (
      <NextLink
        href={href}
        passHref
        ref={ref}
        {...rest}
        className={styles}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        onClick={() => plausible('Link click', { props: plausibleProps })}
      >
        {children}
      </NextLink>
    )
  },
)

export default MLink
