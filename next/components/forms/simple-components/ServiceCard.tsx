import { ArrowRightIcon, ExportIcon } from '@assets/ui-icons'
import { ReactNode } from 'react'

import cn from '../../../frontend/cn'
import ButtonNew from './ButtonNew'
import { LinkPlausibleProps } from './MLinkNew'

type ServiceCardBase = {
  title: string
  description: string
  buttonText: string
  className?: string
  icon: ReactNode
  href: string
  tags?: string[]
  tagStyle?: string
  plausibleProps?: LinkPlausibleProps
}

const ServiceCard = ({
  title,
  description,
  buttonText,
  className,
  tags,
  tagStyle,
  icon,
  href,
  plausibleProps,
}: ServiceCardBase) => {
  const style = cn(
    'group relative flex w-full min-w-[280px] flex-col items-start gap-5 rounded-lg border-2 border-solid border-gray-200 bg-gray-0 p-4',
    className,
    { 'cursor-pointer': buttonText },
    { 'cursor-default': !buttonText },
  )

  return (
    <div className={style}>
      <div className="flex w-full justify-between">
        <div className="rounded-lg border-2 border-gray-200 p-1.5 lg:p-2.5">{icon}</div>
        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tagItem, index) => (
              <span key={index} className={cn('h-min rounded-[4px] px-2 text-p3-medium', tagStyle)}>
                {tagItem}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex w-full flex-col items-start gap-3 text-left">
        <h3
          className={cn('text-h5 leading-5 font-semibold lg:leading-7', {
            'group-hover:underline': buttonText,
          })}
        >
          {title}
        </h3>
        <div className="flex items-center text-p-sm font-normal">{description}</div>
      </div>
      <div className="flex size-full items-end">
        <div className="flex h-max w-full items-center justify-between">
          <ButtonNew
            href={href}
            variant="black-link"
            className="text-p2-semibold"
            stretched
            plausibleProps={plausibleProps}
          >
            {buttonText}
          </ButtonNew>
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
