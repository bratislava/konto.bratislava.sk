import PaymentDeclined from '@assets/icons/other/payment-declined.svg'
import { CheckIcon, CrossIcon, RepeatIcon } from '@assets/ui-icons'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import cn from 'frontend/cn'

import { ROUTES } from '../../../../../frontend/api/constants'
import ButtonNew from '../../../simple-components/ButtonNew'

type ThankYouCardBase = {
  success?: boolean
  title?: string
  firstButtonTitle?: string
  secondButtonTitle?: string
  content?: string
  feedbackUrl?: string
  feedbackTitle?: string
}

const ThankYouCard = ({
  success,
  title,
  firstButtonTitle,
  secondButtonTitle,
  content,
  feedbackUrl,
  feedbackTitle,
}: ThankYouCardBase) => {
  return (
    <div className="mx-auto flex size-full max-w-[734px] flex-col items-center gap-4 rounded-none bg-gray-0 px-4 pt-6 pb-4 md:gap-6 md:rounded-2xl md:px-14 md:py-12 lg:max-w-[800px]">
      <span
        className={cn(
          'flex h-14 w-14 min-w-14 items-center justify-center rounded-full bg-negative-100 md:h-[88px] md:w-[88px] md:min-w-[88px]',
          {
            'bg-negative-100': !success,
            'bg-success-100': success,
          },
        )}
      >
        {success ? (
          <CheckIcon className="flex size-8 items-center justify-center text-success-700 md:size-10" />
        ) : (
          <PaymentDeclined className="flex size-8 items-center justify-center text-negative-700 md:size-10" />
        )}
      </span>
      <div className="flex flex-col items-center gap-8 md:gap-6">
        <h2 className="text-center text-h2">{title}</h2>
        <AccountMarkdown variant="sm" content={content} />
      </div>
      <div
        className={cn('flex w-full flex-col items-center gap-4', {
          'px-0 sm:flex-row md:px-24': !feedbackTitle,
        })}
      >
        {success ? (
          <>
            {firstButtonTitle && feedbackUrl ? (
              feedbackTitle ? (
                <div className="flex w-full flex-col gap-6 rounded-lg bg-gray-100 p-8">
                  <h3 className="text-left text-h3">{feedbackTitle}</h3>
                  <ButtonNew href={feedbackUrl} variant="black-solid" fullWidth>
                    {firstButtonTitle}
                  </ButtonNew>
                </div>
              ) : (
                <ButtonNew href={feedbackUrl} variant="black-solid" fullWidth>
                  {firstButtonTitle}
                </ButtonNew>
              )
            ) : null}
            {secondButtonTitle ? (
              <ButtonNew href={ROUTES.HOME} variant="black-outline" fullWidth>
                {secondButtonTitle}
              </ButtonNew>
            ) : null}
          </>
        ) : (
          <>
            {firstButtonTitle ? (
              <ButtonNew
                // TODO: Right now it is not possible to determine the year that it is being paid for.
                href={ROUTES.TAXES_AND_FEES_YEAR(new Date().getFullYear())}
                variant="black-solid"
                fullWidth
                startIcon={<RepeatIcon />}
              >
                {firstButtonTitle}
              </ButtonNew>
            ) : null}
            {secondButtonTitle ? (
              <ButtonNew
                href={ROUTES.HOME}
                variant="black-outline"
                fullWidth
                startIcon={<CrossIcon className="size-6" />}
              >
                {secondButtonTitle}
              </ButtonNew>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default ThankYouCard
