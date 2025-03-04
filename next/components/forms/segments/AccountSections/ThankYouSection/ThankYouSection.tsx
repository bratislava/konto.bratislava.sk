import BratislavaIcon from '@assets/images/bratislava-footer.svg'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import ThankYouCard from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouCard'
import Button from 'components/forms/simple-components/Button'
import { formsFeedbackLinks } from 'frontend/constants/constants'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useMemo } from 'react'

import logger from '../../../../../frontend/utils/logger'

export const PaymentStatusOptions = {
  FAILED_TO_VERIFY: 'failed-to-verify',
  ALREADY_PAID: 'payment-already-paid',
  FAILED: 'payment-failed',
  SUCCESS: 'payment-success',
}

const statusToTranslationPath = {
  [PaymentStatusOptions.FAILED_TO_VERIFY]: {
    title: 'thank_you.result.failed_to_verify.title',
    content: 'thank_you.result.failed_to_verify.content',
  },
  [PaymentStatusOptions.ALREADY_PAID]: {
    title: 'thank_you.result.payment_already_paid.title',
    content: 'thank_you.result.payment_already_paid.content',
    feedbackTitle: 'thank_you.result.payment_already_paid.feedback_title',
  },
  [PaymentStatusOptions.FAILED]: {
    title: 'thank_you.result.payment_failed.title',
    content: 'thank_you.result.payment_failed.content',
  },
  [PaymentStatusOptions.SUCCESS]: {
    title: 'thank_you.result.payment_success.title',
    content: 'thank_you.result.payment_success.content',
    feedbackTitle: 'thank_you.result.payment_success.feedback_title',
  },
}

const ThankYouSection = () => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const status = useMemo(
    () =>
      typeof router.query.status === 'string' &&
      Object.values(PaymentStatusOptions).includes(router.query.status)
        ? router.query.status
        : PaymentStatusOptions.FAILED_TO_VERIFY,
    [router.query.status],
  )
  const success =
    status === PaymentStatusOptions.SUCCESS || status === PaymentStatusOptions.ALREADY_PAID
  useEffect(() => {
    if (status === PaymentStatusOptions.FAILED_TO_VERIFY) {
      logger.error('Failed to verify payment', router.query)
    }
  }, [router.query, status])

  return (
    <div className="flex h-screen flex-col justify-between bg-gray-0 pt-16 md:bg-gray-50 md:pt-28">
      <div className="flex flex-col">
        {success ? (
          <ThankYouCard
            success={success}
            title={t(statusToTranslationPath[status].title)}
            content={`<span className='text-p2'>${t(statusToTranslationPath[status].content)}</span>`}
            firstButtonTitle={t('thank_you.button_to_formular_text')}
            secondButtonTitle={t('thank_you.button_to_profil_text')}
            feedbackTitle={t(statusToTranslationPath[status].feedbackTitle!)}
            feedbackUrl={formsFeedbackLinks['platba-dane-z-nehnutelnosti']}
          />
        ) : (
          <ThankYouCard
            success={success}
            title={t(statusToTranslationPath[status].title)}
            content={`<span className='text-p2'>${t(statusToTranslationPath[status].content)}`}
            firstButtonTitle={t('thank_you.button_restart_text')}
            secondButtonTitle={t('thank_you.button_cancel_text')}
          />
        )}
        <div className="mx-auto mt-0 w-full max-w-[734px] px-4 md:mt-10 md:px-0 lg:max-w-[800px]">
          <span className="text-p2 flex">
            <AccountMarkdown
              variant="sm"
              content={`<span className='text-p2'>${t(
                'thank_you.subtitle_mail_platbadane',
              )}</span>.`}
            />
          </span>
          <div className="mt-4 flex flex-col gap-3 md:mt-6">
            <Button
              label={t('thank_you.button_faq_text')}
              href="https://www.bratislava.sk/mesto-bratislava/dane-a-poplatky/dan-z-nehnutelnosti/digitalna-platba"
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
      </div>

      <div className="mx-auto hidden w-full max-w-(--breakpoint-lg) flex-col items-center gap-6 pb-6 lg:flex">
        <BratislavaIcon />
        <p className="text-p2">{t('thank_you.footer_text')}</p>
      </div>
    </div>
  )
}

export default ThankYouSection
