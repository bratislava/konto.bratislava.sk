import BratislavaIcon from '@assets/images/bratislava-footer.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import ThankYouCard from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouCard'
import Button from 'components/forms/simple-components/Button'
import { formsFeedbackLinks } from 'frontend/constants/constants'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../../frontend/api/constants'
import { useFormContext } from '../../../useFormContext'
import cn from '../../../../../frontend/cn'

const useThankYouFormSection = () => {
  const {
    isTaxForm,
    formDefinition: { slug },
    isEmbedded,
  } = useFormContext()
  const { t } = useTranslation('account')
  const feedbackUrl = formsFeedbackLinks[slug]

  if (isTaxForm) {
    return {
      title: t('thank_you.form_submit_tax.title'),
      firstButtonTitle: t('thank_you.button_to_formular_text_2'),
      secondButtonTitle: t('thank_you.button_to_profil_text'),
      content: t('thank_you.form_submit_tax.content'),
      feedbackUrl,
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
    secondButtonTitle: t('thank_you.button_to_profil_text'),
    content: t('thank_you.form_submit.content'),
    feedbackUrl,
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
    feedbackUrl,
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
          feedbackUrl={feedbackUrl}
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
              <Button
                label={t('thank_you.button_faq_text')}
                href={ROUTES.HELP}
                variant="link-black"
                size="sm"
              />
              <Button
                label={t('thank_you.button_privacy_text')}
                href="https://bratislava.sk/ochrana-osobnych-udajov"
                variant="link-black"
                size="sm"
              />
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
