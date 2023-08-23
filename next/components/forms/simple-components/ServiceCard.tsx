import { ArrowRightIcon, ExportIcon } from '@assets/ui-icons'
import cx from 'classnames'
import Link from 'next/link'
import { ReactNode } from 'react'

type ServiceCardBase = {
  title: string
  description: string
  buttonText?: string
  className?: string
  linkType?: 'internal' | 'external'
  icon: ReactNode
  href?: string
  tag?: string
  tagStyle?: string
  onPress?: () => void
}

const ServiceCard = ({
  title,
  description,
  buttonText,
  className,
  tag,
  tagStyle,
  icon,
  href,
  onPress,
}: ServiceCardBase) => {
  const style = cx(
    'group flex w-full min-w-[280px] flex-col items-start gap-5 rounded-lg border-2 border-solid border-gray-200 bg-gray-0 p-4',
    className,
    { 'cursor-pointer': buttonText },
    { 'cursor-default': !buttonText },
  )

  const Card = () => (
    <>
      <div className="flex w-full justify-between">
        <div className="rounded-lg border-2 border-gray-200 p-1.5 lg:p-2.5">{icon}</div>
        <span className={cx('text-p3-medium h-min rounded-[4px] px-2', tagStyle)}>{tag}</span>
      </div>
      <div className="flex w-full flex-col items-start gap-3 text-left">
        <h5
          className={cx('text-h5 font-semibold leading-5 lg:leading-7', {
            'group-hover:underline': buttonText,
          })}
        >
          {title}
        </h5>
        <div className="flex items-center text-p-sm font-normal">{description}</div>
      </div>
      <div className="flex h-full w-full items-end">
        <div className="flex h-max w-full items-center justify-between">
          <div className="text-p2-semibold">{buttonText}</div>
          {buttonText && (
            <span className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-full bg-gray-50">
              {href?.includes('http') ? (
                <ExportIcon className="h-5 w-5" />
              ) : (
                <ArrowRightIcon className="h-5 w-5" />
              )}
            </span>
          )}
        </div>
      </div>
    </>
  )

  return href ? (
    <Link target={href?.includes('http') ? '_blank' : '_self'} href={href} className={style}>
      <Card />
    </Link>
  ) : (
    <button type="button" onClick={onPress} className={style}>
      <Card />
    </button>
  )
}

export default ServiceCard
