import { CheckIcon, CrossIcon } from '@assets/ui-icons'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import cn from 'frontend/cn'

import ButtonNew from '../../../simple-components/ButtonNew'

type ThankYouCardBase = {
  success?: boolean
  title?: string
  firstButtonTitle?: string
  secondButtonTitle?: string
  content?: string
  feedbackLink?: string | null
  feedbackTitle?: string
  firstButtonLink?: string
  secondButtonLink?: string
}

const ThankYouCard = ({
  success,
  title,
  firstButtonTitle,
  secondButtonTitle,
  content,
  feedbackLink,
  feedbackTitle,
  firstButtonLink,
  secondButtonLink,
}: ThankYouCardBase) => {
  return (
    <div className="mx-auto flex size-full max-w-[734px] flex-col items-center gap-4 rounded-none bg-gray-0 px-4 pt-6 pb-4 md:gap-8 md:rounded-2xl md:px-12 md:py-10 lg:max-w-[800px]">
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
          <CrossIcon className="flex size-8 items-center justify-center text-negative-700 md:size-10" />
        )}
      </span>
      <div className="flex flex-col items-center gap-8 md:gap-3">
        <h2 className="text-center text-h3">{title}</h2>
        <AccountMarkdown variant="sm" content={content} className="text-center" />
      </div>
      <div
        className={cn('flex w-full flex-col items-center gap-4', {
          'px-0 sm:flex-row': !feedbackTitle,
        })}
      >
        {success ? (
          <>
            {firstButtonTitle && feedbackLink ? (
              feedbackTitle ? (
                <div className="flex w-full flex-col gap-6 rounded-lg bg-gray-100 p-8">
                  <h3 className="text-left text-h3">{feedbackTitle}</h3>
                  <ButtonNew href={feedbackLink} variant="black-solid" fullWidth>
                    {firstButtonTitle}
                  </ButtonNew>
                </div>
              ) : (
                <ButtonNew href={feedbackLink} variant="black-solid" fullWidth>
                  {firstButtonTitle}
                </ButtonNew>
              )
            ) : null}
            {secondButtonTitle ? (
              <ButtonNew href={secondButtonLink} variant="black-outline" fullWidth>
                {secondButtonTitle}
              </ButtonNew>
            ) : null}
          </>
        ) : (
          <>
            {firstButtonTitle ? (
              <ButtonNew href={firstButtonLink} variant="black-solid" fullWidth>
                {firstButtonTitle}
              </ButtonNew>
            ) : null}
            {secondButtonTitle ? (
              <ButtonNew href={secondButtonLink} variant="black-outline" fullWidth>
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
