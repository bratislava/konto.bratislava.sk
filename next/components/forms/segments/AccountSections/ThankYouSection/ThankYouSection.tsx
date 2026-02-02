import ThankYouCard, { ThankYouCardBase } from 'components/forms/segments/AccountSections/ThankYouSection/ThankYouCard'
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

  const { feedbackLinkDzn, feedbackLinkKo } = useStrapiTax()

  const router = useRouter()
  const { status, type, year, order } = useGetPaymentQueryParams(router)

  useEffect(() => {
    if (status === PaymentRedirectStateEnum.FailedToVerify) {
      logger.error('Failed to verify payment', router.query)
    }
  }, [router.query, status])

  const taxDetailLink =
    year && type && order
      ? ROUTES.TAXES_AND_FEES_DETAIL({ year, type, order })
      : ROUTES.TAXES_AND_FEES

  const feedbackLink = useMemo(() => {
    if (type === TaxType.Dzn) {
      return feedbackLinkDzn
    }
    if (type === TaxType.Ko) {
      return feedbackLinkKo
    }
    return null
  }, [type, feedbackLinkDzn, feedbackLinkKo])

  const cardPropsMap: Record<PaymentRedirectStateEnum, ThankYouCardBase> = {
    [PaymentRedirectStateEnum.PaymentSuccess]: {
      success: true,
      title: t('thank_you.result.payment_success.title'),
      content: t('thank_you.result.payment_success.content'),
      firstButtonTitle: t('thank_you.button_to_formular_text'),
      firstButtonLink: feedbackLink ?? "#",
    },
    [PaymentRedirectStateEnum.PaymentAlreadyPaid]: {
      success: true,
      title: t('thank_you.result.payment_already_paid.title'),
      content: t('thank_you.result.payment_success.content'),
    },
    [PaymentRedirectStateEnum.FailedToVerify]: {
      success: false,
      title: t('thank_you.result.failed_to_verify.title'),
      content: t('thank_you.result.payment_failed.content'),
      firstButtonTitle: t('thank_you.button_restart_text'),
      firstButtonLink: taxDetailLink,
    },
    [PaymentRedirectStateEnum.PaymentFailed]: {
      success: false,
      title: t('thank_you.result.payment_failed.title'),
      content: t('thank_you.result.payment_failed.content'),
      firstButtonTitle: t('thank_you.button_restart_text'),
      firstButtonLink: taxDetailLink,
    },
  }

  const cardProps = cardPropsMap[status]

  return (
    <div className="bg-gray-0 pt-16 lg:bg-gray-50 lg:pt-8">
      <ThankYouCard
        success={cardProps.success}
        title={cardProps.title}
        content={`<span className='text-p2'>${cardProps.content}</span>`}
        firstButtonTitle={cardProps.firstButtonTitle}
        firstButtonLink={cardProps.firstButtonLink}
        secondButtonTitle={t('thank_you.button_back_to_taxes_fees_text')}
        secondButtonLink={ROUTES.TAXES_AND_FEES}
      />
    </div>
  )
}

export default ThankYouSection
