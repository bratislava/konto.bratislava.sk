import { useTranslation } from 'next-i18next'

import BratislavaIcon from '@/assets/images/bratislava-footer.svg'
import AccountMarkdown from '@/components/forms/segments/AccountMarkdown/AccountMarkdown'
import ThankYouCard from '@/components/forms/segments/AccountSections/ThankYouSection/ThankYouCard'
import Button from '@/components/forms/simple-components/Button'
import { useFormContext } from '@/components/forms/useFormContext'
import { ROUTES } from '@/frontend/api/constants'
import cn from '@/frontend/cn'
import { useSsrAuth } from '@/frontend/hooks/useSsrAuth'

const useThankYouFormSection = () => {
  const {
    isTaxForm,
    formDefinition: { feedbackLink },
    isEmbedded,
  } = useFormContext()
  const { isSignedIn } = useSsrAuth()
  const { t } = useTranslation('account')

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

const ThankYouFormSection = () => {
  const {
    title,
    firstButtonTitle,
    secondButtonTitle,
    content,
    feedbackLink,
    feedbackTitle,
    largePadding,
    displayAccountLinks,
  } = useThankYouFormSection()
  const { t } = useTranslation('account')

  return (
    <div
      className={cn(
        'flex flex-col justify-between bg-gray-0 pt-16 md:bg-gray-50 md:pt-28',
        largePadding ? 'pt-16 md:pt-28' : 'pt-6 md:pt-16',
      )}
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

      <div
        className={cn(
          'mx-auto hidden w-full max-w-(--breakpoint-lg) flex-col items-center gap-6 pb-6 lg:flex',
          {
            'mt-10': !displayAccountLinks,
          },
        )}
      >
        <BratislavaIcon />
        <p className="text-p2">
          {t('thank_you.footer_text', { currentYear: new Date().getFullYear() })}
        </p>
      </div>
    </div>
  )
}

export default ThankYouFormSection
