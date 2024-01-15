import { ChevronRightIcon } from '@assets/ui-icons'
import cx from 'classnames'
import React, { FC } from 'react'

import ButtonNew from '../simple-components/ButtonNew'

export type TaxFormLandingPageCardProps = {
  title: string
  description: string
  isEid: boolean
  href?: string
  onPress?: () => void
  disabled?: boolean
  icon: FC<{ className?: string }>
}

const TaxFormLandingPageCard = ({
  title,
  description,
  isEid,
  href,
  onPress,
  disabled,
  icon: IconComponent,
}: TaxFormLandingPageCardProps) => {
  return (
    // TODO stretched doesn't work for buttons, very temporary solution
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div
      className={cx('relative flex gap-5 border-b-2 border-gray-200 px-5 py-6 last:border-b-0', {
        'cursor-pointer': !disabled && onPress,
      })}
      onClick={disabled ? () => {} : onPress}
    >
      <div className="hidden items-center justify-center md:flex">
        <div className="flex h-18 w-18 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-gray-300">
          <IconComponent className="h-12 w-12" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-3">
          <ButtonNew
            variant="unstyled"
            className="text-h6 text-left"
            stretched={!onPress}
            href={href}
            target={href ? '_blank' : undefined}
            onPress={onPress}
            isDisabled={disabled}
          >
            {title}
          </ButtonNew>
          <div
            className={cx('text-p3 rounded px-2 text-center font-semibold', {
              'bg-success-100 text-success-700': !isEid,
              'bg-gray-100 text-gray-700': isEid,
            })}
          >
            {isEid ? 'Musíte mať eID' : 'Nemusíte mať eID'}
          </div>
        </div>
        <span className="text-p3">{description}</span>
      </div>
      <div className="flex items-center justify-center">
        <ChevronRightIcon className="h-6 w-6" />
      </div>
    </div>
  )
}

export default TaxFormLandingPageCard
