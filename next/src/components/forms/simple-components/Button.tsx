/* eslint-disable sonarjs/no-duplicate-string */

import { useObjectRef } from '@react-aria/utils'
import NextLink from 'next/link'
import { ComponentProps, forwardRef, PropsWithChildren, ReactNode, Ref, RefObject } from 'react'
import { AriaButtonProps } from 'react-aria'
import { Button as RACButton, ButtonProps as RACButtonProps } from 'react-aria-components'

import { ArrowDownIcon, ArrowRightIcon, ExportIcon } from '@/src/assets/ui-icons'
import MLink, { LinkPlausibleProps } from '@/src/components/forms/simple-components/MLink'
import Spinner from '@/src/components/forms/simple-components/Spinner'
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
    | 'outline'
    | 'plain'
    | 'negative-solid'
    | 'negative-plain'
    | 'link'
  size?: 'responsive' | 'large' | 'small'
  className?: string
  fullWidth?: boolean
  fullWidthMobile?: boolean
  isLoading?: boolean
  // TODO: change to loadingText
  isLoadingText?: string
} & ButtonOrIconButton

export type ButtonProps = Omit<RACButtonProps, 'className' | 'style'> &
  ButtonBase & {
    href?: never
    target?: never
    hasLinkIcon?: never
    // TODO: change to analyticsProps
    plausibleProps?: never
  }

export type AnchorProps = Omit<AriaButtonProps<'a'>, 'children'> &
  ButtonBase &
  Pick<ComponentProps<typeof NextLink>, 'target' | 'replace' | 'prefetch'> & {
    stretched?: boolean
    hasLinkIcon?: boolean
    // TODO: change to analyticsProps
    plausibleProps?: LinkPlausibleProps
  }

export type PolymorphicProps = ButtonProps | AnchorProps

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
      // TODO: default true
      hasLinkIcon,
      fullWidth,
      fullWidthMobile,
      isLoading,
      isLoadingText,
      onPress,
      ...rest
    },
    forwardedRef,
  ) => {
    const ref = useObjectRef(forwardedRef)
    const isLoadingOrDisabled = isLoading || isDisabled

    const isSolidVariant = variant.endsWith('solid')
    const isOutlineVariant = variant.endsWith('outline')
    const isSolidOrOutlineVariant = isSolidVariant || isOutlineVariant
    const isPlainVariant = variant.endsWith('plain')
    const isLinkVariant = variant.endsWith('link')
    const isIconWrappedVariant =
      variant === 'icon-wrapped' || variant === 'icon-wrapped-negative-margin'
    const isIconButton = Boolean(icon)

    /* TODO
     *   - examine why `text-button` interferes with `text-[color]` and therefore is sometimes ignored
     *   - border should render inside button, not outside
     *   - focus text color for 'culture' and 'social' category should be -800
     */
    const styles = cn(
      'base-focus-ring',
      variant === 'unstyled'
        ? ''
        : cn(
            // TODO text-button interferes with text-[color], as quickfix we set size and color here by arbitrary values
            'inline-flex h-auto items-center justify-center gap-2 text-[1rem] leading-[1.5rem] font-semibold transition',

            // we change rounded corners for link focus ring
            {
              'rounded-xs max-lg:gap-1': isLinkVariant,
              'rounded-lg': !isLinkVariant,
            },

            {
              // NOTE: there are some style overrides for link variants below in "twMerge"

              'font-medium underline': isLinkVariant,

              // disabled or loading
              'opacity-50': isLoadingOrDisabled,

              // width or fullwidth
              'w-full': fullWidth,
              'w-full md:w-fit': fullWidthMobile,
              'w-fit': !fullWidth && !fullWidthMobile,

              // border width
              'border-2': isSolidOrOutlineVariant,

              // padding - link variants
              'p-0': isLinkVariant,

              // padding - icon-wrapped variant
              'p-2 outline-offset-0': isIconButton && isIconWrappedVariant,
              '-m-2': isIconButton && variant === 'icon-wrapped-negative-margin',

              // padding - filled and outlined variants
              'px-4 py-2 lg:py-3':
                size === 'responsive' && !isIconButton && isSolidOrOutlineVariant,
              'px-4 py-2': size === 'small' && !isIconButton && isSolidOrOutlineVariant,
              'px-4 py-3': size === 'large' && !isIconButton && isSolidOrOutlineVariant,

              // padding - filled and outlined variants with "icon"
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

              // colors - bg, border, text - idle & focus
              'border-gray-700 bg-gray-700 text-white data-pressed:border-gray-800 data-pressed:bg-gray-800':
                variant === 'solid',
              'border-gray-200 bg-transparent text-gray-700 data-pressed:border-gray-300 data-pressed:text-gray-800':
                variant === 'outline',
              'border-negative-700 bg-negative-700 text-white data-pressed:border-negative-800 data-pressed:bg-negative-800':
                variant === 'negative-solid',

              'text-gray-700 data-pressed:bg-gray-200 data-pressed:text-gray-800':
                variant === 'plain',
              'text-negative-700 data-pressed:bg-negative-200 data-pressed:text-negative-800':
                variant === 'negative-plain',

              'text-gray-700 data-pressed:text-gray-800': variant === 'link',

              // colors:hover - bg, border, text
              // using custom `data-hovered:` because `hover:` is not working with `disabled` state
              'data-hovered:border-gray-600 data-hovered:bg-gray-600': variant === 'solid',
              'data-hovered:border-gray-200 data-hovered:text-gray-600': variant === 'outline',
              'data-hovered:bg-gray-100 data-hovered:text-gray-600': variant === 'plain',

              'data-hovered:border-negative-600 data-hovered:bg-negative-600':
                variant === 'negative-solid',
              'data-hovered:bg-negative-100 data-hovered:text-negative-600':
                variant === 'negative-plain',

              'data-hovered:text-gray-600': variant === 'link',

              // svg icons
              '[&>svg]:h-5 [&>svg]:w-5 lg:[&>svg]:h-6 lg:[&>svg]:w-6': size === 'responsive',
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
          ref={ref as Ref<HTMLAnchorElement>}
          className={styles}
          plausibleProps={rest.plausibleProps}
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
            {isLoadingText}
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
