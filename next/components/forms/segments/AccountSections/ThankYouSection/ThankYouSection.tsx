import ThankYouCard from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouCard'
import { ROUTES } from 'frontend/api/constants'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { PaymentRedirectStateEnum, TaxType } from 'openapi-clients/tax'
import { useEffect, useMemo } from 'react'

import logger from '../../../../../frontend/utils/logger'
import { useStrapiTax } from '../TaxesFees/useStrapiTax'

const getTaxDetailLink = (year?: string, taxType?: TaxType) => {
  if (year && taxType === TaxType.Dzn) {
    return ROUTES.TAXES_AND_FEES_YEAR(Number(year))
  }
  return ROUTES.TAXES_AND_FEES
}

const ThankYouSection = () => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const { paymentSuccessFeedbackLink } = useStrapiTax()

  const statusToTranslationPath = {
    [PaymentRedirectStateEnum.FailedToVerify]: {
      title: t('thank_you.result.failed_to_verify.title'),
      content: t('thank_you.result.failed_to_verify.content'),
    },
    [PaymentRedirectStateEnum.PaymentAlreadyPaid]: {
      title: t('thank_you.result.payment_already_paid.title'),
      content: t('thank_you.result.payment_already_paid.content'),
    },
    [PaymentRedirectStateEnum.PaymentFailed]: {
      title: t('thank_you.result.payment_failed.title'),
      content: t('thank_you.result.payment_failed.content'),
    },
    [PaymentRedirectStateEnum.PaymentSuccess]: {
      title: t('thank_you.result.payment_success.title'),
      content: t('thank_you.result.payment_success.content'),
    },
  }

  const status = useMemo(() => {
    if (
      typeof router.query.status === 'string' &&
      Object.values(PaymentRedirectStateEnum).includes(router.query.status as PaymentRedirectStateEnum)
    ) {
      return router.query.status as PaymentRedirectStateEnum
    }
    return PaymentRedirectStateEnum.FailedToVerify
  }, [router.query.status])

  const taxType = useMemo(
    () =>
      typeof router.query.taxType === 'string' &&
      Object.values(TaxType).includes(router.query.taxType as TaxType) // test how this behaves when string is not a valid TaxType
        ? (router.query.taxType as TaxType)
        : undefined,
    [router.query.taxType],
  )
  const year = useMemo(
    () => (typeof router.query.year === 'string' ? router.query.year : undefined),
    [router.query.year],
  )
  const success =
    status === PaymentRedirectStateEnum.PaymentSuccess || status === PaymentRedirectStateEnum.PaymentAlreadyPaid
  useEffect(() => {
    if (status === PaymentRedirectStateEnum.FailedToVerify) {
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
            secondButtonLink={getTaxDetailLink(year, taxType)}
            feedbackLink={paymentSuccessFeedbackLink ?? undefined}
          />
        ) : (
          <ThankYouCard
            success={success}
            title={statusToTranslationPath[status].title}
            content={`<span className='text-p2'>${statusToTranslationPath[status].content}</span>`}
            firstButtonTitle={t('thank_you.button_restart_text')}
            firstButtonLink={getTaxDetailLink(year, taxType)}
            secondButtonTitle={t('thank_you.button_cancel_text')}
          />
        )}
      </div>
    </div>
  )
}

export default ThankYouSection
