import { Typography } from '@bratislava/component-library'
import slugify from '@sindresorhus/slugify'

import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import { Button } from '@bratislava/component-library'
import cn from '@/src/utils/cn'
import { SectionTitleLevel } from '@/src/utils/getCardTitleLevel'
import { CommonLinkProps } from '@/src/utils/getLinkProps'

type Props = {
  title?: string | null
  titleId?: string
  titleLevel?: SectionTitleLevel | null
  text?: string | null
  asRichtext?: boolean
  isFullWidth?: boolean
  isCentered?: boolean
  showMoreLink?: CommonLinkProps | null
  className?: string
}

/**
 * Based on Bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/master/next/src/components/layouts/SectionHeader.tsx
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19822-39145
 */

const SectionHeader = ({
  title,
  titleId,
  titleLevel,
  text,
  asRichtext = false,
  isFullWidth = false,
  isCentered = false,
  showMoreLink,
  className,
}: Props) => {
  if (!title && !text && !showMoreLink) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center lg:justify-end',
        {
          'flex flex-col items-start gap-y-4 lg:flex-row lg:flex-wrap lg:justify-between': title,
          'lg:justify-start': !showMoreLink,
        },
        className,
      )}
    >
      {title || text ? (
        <div
          className={cn('flex w-full flex-col items-start gap-2', {
            'mx-auto items-center text-center': isCentered,
            'max-w-[50rem]': !isFullWidth, // 50rem = 800px
          })}
        >
          {title ? (
            <Typography
              // TODO Implement correct classes for Typography component - this classname is just a temporary override
              className={cn({
                'text-h2': titleLevel === 'h2',
                'text-h3': titleLevel === 'h3',
              })}
              variant={titleLevel ?? 'h2'}
              id={titleId ?? slugify(title)}
            >
              {title}
            </Typography>
          ) : null}
          {text ? (
            asRichtext ? (
              <AccountMarkdown content={text} />
            ) : (
              <Typography variant="p-default">{text}</Typography>
            )
          ) : null}
        </div>
      ) : null}

      {showMoreLink ? (
        <div
          className={cn('min-w-fit', {
            // Styling is a bit different from Figma, to make it more consistent.
            // Adding mt-2 when title is used for better alignment to center of first line
            'lg:mt-2': title,
          })}
        >
          <Button variant="link" {...showMoreLink} />
        </div>
      ) : null}
    </div>
  )
}

export default SectionHeader
