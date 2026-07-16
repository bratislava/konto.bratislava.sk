import { NextRouter, useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { PaymentRedirectStateEnum, TaxType } from 'openapi-clients/tax'
import { useEffect, useMemo } from 'react'

import { useStrapiTaxConfig } from '@/src/components/page-contents/TaxesPageContent/useStrapiTaxConfig'
import ThankYouTile, {
  ThankYouTileProps,
} from '@/src/components/simple-components/ThankYouTile/ThankYouTile'
import logger from '@/src/frontend/utils/logger'
import { ROUTES } from '@/src/utils/routes'

// TODO use the nuqs library to get query params
// example: https://github.com/bratislava/bratislava.sk/blob/master/next/src/components/sections/ArticlesSection/ArticlesAll/useArticlesFilters.tsx
const usePaymentResultQueryParams = (router: NextRouter) => {
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

export const usePaymentResultPropsMap = ({
  feedbackLink,
  taxDetailLink,
}: {
  feedbackLink?: string | null
  taxDetailLink: string
}) => {
  const { t } = useTranslation('account')

  const commonProps: Partial<ThankYouTileProps> = {
    isContentCentered: true,
    secondaryButton: {
      title: t('PaymentResultPageContent.button_to_taxes'),
      href: ROUTES.TAXES,
    },
  }

  const cardPropsMap: Record<PaymentRedirectStateEnum, ThankYouTileProps> = {
    [PaymentRedirectStateEnum.PaymentSuccess]: {
      ...commonProps,
      variant: 'success',
      title: t('PaymentResultPageContent.payment_success.title'),
      content: t('PaymentResultPageContent.payment_success.content'),
      primaryButton: feedbackLink
        ? {
            title: t('PaymentResultPageContent.button_to_feedback'),
            href: feedbackLink,
          }
        : null,
    },
    [PaymentRedirectStateEnum.PaymentAlreadyPaid]: {
      ...commonProps,
      variant: 'success',
      title: t('PaymentResultPageContent.payment_already_paid.title'),
      content: t('PaymentResultPageContent.payment_success.content'),
    },
    [PaymentRedirectStateEnum.FailedToVerify]: {
      ...commonProps,
      variant: 'warning',
      title: t('PaymentResultPageContent.payment_failed_to_verify.title'),
      content: t('PaymentResultPageContent.payment_failed.content'),
      primaryButton: {
        title: t('PaymentResultPageContent.button_repeat_payment'),
        href: taxDetailLink,
      },
    },
    [PaymentRedirectStateEnum.PaymentFailed]: {
      ...commonProps,
      variant: 'error',
      title: t('PaymentResultPageContent.payment_failed.title'),
      content: t('PaymentResultPageContent.payment_failed.content'),
      primaryButton: {
        title: t('PaymentResultPageContent.button_repeat_payment'),
        href: taxDetailLink,
      },
    },
  }

  return { cardPropsMap }
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20618-3635&t=29s2lbVQdpQg3sQU-4
 */

const PaymentResultPageContent = () => {
  const { municipalChargeIdentifier } = useStrapiTaxConfig()

  const router = useRouter()
  const { status, type, year, order } = usePaymentResultQueryParams(router)

  useEffect(() => {
    if (status === PaymentRedirectStateEnum.FailedToVerify) {
      logger.error('Failed to verify payment', router.query)
    }
  }, [router.query, status])

  const taxDetailLink =
    year && type && order ? ROUTES.TAXES_TAX_DETAIL({ year, type, order }) : ROUTES.TAXES

  const feedbackLink = useMemo(() => {
    if (type === TaxType.Dzn) {
      return municipalChargeIdentifier?.dzn?.feedbackLink
    }
    if (type === TaxType.Ko) {
      return municipalChargeIdentifier?.ko?.feedbackLink
    }

    return null
  }, [
    type,
    municipalChargeIdentifier?.dzn?.feedbackLink,
    municipalChargeIdentifier?.ko?.feedbackLink,
  ])

  const { cardPropsMap } = usePaymentResultPropsMap({
    feedbackLink,
    taxDetailLink,
  })

  return (
    <div className="bg-gray-0 py-12 lg:bg-gray-50">
      <ThankYouTile {...cardPropsMap[status]} />
    </div>
  )
}

export default PaymentResultPageContent
