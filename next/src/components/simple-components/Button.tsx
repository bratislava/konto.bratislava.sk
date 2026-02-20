/* eslint-disable sonarjs/no-duplicate-string */

import NextLink from 'next/link'
import { ComponentProps, forwardRef, PropsWithChildren, ReactNode, RefObject } from 'react'
import { AriaButtonProps } from 'react-aria'
import { Button as RACButton, ButtonProps as RACButtonProps } from 'react-aria-components'

import { ArrowDownIcon, ArrowRightIcon, ExportIcon } from '@/src/assets/ui-icons'
import MLink, { LinkAnalyticsProps } from '@/src/components/simple-components/MLink'
import Spinner from '@/src/components/simple-components/Spinner'
import cn from '@/src/frontend/cn'

type ButtonOrIconButton =
  | {
      icon: ReactNode
      'aria-label': string
      startIcon?: never
      endIcon?: never
      children?: never
    }
  | ({
      icon?: never
      startIcon?: ReactNode
      endIcon?: ReactNode
    } & PropsWithChildren)

type ButtonBase = {
  // When adding a new variant, include it also in is...Variant booleans below
  variant?:
    | 'unstyled'
    | 'icon-wrapped'
    | 'icon-wrapped-negative-margin'
    | 'solid'
    | 'solid-inverted'
    | 'outline'
    | 'plain'
    | 'negative-solid'
    | 'negative-plain'
    | 'link'
    | 'link-inverted'
  size?: 'responsive' | 'large' | 'small'
  className?: string
  fullWidth?: boolean
  fullWidthMobile?: boolean
  isLoading?: boolean
  loadingText?: string
} & ButtonOrIconButton

export type ButtonProps = Omit<RACButtonProps, 'className' | 'style'> &
  ButtonBase & {
    href?: never
    target?: never
    hasLinkIcon?: never
    analyticsProps?: never
  }

export type AnchorProps = Omit<AriaButtonProps<'a'>, 'children'> &
  ButtonBase &
  Pick<ComponentProps<typeof NextLink>, 'target' | 'replace' | 'prefetch'> & {
    stretched?: boolean
    hasLinkIcon?: boolean
    analyticsProps?: LinkAnalyticsProps
  }

export type PolymorphicProps = ButtonProps | AnchorProps

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-52741&m=dev
 */

