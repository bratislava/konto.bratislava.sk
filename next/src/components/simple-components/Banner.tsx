import { Button, Typography } from '@bratislava/component-library'
import Image, { ImageProps } from 'next/image'

import { PhoneIcon } from '@/src/assets/ui-icons'
import Markdown from '@/src/components/formatting/Markdown'
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
        'm-auto flex size-full flex-col items-center justify-end rounded-2xl bg-gray-800 py-6 lg:flex-row lg:py-0',
        className,
      )}
    >
      <div className="mb-6 flex size-full max-w-[488px] flex-col justify-center gap-6 rounded-l-3xl px-4 text-content-passive-inverted-primary md:px-0 lg:mb-0 lg:w-1/2">
        <div className="flex flex-col items-start gap-3">
          <Typography variant="h2">{title}</Typography>
          <Markdown
            variant="small"
            content={content}
            className="text-content-passive-inverted-secondary"
          />
        </div>
        <div className="flex flex-col gap-4 lg:flex-row">
          <Button href={href} variant="solid-inverted" onPress={onPress} fullWidthMobile>
            {buttonText}
          </Button>
          {mobileNumber && (
            <div className="flex items-center gap-2 px-3 py-2 text-gray-0">
              <PhoneIcon />
              <Typography variant="p-small" className="font-semibold">
                {mobileNumber}
              </Typography>
            </div>
          )}
        </div>
      </div>
      <div className="my-auto flex w-full sm:w-1/2">
        <Image src={image} alt="" className="h-auto w-full" />
      </div>
    </div>
  )
}

export default Banner
