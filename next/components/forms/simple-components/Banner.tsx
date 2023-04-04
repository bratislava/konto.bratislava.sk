import BannerPhone from '@assets/images/banner-phone.png'
import CallIcon from '@assets/images/new-icons/ui/telephone.svg'
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
}

const Banner = ({
  title,
  content,
  buttonText = 'Button',
  mobileNumber = '',
  href,
  onPress,
  className,
}: BannerBase) => {
  return (
    <div
      className={cx(
        'flex-col lg:flex-row flex h-full items-center justify-end rounded-none lg:rounded-3xl bg-gray-800 w-full max-w-screen-lg m-auto py-6 lg:py-0',
        className,
      )}
    >
      <div className="lg:w-1/2 w-full max-w-[488px] text-white h-full flex flex-col justify-center rounded-l-3xl gap-6 px-4 md:px-0 mb-6 lg:mb-0">
        <div className="flex flex-col items-start gap-3">
          <h2 className="text-h1 lg:text-h2">{title}</h2>
          <AccountMarkdown content={content} variant="sm" className="text-p2 text-gray-200" />
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <Button
            className="no-underline hidden lg:flex rounded-lg"
            variant="category"
            text={buttonText}
            label={buttonText}
            href={href}
            hrefIconHidden
            hrefLabelCenter
            onPress={onPress}
          />
          <Button
            className="no-underline flex lg:hidden rounded-lg"
            size="sm"
            variant="category"
            text={buttonText}
            label={buttonText}
            href={href}
            hrefIconHidden
            hrefLabelCenter
            fullWidth
            onPress={onPress}
          />
          {mobileNumber && (
            <div className="text-gray-0 flex items-center gap-2 px-3 py-2">
              <CallIcon />
              <span className="text-p2-semibold">{mobileNumber}</span>
            </div>
          )}
        </div>
      </div>
      <div className="my-auto sm:w-1/2 w-full">
        <Image src={BannerPhone} />
      </div>
    </div>
  )
}

export default Banner
