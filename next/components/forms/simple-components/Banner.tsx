import { PhoneIcon } from '@assets/ui-icons'
import cx from 'classnames'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Image from 'next/legacy/image'

import Button from './Button'

type BannerBase = {
  title: string
  buttonText?: string
  mobileNumber?: string
  content?: string
  href?: string
  onPress?: () => void
  className?: string
  image: string
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (
    <div
      className={cx(
        'm-auto flex h-full w-full max-w-screen-lg flex-col items-center justify-end rounded-none bg-gray-800 py-6 lg:flex-row lg:rounded-3xl lg:py-0',
        className,
      )}
    >
      <div className="mb-6 flex h-full w-full max-w-[488px] flex-col justify-center gap-6 rounded-l-3xl px-4 text-white md:px-0 lg:mb-0 lg:w-1/2">
        <div className="flex flex-col items-start gap-3">
          <h2 className="text-h1 lg:text-h2">{title}</h2>
          <AccountMarkdown content={content} variant="sm" className="text-p2 text-gray-200" />
        </div>
        <div className="flex flex-col items-center gap-4 lg:flex-row">
          <Button
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            href={href}
            className="hidden rounded-lg no-underline lg:flex"
            variant="category"
            text={buttonText}
            label={buttonText}
            hrefIconHidden
            hrefLabelCenter
            onPress={onPress}
          />
          <Button
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            href={href}
            className="flex rounded-lg no-underline lg:hidden"
            size="sm"
            variant="category"
            text={buttonText}
            label={buttonText}
            hrefIconHidden
            hrefLabelCenter
            fullWidth
            onPress={onPress}
          />
          {mobileNumber && (
            <div className="flex items-center gap-2 px-3 py-2 text-gray-0">
              <PhoneIcon />
              <span className="text-p2-semibold">{mobileNumber}</span>
            </div>
          )}
        </div>
      </div>
      <div className="my-auto flex w-full sm:w-1/2">
        <Image src={image} />
      </div>
    </div>
  )
}

export default Banner
