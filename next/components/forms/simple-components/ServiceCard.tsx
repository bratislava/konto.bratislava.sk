import ArrowRightIcon from '@assets/images/new-icons/ui/arrow-right.svg'
import ExportIcon from '@assets/images/new-icons/ui/export.svg'
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
  linkType = 'external',
  tag,
  tagStyle,
  icon,
  href,
  onPress,
}: ServiceCardBase) => {
  const style = cx(
    'group min-w-[280px] max-w-[280px] bg-gray-0 border-gray-200 flex flex-col items-start p-4 gap-5 border-solid border-2 rounded-lg',
    className,
    { 'cursor-pointer': buttonText },
    { 'cursor-default': !buttonText },
  )

  const Card = () => (
    <>
      <div className="w-full flex justify-between">
        <div className="p-1.5 lg:p-2.5 rounded-lg border-2 border-gray-200">{icon}</div>
        <span className={cx('text-p3-medium h-min px-2 rounded-[4px]', tagStyle)}>{tag}</span>
      </div>
      <div className="gap-3 flex flex-col items-start text-left w-full">
        <h5
          className={cx('text-h5 leading-5 lg:leading-7 font-semibold', {
            'group-hover:underline': buttonText,
          })}
        >
          {title}
        </h5>
        <div className="text-p-sm flex items-center font-normal">{description}</div>
      </div>
      {buttonText && (
        <div className="flex items-end w-full h-full">
          <div className="flex justify-between items-center h-max w-full">
            <div className="text-p2-semibold">{buttonText}</div>
            <span className="w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center bg-gray-50">
              {href?.includes('http') ? (
                <ExportIcon className="w-5 h-5" />
              ) : (
                <ArrowRightIcon className="w-5 h-5" />
              )}
            </span>
          </div>
        </div>
      )}
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
