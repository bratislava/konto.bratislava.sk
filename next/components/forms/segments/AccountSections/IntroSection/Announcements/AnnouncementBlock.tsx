import { ArrowRightIcon } from '@assets/ui-icons'
import cx from 'classnames'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Image from 'next/legacy/image'

import ButtonNew, { ButtonProps } from '../../../../simple-components/ButtonNew'

type AnnouncementBlockProps = {
  announcementContent?: string
  imagePath?: string
  buttons?: {
    title: string
    onPress: () => void
    variant?: ButtonProps['variant']
    arrowIcon?: boolean
  }[]
  buttonTitle?: string
  onPress?: () => void
  reversed?: boolean
}

const AnnouncementBlock = ({
  announcementContent,
  imagePath = '',
  reversed,
  buttons = [],
}: AnnouncementBlockProps) => {
  if (!announcementContent) {
    return null
  }

  return (
    <div
      className={cx(
        'flex w-full flex-col-reverse rounded-lg border-2 border-gray-200 lg:rounded-lg',
        {
          'lg:flex-row-reverse': reversed,
          'lg:flex-row': !reversed,
        },
      )}
    >
      <div className="flex w-full flex-col justify-center gap-4 p-4 lg:w-1/2 lg:gap-6 lg:p-12 lg:pr-14">
        <div className="flex flex-col gap-2">
          <AccountMarkdown content={announcementContent} variant="sm" />
        </div>
        {buttons.length > 0 && (
          <div className="flex flex-col gap-4 lg:flex-row">
            {buttons.map(({ title, onPress, variant, arrowIcon }, index) => (
              <ButtonNew
                key={index}
                endIcon={arrowIcon && <ArrowRightIcon className="size-5 lg:size-6" />}
                variant={variant}
                onPress={onPress}
              >
                {title}
              </ButtonNew>
            ))}
          </div>
        )}
      </div>
      <div className="relative flex h-[292px] w-full items-center justify-center rounded-t-lg lg:h-auto lg:w-1/2">
        <Image
          src={imagePath}
          className={cx('rounded-t-lg', {
            'lg:rounded-l-3xl lg:rounded-tr-none': reversed,
            'lg:rounded-r-3xl lg:rounded-tl-none': !reversed,
          })}
          layout="fill"
          priority
          objectFit="cover"
          objectPosition="center"
          alt=""
        />
      </div>
    </div>
  )
}

export default AnnouncementBlock
