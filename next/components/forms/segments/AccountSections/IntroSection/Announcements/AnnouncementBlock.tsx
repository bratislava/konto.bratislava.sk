import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Image from 'next/image'
import { ComponentProps } from 'react'

import cn from '../../../../../../frontend/cn'
import ButtonNew, { AnchorProps, ButtonProps } from '../../../../simple-components/ButtonNew'

type AnnouncementBlockProps = {
  announcementContent?: string
  imageSrc?: ComponentProps<typeof Image>['src']
  buttons?: (ButtonProps | AnchorProps)[]
  onPress?: () => void
  reversed?: boolean
  reversedMobile?: boolean
}

// in figma mobile verion is requested using design system and desktop is custom konto design system,
// figma should be updated to implement design system for mobile and desktop, until then custom implementation is used

const AnnouncementBlock = ({
  announcementContent,
  imageSrc,
  reversed,
  reversedMobile,
  buttons = [],
}: AnnouncementBlockProps) => {
  if (!announcementContent) {
    return null
  }

  return (
    <div
      className={cn('flex w-full rounded-lg border-2 border-gray-200', {
        'flex-col': !reversedMobile,
        'flex-col-reverse': reversedMobile,
        'lg:flex-row-reverse': reversed,
        'lg:flex-row': !reversed,
      })}
    >
      <div className="flex w-full flex-col justify-center gap-4 p-4 lg:w-1/2 lg:gap-6 lg:p-12 lg:pr-14">
        <div className="flex flex-col gap-2">
          <AccountMarkdown content={announcementContent} variant="sm" />
        </div>
        {buttons.length > 0 && (
          <div className="flex flex-col gap-4 lg:flex-row">
            {buttons.map((props, index) => (
              <ButtonNew key={index} {...props} />
            ))}
          </div>
        )}
      </div>
      {imageSrc ? (
        <div className="relative flex h-[292px] w-full items-center justify-center rounded-t-lg lg:h-auto lg:w-1/2">
          <Image
            src={imageSrc}
            className={cn('rounded-t-lg object-cover object-center', {
              'lg:rounded-l-3xl lg:rounded-tr-none': reversed,
              'lg:rounded-tl-none lg:rounded-r-3xl': !reversed,
            })}
            fill
            priority
            // Decorative image
            alt=""
          />
        </div>
      ) : null}
    </div>
  )
}

export default AnnouncementBlock
