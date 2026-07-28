import { Button, Typography } from '@bratislava/component-library'

import Markdown from '@/src/components/formatting/Markdown'
import Icon from '@/src/components/icon-components/Icon'
import cn from '@/src/utils/cn'

type ThankYouTileButton = {
  label: string
  href: string
}

export type ThankYouTileProps = {
  variant: 'success' | 'error' | 'warning'
  title?: string
  content?: string
  isContentCentered?: boolean
  primaryButton?: ThankYouTileButton | null
  secondaryButton?: ThankYouTileButton | null
}

const ThankYouTileIcon = ({ variant }: Pick<ThankYouTileProps, 'variant'>) => {
  return (
    <div
      className={cn('flex size-14 min-w-14 items-center justify-center rounded-full lg:size-22', {
        'bg-background-success-soft-default': variant === 'success',
        'bg-background-error-soft-default': variant === 'error',
        'bg-background-warning-soft-default': variant === 'warning',
      })}
    >
      <Icon
        name={
          (
            {
              success: 'check',
              error: 'close',
              warning: 'warning',
            } as const
          )[variant]
        }
        className={cn('flex size-8 items-center justify-center lg:size-10', {
          'text-content-success-default': variant === 'success',
          'text-content-error-default': variant === 'error',
          'text-content-warning-default': variant === 'warning',
        })}
      />
    </div>
  )
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20618-3493&t=PbcmCPTKtvfExOYw-4
 */

const ThankYouTile = ({
  variant,
  title,
  content,
  isContentCentered = true,
  primaryButton,
  secondaryButton,
}: ThankYouTileProps) => {
  return (
    <div className="mx-auto flex w-full max-w-200 flex-col items-center gap-4 bg-gray-0 p-4 lg:gap-6 lg:rounded-2xl lg:p-12">
      <ThankYouTileIcon variant={variant} />
      <div className="flex flex-col gap-4 lg:gap-3">
        <Typography variant="h3" as="h2" className="text-center">
          {title}
        </Typography>
        <Markdown
          variant="small"
          content={content}
          className={cn('w-full', {
            'text-center': isContentCentered,
            'text-left': !isContentCentered,
          })}
        />
      </div>
      <div className="flex w-full flex-col items-center gap-3 empty:hidden">
        {primaryButton ? (
          <Button href={primaryButton.href} variant="solid" fullWidth hasLinkIcon={false}>
            {primaryButton.label}
          </Button>
        ) : null}
        {secondaryButton ? (
          <Button href={secondaryButton.href} variant="outline" fullWidth hasLinkIcon={false}>
            {secondaryButton.label}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export default ThankYouTile