const Button = forwardRef<HTMLAnchorElement | HTMLButtonElement, PolymorphicProps>(
  (
    {
      children,
      className,
      isDisabled,
      variant = 'unstyled',
      size = 'responsive',
      icon,
      startIcon,
      endIcon,
      hasLinkIcon = true,
      fullWidth,
      fullWidthMobile,
      isLoading,
      loadingText,
      ...rest
    },
    ref,
  ) => {
    const isLoadingOrDisabled = isLoading || isDisabled

    const isSolidVariant =
      variant === 'solid' || variant === 'negative-solid' || variant === 'solid-inverted'
    const isOutlineVariant = variant === 'outline'
    const isSolidOrOutlineVariant = isSolidVariant || isOutlineVariant
    const isPlainVariant = variant === 'plain' || variant === 'negative-plain'
    const isIconWrappedVariant =
      variant === 'icon-wrapped' || variant === 'icon-wrapped-negative-margin'
    const isIconButton = Boolean(icon)
    const isLinkVariant = variant === 'link' || variant === 'link-inverted'

    /* TODO
     *   - border should render inside button, not outside
     *   - focus text color for 'culture' and 'social' category should be -800
     */
    const styles = cn(
      'base-focus-ring',
      {
        // https://github.com/tailwindlabs/tailwindcss/issues/1041#issuecomment-957425345
        'after:absolute after:inset-0': 'stretched' in rest && rest.stretched,

        // width or fullwidth
        'w-full': fullWidth,
        'w-full md:w-fit': fullWidthMobile,
        'w-fit': !fullWidth && !fullWidthMobile,
      },
      variant === 'unstyled'
        ? ''
        : cn(
            // TODO text-button interferes with text-[color], as quickfix we set size and color here by arbitrary values
            'inline-flex h-auto items-center justify-center gap-2 text-[1rem] leading-[1.5rem] font-semibold transition',

            {
              // rounded corners (links recieve rounded corners so their focus ring is rounded similar to buttons)
              'rounded-lg': !isLinkVariant,
              'rounded-xs': isLinkVariant,

              // link styles
              'font-medium underline underline-offset-2 max-lg:gap-1': isLinkVariant,

              // disabled
              'opacity-50': isDisabled,

              // border width
              border: isSolidOrOutlineVariant,

              // padding - link variants
              'p-0': isLinkVariant,

              // padding - icon-wrapped variant
              'p-2 outline-offset-0': isIconButton && isIconWrappedVariant,
              '-m-2': isIconButton && variant === 'icon-wrapped-negative-margin',

              // padding - solid and outlined variants
              'px-4 py-2 lg:py-3':
                size === 'responsive' && !isIconButton && isSolidOrOutlineVariant,
              'px-4 py-2': size === 'small' && !isIconButton && isSolidOrOutlineVariant,
              'px-4 py-3': size === 'large' && !isIconButton && isSolidOrOutlineVariant,

              // padding - solid and outlined variants with "icon"
              'p-2.5 lg:p-3': size === 'responsive' && isIconButton && isSolidOrOutlineVariant,
              'p-2.5': size === 'small' && isIconButton && isSolidOrOutlineVariant,
              'p-3': size === 'large' && isIconButton && isSolidOrOutlineVariant,

              // padding - plain variants
              'px-2 py-1 lg:px-3 lg:py-2': size === 'responsive' && !isIconButton && isPlainVariant,
              'px-2 py-1': size === 'small' && !isIconButton && isPlainVariant,
              'px-3 py-2': size === 'large' && !isIconButton && isPlainVariant,

              // padding - plain variants with "icon"
              'p-1.5 lg:p-2': size === 'responsive' && isIconButton && isPlainVariant,
              'p-1.5': size === 'small' && isIconButton && isPlainVariant,
              'p-2': size === 'large' && isIconButton && isPlainVariant,

              // colors - bg, border, content - variant solid (figma: boxed primary)
              'border-border-active-primary-default bg-background-active-primary-default text-content-active-primary-inverted-default':
                variant === 'solid',
              'hover:border-border-active-primary-hover hover:bg-background-active-primary-hover hover:text-content-active-primary-inverted-hover active:border-border-active-primary-pressed active:bg-background-active-primary-pressed active:text-content-active-primary-inverted-pressed':
                variant === 'solid' && !isLoadingOrDisabled,

              // colors - bg, border, content - variant solid-inverted (figma: boxed primary inverted)
              'border-border-active-primary-inverted-default bg-background-active-primary-inverted-default text-content-active-primary-default':
                variant === 'solid-inverted',
              'hover:border-border-active-primary-inverted-hover hover:bg-background-active-primary-inverted-hover hover:text-content-active-primary-hover active:border-border-active-primary-inverted-pressed active:bg-background-active-primary-inverted-pressed active:text-content-active-primary-pressed':
                variant === 'solid-inverted' && !isLoadingOrDisabled,

              // colors - bg, border, content - variant outline (figma: boxed secondary)
              'bg-background-active-secondary-default text-content-active-secondary-default border-border-active-secondary-default':
                variant === 'outline',
              'hover:bg-background-active-secondary-hover hover:text-content-active-secondary-hover active:bg-background-active-secondary-pressed active:text-content-active-secondary-pressed hover:border-border-active-secondary-hover active:border-border-active-secondary-pressed':
                variant === 'outline' && !isLoadingOrDisabled,

              // colors - bg, border, content - variant plain (figma: plain default)
              'text-content-active-secondary-default bg-background-active-primary-soft-inverted-default':
                variant === 'plain',
              'hover:bg-background-active-primary-soft-hover hover:text-content-active-primary-hover active:bg-background-active-primary-soft-pressed active:text-content-active-primary-pressed':
                variant === 'plain' && !isLoadingOrDisabled,

              // colors - bg, border, content - variant negative-solid
              'border-border-error bg-background-error-default text-white':
                variant === 'negative-solid',
              'hover:border-border-error-hover hover:bg-background-error-hover active:border-border-error-pressed active:bg-background-error-pressed':
                variant === 'negative-solid' && !isLoadingOrDisabled,

              // colors - bg, border, content - variant negative-plain
              'text-content-error-default': variant === 'negative-plain',
              'hover:bg-background-error-soft-default hover:text-content-error-hover active:bg-background-error-soft-pressed active:text-content-error-pressed':
                variant === 'negative-plain' && !isLoadingOrDisabled,

              // colors - bg, border, content - variant link
              'text-content-active-primary-default': variant === 'link',
              'hover:text-content-active-primary-hover active:text-content-active-primary-pressed':
                variant === 'link' && !isDisabled,

              // colors - bg, border, content - variant link-inverted
              'text-content-active-primary-inverted-default': variant === 'link-inverted',
              'hover:text-content-active-primary-inverted-hover': variant === 'link-inverted',
              'active:text-content-active-primary-inverted-pressed':
                variant === 'link-inverted' && !isLoadingOrDisabled,

              // svg icons
              '[&>svg]:h-5 [&>svg]:w-5 [&>svg]:lg:h-6 [&>svg]:lg:w-6': size === 'responsive',
              '[&>svg]:h-5 [&>svg]:w-5': size === 'small',
              '[&>svg]:h-6 [&>svg]:w-6': size === 'large',
            },
          ),
      className,
    )

    if (rest.href) {
      const isExternal = rest.href.startsWith('http')
      const isAnchor = rest.href.startsWith('#') && rest.href !== '#'
      const linkIcon = hasLinkIcon ? (
        isExternal ? (
          <ExportIcon className="shrink-0" />
        ) : isAnchor ? (
          <ArrowDownIcon className="shrink-0" />
        ) : (
          <ArrowRightIcon className="shrink-0" />
        )
      ) : null

      return (
        <MLink
          href={rest.href}
          target={isExternal ? '_blank' : '_self'}
          ref={ref as RefObject<HTMLAnchorElement | null>}
          className={styles}
          analyticsProps={rest.analyticsProps}
          {...rest}
        >
          {startIcon}
          {icon ?? children}
          {linkIcon ?? endIcon}
        </MLink>
      )
    }

    return (
      <RACButton
        ref={ref as RefObject<HTMLButtonElement | null>}
        isDisabled={isLoadingOrDisabled}
        className={styles}
        {...rest}
      >
        {!isLoading && startIcon}
        {isLoading ? (
          <>
            {loadingText}
            <Spinner size="sm" />
          </>
        ) : (
          (icon ?? children)
        )}
        {!isLoading && endIcon}
      </RACButton>
    )
  },
)

export default Button
