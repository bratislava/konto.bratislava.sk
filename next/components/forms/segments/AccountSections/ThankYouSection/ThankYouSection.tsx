import ThankYouCard from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouCard'
import { ROUTES } from 'frontend/api/constants'
import { NextRouter, useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { PaymentRedirectStateEnum, TaxType } from 'openapi-clients/tax'
import { useEffect, useMemo } from 'react'

import logger from '../../../../../frontend/utils/logger'
import { useStrapiTax } from '../TaxesFees/useStrapiTax'

// TODO use the nuqs library to get query params
// example: https://github.com/bratislava/bratislava.sk/blob/master/next/src/components/sections/ArticlesSection/ArticlesAll/useArticlesFilters.tsx
const useGetPaymentQueryParams = (router: NextRouter) => {
  // query params are passed from nest-tax-backend/src/payment/payment.service.ts
  // we expect status, taxType, order, year

  const status = useMemo(
    () =>
      typeof router.query.status === 'string' &&
      Object.values(PaymentRedirectStateEnum).includes(
        router.query.status as PaymentRedirectStateEnum,
      )
        ? (router.query.status as PaymentRedirectStateEnum)
        : PaymentRedirectStateEnum.FailedToVerify,
    [router.query.status],
  )

  const type = useMemo(
    () =>
      typeof router.query.taxType === 'string' &&
      Object.values(TaxType).includes(router.query.taxType as TaxType)
        ? (router.query.taxType as TaxType)
        : undefined,
    [router.query.taxType],
  )

  const order = useMemo(
    () =>
      typeof router.query.order === 'string' && !Number.isNaN(Number(router.query.order))
        ? Number(router.query.order)
        : undefined,
    [router.query.order],
  )

  const year = useMemo(
    () =>
      typeof router.query.year === 'string' && !Number.isNaN(Number(router.query.year))
        ? Number(router.query.year)
        : undefined,
    [router.query.year],
  )

  return { status, type, order, year }
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20618-3635&t=29s2lbVQdpQg3sQU-4
 */

const ThankYouSection = () => {
  const { t } = useTranslation('account')

  const { paymentSuccessFeedbackLink } = useStrapiTax()

  const router = useRouter()
  const { status, type, year, order } = useGetPaymentQueryParams(router)

  useEffect(() => {
    if (status === PaymentRedirectStateEnum.FailedToVerify) {
      logger.error('Failed to verify payment', router.query)
    }
  }, [router.query, status])

  const statusToTranslationPath = {
    [PaymentRedirectStateEnum.FailedToVerify]: {
      title: t('thank_you.result.failed_to_verify.title'),
      content: t('thank_you.result.failed_to_verify.content'),
    },
    [PaymentRedirectStateEnum.PaymentFailed]: {
      title: t('thank_you.result.payment_failed.title'),
      content: t('thank_you.result.payment_failed.content'),
    },
    [PaymentRedirectStateEnum.PaymentAlreadyPaid]: {
      title: t('thank_you.result.payment_already_paid.title'),
      content: t('thank_you.result.payment_already_paid.content'),
    },
    [PaymentRedirectStateEnum.PaymentSuccess]: {
      title: t('thank_you.result.payment_success.title'),
      content: t('thank_you.result.payment_success.content'),
    },
  }

  const isSuccessfullyPaid =
    status === PaymentRedirectStateEnum.PaymentSuccess ||
    status === PaymentRedirectStateEnum.PaymentAlreadyPaid

  const taxDetailLink = useMemo(
    () =>
      year && type && order
        ? ROUTES.TAXES_AND_FEES_DETAIL({ year, type, order })
        : ROUTES.TAXES_AND_FEES,
    [year, type, order],
  )

  // TODO get this link from strapi
  const feedbackLink = useMemo(
    () =>
      type === TaxType.Dzn && paymentSuccessFeedbackLink
        ? paymentSuccessFeedbackLink
        : type === TaxType.Ko
          ? 'https://bravo.staffino.com/bratislava/id=WWKwRgu2'
          : undefined,
    [type, paymentSuccessFeedbackLink],
  )

  return (
    <div className="bg-gray-0 pt-16 lg:bg-gray-50 lg:pt-8">
      {isSuccessfullyPaid ? (
        <ThankYouCard
          success={isSuccessfullyPaid}
          title={statusToTranslationPath[status].title}
          content={`<span className='text-p2'>${statusToTranslationPath[status].content}</span>`}
          firstButtonTitle={t('thank_you.button_to_formular_text')}
          feedbackLink={feedbackLink}
          secondButtonTitle={t('thank_you.button_back_to_taxes_fees_text')}
          secondButtonLink={ROUTES.TAXES_AND_FEES}
        />
      ) : (
        <ThankYouCard
          success={isSuccessfullyPaid}
          title={statusToTranslationPath[status].title}
          content={`<span className='text-p2'>${statusToTranslationPath[status].content}</span>`}
          firstButtonTitle={t('thank_you.button_restart_text')}
          firstButtonLink={taxDetailLink}
          secondButtonTitle={t('thank_you.button_back_to_taxes_fees_text')}
          secondButtonLink={ROUTES.TAXES_AND_FEES}
        />
      )}
    </div>
  )
}

export default ThankYouSection
