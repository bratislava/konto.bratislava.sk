import { ImageProps } from 'next/image'
import Image from 'next/legacy/image'

import { PhoneIcon } from '@/src/assets/ui-icons'
import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import { Button } from '@bratislava/component-library'
import cn from '@/src/utils/cn'

type BannerBase = {
  title: string
  buttonText?: string
  mobileNumber?: string
  content?: string
  href?: string
  onPress?: () => void
  className?: string
  image: ImageProps['src']
}

const Banner = ({
  title,
  content,
  buttonText = 'Button',
  mobileNumber = '',
  href,
  image,
  onPress,
  className,
}: BannerBase) => {
  return (
    <div
      className={cn(
        'm-auto flex h-full w-full flex-col items-center justify-end rounded-2xl bg-gray-800 py-6 lg:flex-row lg:py-0',
        className,
      )}
    >
      <div className="mb-6 flex size-full max-w-[488px] flex-col justify-center gap-6 rounded-l-3xl px-4 text-white md:px-0 lg:mb-0 lg:w-1/2">
        <div className="flex flex-col items-start gap-3">
          <h2 className="text-h1 lg:text-h2">{title}</h2>
          <AccountMarkdown content={content} variant="sm" className="text-p2 text-gray-200" />
        </div>
        <div className="flex flex-col gap-4 lg:flex-row">
          <Button href={href} variant="solid-inverted" onPress={onPress} fullWidthMobile>
            {buttonText}
          </Button>
          {mobileNumber && (
            <div className="flex items-center gap-2 px-3 py-2 text-gray-0">
              <PhoneIcon />
              <span className="text-p2-semibold">{mobileNumber}</span>
            </div>
          )}
        </div>
      </div>
      <div className="my-auto flex w-full sm:w-1/2">
        <Image src={image} alt="" />
      </div>
    </div>
  )
}

export default Banner
