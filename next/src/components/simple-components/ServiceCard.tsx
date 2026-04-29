import { Button, Typography } from '@bratislava/component-library'
import { ReactNode } from 'react'

import { ArrowRightIcon, ExportIcon } from '@/src/assets/ui-icons'
import { LinkAnalyticsProps } from '@/src/components/simple-components/MLink'
import cn from '@/src/utils/cn'

type ServiceCardBase = {
  title: string
  description: string
  buttonText: string
  className?: string
  icon: ReactNode
  href: string
  tags?: string[]
  tagStyle?: string
  analyticsProps?: LinkAnalyticsProps
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-3034&t=Ko8aVlDp8OuC3xXc-4
 */

const ServiceCard = ({
  title,
  description,
  buttonText,
  className,
  tags,
  tagStyle,
  icon,
  href,
  analyticsProps,
}: ServiceCardBase) => {
  const style = cn(
    'group relative flex w-full flex-col items-start gap-5 rounded-lg border border-solid border-gray-200 bg-gray-0 p-4',
    className,
    { 'cursor-pointer': buttonText },
    { 'cursor-default': !buttonText },
  )

  return (
    <div className={style}>
      <div className="flex w-full justify-between">
        <div className="rounded-lg border border-gray-200 p-1.5 lg:p-2.5">{icon}</div>
        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tagItem, index) => (
              <Typography
                variant="p-tiny"
                as="span"
                key={index}
                className={cn('h-min rounded-sm px-2 font-medium', tagStyle)}
              >
                {tagItem}
              </Typography>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex w-full flex-col items-start gap-3 text-left">
        <Typography
          variant="h5"
          as="h3"
          className={cn({
            'group-hover:underline': buttonText,
          })}
        >
          {title}
        </Typography>
        <Typography variant="p-tiny">{description}</Typography>
      </div>
      <div className="flex size-full items-end">
        <div className="flex h-max w-full items-center justify-between">
          <Button
            href={href}
            variant="link"
            hasLinkIcon={false}
            stretched
            analyticsProps={analyticsProps}
          >
            {buttonText}
          </Button>
          {buttonText && (
            <span className="flex size-10 min-w-[40px] items-center justify-center rounded-full bg-gray-50">
              {href?.includes('http') ? (
                <ExportIcon className="size-5" />
              ) : (
                <ArrowRightIcon className="size-5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
