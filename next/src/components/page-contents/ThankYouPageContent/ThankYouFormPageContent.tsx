import { useTranslation } from 'next-i18next'

import AccountMarkdown from '@/src/components/formatting/AccountMarkdown'
import { useFormContext } from '@/src/components/forms/useFormContext'
import ThankYouCard from '@/src/components/page-contents/ThankYouPageContent/ThankYouCard'
import Button from '@/src/components/simple-components/Button'
import { ROUTES } from '@/src/frontend/api/constants'
import cn from '@/src/frontend/cn'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'

const useThankYouFormPageContent = () => {
  const {
    isTaxForm,
    formDefinition: { feedbackLink },
    isEmbedded,
  } = useFormContext()
  const { t } = useTranslation('account')
  const { isSignedIn } = useSsrAuth()

  if (isTaxForm) {
    return {
      title: t('thank_you.form_submit_tax.title'),
      firstButtonTitle: t('thank_you.button_to_formular_text_2'),
      secondButtonTitle: t('thank_you.button_to_profile_text'),
      content: t('thank_you.form_submit_tax.content'),
      feedbackLink,
      feedbackTitle: t('thank_you.form_submit_tax.feedbackTitle'),
      largePadding: true,
      displayAccountLinks: true,
    }
  }

  if (isEmbedded) {
    return {
      title: t('thank_you.form_submit.title'),
      content: t('thank_you.form_submit.content_embedded'),
      largePadding: false,
      displayAccountLinks: false,
    }
  }

  return {
    title: t('thank_you.form_submit.title'),
    firstButtonTitle: t('thank_you.button_to_formular_text_2'),
    secondButtonTitle: t('thank_you.button_to_profile_text'),
    content: [
      t('thank_you.form_submit.content_generic'),
      isSignedIn ? ` ${t('thank_you.form_submit.content_signed_in')}` : '',
      feedbackLink ? `\n\n${t('thank_you.form_submit.content_feedback')}` : '',
    ].join(''),
    feedbackLink,
    largePadding: true,
    displayAccountLinks: true,
  }
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=21637-5313&t=9VxOW0GxS2SEYDIL-4
 */

const ThankYouFormPageContent = () => {
  const {
    title,
    firstButtonTitle,
    secondButtonTitle,
    content,
    feedbackLink,
    feedbackTitle,
    largePadding,
    displayAccountLinks,
  } = useThankYouFormPageContent()
  const { t } = useTranslation('account')

  return (
    <div
      className={cn('flex flex-col justify-between', {
        'py-6 md:py-16': !largePadding,
        'py-16 md:py-28': largePadding,
      })}
    >
      <div className="flex flex-col">
        <ThankYouCard
          success
          title={title}
          firstButtonTitle={firstButtonTitle}
          secondButtonTitle={secondButtonTitle}
          content={content}
          firstButtonLink={feedbackLink}
          feedbackTitle={feedbackTitle}
        />
        {displayAccountLinks ? (
          <div className="mx-auto mt-0 w-full max-w-[734px] px-4 md:mt-10 md:px-0 lg:max-w-[800px]">
            <span className="flex text-p2">
              <AccountMarkdown
                variant="sm"
                content={`<span className='text-p2'>${t('thank_you.subtitle_mail_info')}</span>.`}
              />
            </span>
            <div className="mt-4 flex flex-col gap-3 md:mt-6">
              <Button variant="link" href={ROUTES.HELP}>
                {t('thank_you.button_faq_text')}
              </Button>
              <Button variant="link" href="https://bratislava.sk/ochrana-osobnych-udajov">
                {t('thank_you.button_privacy_text')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ThankYouFormPageContent
