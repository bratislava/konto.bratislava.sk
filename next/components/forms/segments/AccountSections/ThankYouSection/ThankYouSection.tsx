import ThankYouCard from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouCard'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useMemo } from 'react'

import logger from '../../../../../frontend/utils/logger'
import { useStrapiTax } from '../TaxesFeesSection/useStrapiTax'

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
  },
  [PaymentStatusOptions.FAILED]: {
    title: 'thank_you.result.payment_failed.title',
    content: 'thank_you.result.payment_failed.content',
  },
  [PaymentStatusOptions.SUCCESS]: {
    title: 'thank_you.result.payment_success.title',
    content: 'thank_you.result.payment_success.content',
  },
}

const ThankYouSection = () => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const { paymentSuccessFeedbackLink } = useStrapiTax()

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
    <div className="flex flex-col justify-between bg-gray-0 pt-16 md:bg-gray-50 md:pt-8">
      <div className="flex flex-col">
        {success ? (
          <ThankYouCard
            success={success}
            title={t(statusToTranslationPath[status].title)}
            content={`<span className='text-p2'>${t(statusToTranslationPath[status].content)}</span>`}
            firstButtonTitle={t('thank_you.button_to_formular_text')}
            secondButtonTitle={t('thank_you.button_to_profil_text')}
            feedbackLink={paymentSuccessFeedbackLink ?? undefined}
          />
        ) : (
          <ThankYouCard
            success={success}
            title={t(statusToTranslationPath[status].title)}
            content={`<span className='text-p2'>${t(statusToTranslationPath[status].content)}</span>`}
            firstButtonTitle={t('thank_you.button_restart_text')}
            secondButtonTitle={t('thank_you.button_cancel_text')}
          />
        )}
      </div>
    </div>
  )
}

export default ThankYouSection
