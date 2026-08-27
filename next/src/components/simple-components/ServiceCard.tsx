import { Button, Typography } from '@bratislava/component-library'
import { ReactNode } from 'react'

import Icon from '@/src/components/icon-components/Icon'
import cn from '@/src/utils/cn'
import { CommonLinkProps } from '@/src/utils/getLinkProps'

type ServiceCardBase = {
  title: string
  description: string
  className?: string
  icon: ReactNode
  linkProps: CommonLinkProps
  tags?: string[]
  tagStyle?: string
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-3034&t=Ko8aVlDp8OuC3xXc-4
 */

const ServiceCard = ({
  title,
  description,
  className,
  tags,
  tagStyle,
  icon,
  linkProps,
}: ServiceCardBase) => {
  const style = cn(
    'group relative flex w-full flex-col items-start gap-5 rounded-lg border border-solid border-gray-200 bg-gray-0 p-4 wrapper-focus-ring!',
    className,
  )
  const hasButtonText = Boolean(linkProps.children)
  const isExternal = linkProps.target === '_blank'

  return (
    <div className={style}>
      <div className="flex w-full justify-between">
        <div className="rounded-lg border border-gray-200 p-1.5 lg:p-2.5">{icon}</div>
        {/* TODO Use Tag component */}
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
            'group-hover:underline': hasButtonText,
          })}
        >
          {title}
        </Typography>
        <Typography variant="p-small">{description}</Typography>
      </div>
      <div className="flex size-full items-end">
        <div className="flex h-max w-full items-center justify-between">
          <Button {...linkProps} variant="link" hasLinkIcon={false} stretched />
          {hasButtonText && (
            <span className="flex size-10 min-w-[40px] items-center justify-center rounded-full bg-gray-50">
              {/* The information about opening in a new tab is a part of the link's aria-label, so the icon is decorative. */}
              <Icon name={isExternal ? 'export' : 'arrow-right'} className="size-5" />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
