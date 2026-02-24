import { CheckIcon, CrossIcon } from '@/src/assets/ui-icons'
import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import WarningIcon from '@/src/components/icon-components/WarningIcon'
import Button from '@/src/components/simple-components/Button'
import cn from '@/src/utils/cn'

export type ThankYouCardProps = {
  variant: 'success' | 'error' | 'warning'
  title?: string
  firstButtonTitle?: string
  secondButtonTitle?: string
  content?: string
  feedbackTitle?: string
  firstButtonLink?: string
  secondButtonLink?: string
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20618-3493&t=PbcmCPTKtvfExOYw-4
 */

const ThankYouCard = ({
  variant,
  title,
  firstButtonTitle,
  secondButtonTitle,
  content,
  feedbackTitle,
  firstButtonLink,
  secondButtonLink,
}: ThankYouCardProps) => {
  const iconClassname = 'flex size-8 items-center justify-center md:size-10'
  const iconByVariant = {
    success: <CheckIcon className={cn(iconClassname, 'text-content-success-default')} />,
    error: <CrossIcon className={cn(iconClassname, 'text-content-error-default')} />,
    warning: <WarningIcon className={cn(iconClassname, 'text-content-warning-default')} />,
  }[variant]

  return (
    <div className="mx-auto flex size-full max-w-[734px] flex-col items-center gap-4 rounded-none bg-gray-0 px-4 pt-6 pb-4 md:gap-8 md:rounded-2xl md:px-12 md:py-10 lg:max-w-[800px]">
      <span
        className={cn(
          'flex h-14 w-14 min-w-14 items-center justify-center rounded-full md:h-[88px] md:w-[88px] md:min-w-[88px]',
          {
            'bg-background-success-soft-default': variant === 'success',
            'bg-background-error-soft-default': variant === 'error',
            'bg-background-warning-soft-default': variant === 'warning',
          },
        )}
      >
        {iconByVariant}
      </span>
      <div className="flex flex-col items-center gap-8 md:gap-3">
        <h2 className="text-center text-h3">{title}</h2>
        <AccountMarkdown variant="sm" content={content} className="text-center" />
      </div>
      <div
        className={cn('flex w-full flex-col items-center gap-4', {
          'px-0 sm:flex-row': !feedbackTitle,
        })}
      >
        {variant === 'success' ? (
          <>
            {firstButtonLink ? (
              feedbackTitle ? (
                <div className="flex w-full flex-col gap-6 rounded-lg bg-gray-100 p-8">
                  <h3 className="text-left text-h3">{feedbackTitle}</h3>
                  <Button href={firstButtonLink} variant="solid" fullWidth hasLinkIcon={false}>
                    {firstButtonTitle}
                  </Button>
                </div>
              ) : (
                <Button href={firstButtonLink} variant="solid" fullWidth hasLinkIcon={false}>
                  {firstButtonTitle}
                </Button>
              )
            ) : null}
            {secondButtonLink ? (
              <Button href={secondButtonLink} variant="outline" fullWidth hasLinkIcon={false}>
                {secondButtonTitle}
              </Button>
            ) : null}
          </>
        ) : (
          <>
            {firstButtonLink ? (
              <Button href={firstButtonLink} variant="solid" fullWidth hasLinkIcon={false}>
                {firstButtonTitle}
              </Button>
            ) : null}
            {secondButtonLink ? (
              <Button href={secondButtonLink} variant="outline" fullWidth hasLinkIcon={false}>
                {secondButtonTitle}
              </Button>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default ThankYouCard
