import PaymentDeclined from '@assets/icons/other/payment-declined.svg'
import { CheckIcon, CrossIcon, RepeatIcon } from '@assets/ui-icons'
import cx from 'classnames'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from 'components/forms/simple-components/Button'
import Link from 'next/link'

import { ROUTES } from '../../../../../frontend/api/constants'

type ThankYouCardBase = {
  success?: boolean
  title?: string
  firstButtonTitle: string
  secondButtonTitle: string
  content?: string
}

const ThankYouCard = ({
  success,
  title,
  firstButtonTitle,
  secondButtonTitle,
  content,
}: ThankYouCardBase) => {
  return (
    <div className="mx-auto flex h-full w-full max-w-[734px] flex-col items-center gap-4 rounded-none bg-gray-0 px-4 pb-4 pt-6 md:gap-6 md:rounded-2xl md:px-14 md:py-12 lg:max-w-[800px]">
      <span
        className={cx(
          'min-w-14 flex h-14 w-14 items-center justify-center rounded-full bg-negative-100 md:h-[88px] md:w-[88px] md:min-w-[88px]',
          {
            'bg-negative-100': !success,
            'bg-success-100': success,
          },
        )}
      >
        {success ? (
          <CheckIcon className="flex h-8 w-8 items-center justify-center text-success-700 md:h-10 md:w-10" />
        ) : (
          <PaymentDeclined className="flex h-8 w-8 items-center justify-center text-negative-700 md:h-10 md:w-10" />
        )}
      </span>
      <div className="flex flex-col items-center gap-4 md:gap-3">
        <h2 className="text-h2 text-center">{title}</h2>
        <AccountMarkdown variant="sm" className="text-center" content={content} />
      </div>
      <div className="flex w-full flex-col items-center gap-4 px-0 sm:flex-row md:px-24">
        {success ? (
          <>
            <a
              href="https://forms.office.com/Pages/ResponsePage.aspx?id=Tudp_mYey0-ZxVjkotKgYzPfQUHlnllIsPHBW0o8KeNUQlMzWEw1WEZIWEM2SThRNVBUREhWNFlISC4u"
              className="w-full"
              target="_blank"
              rel="noreferrer"
            >
              <Button text={firstButtonTitle} fullWidth />
            </a>
            <Link href="/" className="w-full">
              <Button variant="black-outline" text={secondButtonTitle} fullWidth />
            </Link>
          </>
        ) : (
          <>
            <Link href={`${ROUTES.TAXES_AND_FEES}/2023`} className="w-full">
              <Button startIcon={<RepeatIcon />} text={firstButtonTitle} fullWidth />
            </Link>
            <Link href="/" className="w-full">
              <Button
                startIcon={<CrossIcon className="h-6 w-6" />}
                variant="black-outline"
                text={secondButtonTitle}
                fullWidth
              />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default ThankYouCard
