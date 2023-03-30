import PaymentDeclined from '@assets/images/new-icons/other/payment-declined.svg'
import DisableIcon from '@assets/images/new-icons/ui/cross.svg'
import DoneIcon from '@assets/images/new-icons/ui/done.svg'
import RestartIcon from '@assets/images/new-icons/ui/repeat.svg'
import cx from 'classnames'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import Button from 'components/forms/simple-components/Button'
import Link from 'next/link'

type ThankYouCardBase = {
  status?: 'success' | 'error-1' | 'error-2' | 'error-3' | 'error-4'
  title?: string
  firstButtonTitle: string
  secondButtonTitle: string
  content?: string
}

const ThankYouCard = ({
  status,
  title,
  firstButtonTitle,
  secondButtonTitle,
  content,
}: ThankYouCardBase) => {
  return (
    <div className="max-w-[734px] lg:max-w-[800px] w-full h-full mx-auto bg-gray-0 px-4 md:px-14 pb-4 pt-6 md:py-12 flex flex-col items-center gap-4 md:gap-6 rounded-none md:rounded-2xl">
      <span
        className={cx(
          'min-w-14 md:min-w-[88px] w-14 md:w-[88px] h-14 md:h-[88px] bg-negative-100 flex justify-center items-center rounded-full',
          {
            'bg-negative-100': status?.includes('error'),
            'bg-success-100': status === 'success',
          },
        )}
      >
        {status !== 'success' ? (
          <PaymentDeclined className="w-8 md:w-10 h-8 md:h-10 flex justify-center items-center text-negative-700" />
        ) : (
          <DoneIcon className="w-8 md:w-10 h-8 md:h-10 flex justify-center items-center text-success-700" />
        )}
      </span>
      <div className="flex flex-col items-center gap-4 md:gap-3">
        <h2 className="text-h2 text-center">{title}</h2>
        <AccountMarkdown variant="sm" className="text-center" content={content} />
      </div>
      <div className="w-full flex flex-col sm:flex-row items-center gap-4 px-0 md:px-24">
        {status !== 'success' ? (
          <>
            <Button startIcon={<RestartIcon />} text={firstButtonTitle} fullWidth />
            <Button
              startIcon={<DisableIcon className="w-6 h-6" />}
              variant="black-outline"
              text={secondButtonTitle}
              fullWidth
            />
          </>
        ) : (
          <>
            <Button text={firstButtonTitle} fullWidth />
            <Link href="/" className="w-full">
              <Button variant="black-outline" text={secondButtonTitle} fullWidth />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default ThankYouCard
