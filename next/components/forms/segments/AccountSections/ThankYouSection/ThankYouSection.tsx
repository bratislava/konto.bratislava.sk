import ThankYouCard from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouCard'
import { ROUTES } from 'frontend/api/constants'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useMemo } from 'react'

import logger from '../../../../../frontend/utils/logger'
import { useStrapiTax } from '../TaxesFees/useStrapiTax'

export const PaymentStatusOptions = {
  FAILED_TO_VERIFY: 'failed-to-verify',
  ALREADY_PAID: 'payment-already-paid',
  FAILED: 'payment-failed',
  SUCCESS: 'payment-success',
}

export enum PaymentTypeEnum {
  DZN = 'DzN',
}

const getTaxDetailLink = (year?: string, paymentType?: PaymentTypeEnum) => {
  if (year && paymentType === PaymentTypeEnum.DZN) {
    return ROUTES.TAXES_AND_FEES_YEAR(Number(year))
  }
  return ROUTES.TAXES_AND_FEES
}

const ThankYouSection = () => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const { paymentSuccessFeedbackLink } = useStrapiTax()

  const statusToTranslationPath = {
    [PaymentStatusOptions.FAILED_TO_VERIFY]: {
      title: t('thank_you.result.failed_to_verify.title'),
      content: t('thank_you.result.failed_to_verify.content'),
    },
    [PaymentStatusOptions.ALREADY_PAID]: {
      title: t('thank_you.result.payment_already_paid.title'),
      content: t('thank_you.result.payment_already_paid.content'),
    },
    [PaymentStatusOptions.FAILED]: {
      title: t('thank_you.result.payment_failed.title'),
      content: t('thank_you.result.payment_failed.content'),
    },
    [PaymentStatusOptions.SUCCESS]: {
      title: t('thank_you.result.payment_success.title'),
      content: t('thank_you.result.payment_success.content'),
    },
  }

  const status = useMemo(
    () =>
      typeof router.query.status === 'string' &&
      Object.values(PaymentStatusOptions).includes(router.query.status)
        ? router.query.status
        : PaymentStatusOptions.FAILED_TO_VERIFY,
    [router.query.status],
  )

  const paymentType = useMemo(
    () =>
      typeof router.query.paymentType === 'string' &&
      Object.values(PaymentTypeEnum).includes(router.query.paymentType as PaymentTypeEnum) // test how this behaves when string is not a valid PaymentTypeEnum
        ? (router.query.paymentType as PaymentTypeEnum)
        : undefined,
    [router.query.paymentType],
  )
  const year = useMemo(
    () => (typeof router.query.year === 'string' ? router.query.year : undefined),
    [router.query.year],
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
            title={statusToTranslationPath[status].title}
            content={`<span className='text-p2'>${statusToTranslationPath[status].content}</span>`}
            firstButtonTitle={t('thank_you.button_to_formular_text')}
            secondButtonTitle={t('thank_you.button_to_tax_detail_text')}
            secondButtonLink={getTaxDetailLink(year, paymentType)}
            feedbackLink={paymentSuccessFeedbackLink ?? undefined}
          />
        ) : (
          <ThankYouCard
            success={success}
            title={statusToTranslationPath[status].title}
            content={`<span className='text-p2'>${statusToTranslationPath[status].content}</span>`}
            firstButtonTitle={t('thank_you.button_restart_text')}
            firstButtonLink={getTaxDetailLink(year, paymentType)}
            secondButtonTitle={t('thank_you.button_cancel_text')}
          />
        )}
      </div>
    </div>
  )
}

export default ThankYouSection
