import ArrowRightIcon from '@assets/images/new-icons/ui/arrow-right.svg'
import ExportIcon from '@assets/images/new-icons/ui/export.svg'
import cx from 'classnames'
import Link from 'next/link'
import { ReactNode } from 'react'

type ServiceCardBase = {
  title: string
  description: string
  buttonText: string
  className?: string
  icon: ReactNode
  href?: string
  onPress?: () => void
}

const ServiceCard = ({
  title,
  description,
  buttonText,
  className,
  icon,
  href,
  onPress,
}: ServiceCardBase) => {
  const style = cx(
    'group max-w-[384px] w-full min-w-[280px] sm:max-w-[280px] bg-gray-0 border-gray-200 flex flex-col items-start p-4 gap-5 border-solid border-2 rounded-lg cursor-pointer',
    className,
  )

  const Card = () => (
    <>
      <div className="p-1.5 lg:p-2.5 rounded-lg border-2 border-gray-200">{icon}</div>
      <div className="gap-3 flex flex-col items-start text-left w-full">
        <h5 className="text-h5 leading-5 lg:leading-7 group-hover:underline font-semibold">
          {title}
        </h5>
        <div className="text-p-sm flex items-center font-normal">{description}</div>
      </div>
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
