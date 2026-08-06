import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs'
import { PaymentRedirectStateEnum, TaxType } from 'openapi-clients/tax'
import { useEffect, useMemo } from 'react'

import { useStrapiTaxConfig } from '@/src/components/page-contents/TaxesPageContent/useStrapiTaxConfig'
import ThankYouTile, {
  ThankYouTileProps,
} from '@/src/components/simple-components/ThankYouTile/ThankYouTile'
import logger from '@/src/frontend/utils/logger'
import { ROUTES } from '@/src/utils/routes'

/**
 * Query params are passed from nest-tax-backend/src/payment/payment.service.ts
 * We expect status, taxType, order, year
 * An unknown or missing status is treated as "failed to verify"
 */
const usePaymentResultQueryParams = () => {
  const [{ status, type, order, year }] = useQueryStates(
    {
      status: parseAsStringEnum(Object.values(PaymentRedirectStateEnum)).withDefault(
        PaymentRedirectStateEnum.FailedToVerify,
      ),
      type: parseAsStringEnum(Object.values(TaxType)),
      order: parseAsInteger,
      year: parseAsInteger,
    },
    { urlKeys: { type: 'taxType' } },
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
  const { t } = useTranslation()

  const commonProps: Partial<ThankYouTileProps> = {
    isContentCentered: true,
    secondaryButton: {
      label: t('PaymentResultPageContent.buttons.toTaxes'),
      href: ROUTES.TAXES,
    },
  }

  const cardPropsMap: Record<PaymentRedirectStateEnum, ThankYouTileProps> = {
    [PaymentRedirectStateEnum.PaymentSuccess]: {
      ...commonProps,
      variant: 'success',
      title: t('PaymentResultPageContent.paymentSuccess.title'),
      content: t('PaymentResultPageContent.paymentSuccess.content'),
      primaryButton: feedbackLink
        ? {
            label: t('PaymentResultPageContent.buttons.toFeedback'),
            href: feedbackLink,
          }
        : null,
    },
    [PaymentRedirectStateEnum.PaymentAlreadyPaid]: {
      ...commonProps,
      variant: 'success',
      title: t('PaymentResultPageContent.paymentAlreadyPaid.title'),
      content: t('PaymentResultPageContent.paymentSuccess.content'),
    },
    [PaymentRedirectStateEnum.FailedToVerify]: {
      ...commonProps,
      variant: 'warning',
      title: t('PaymentResultPageContent.paymentFailedToVerify.title'),
      content: t('PaymentResultPageContent.paymentFailed.content'),
      primaryButton: {
        label: t('PaymentResultPageContent.buttons.repeatPayment'),
        href: taxDetailLink,
      },
    },
    [PaymentRedirectStateEnum.PaymentFailed]: {
      ...commonProps,
      variant: 'error',
      title: t('PaymentResultPageContent.paymentFailed.title'),
      content: t('PaymentResultPageContent.paymentFailed.content'),
      primaryButton: {
        label: t('PaymentResultPageContent.buttons.repeatPayment'),
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

  const { status, type, year, order } = usePaymentResultQueryParams()

  // `useRouter` is used only to log the raw query params in case of a failed verification,
  // so that we can debug the issue easily
  const router = useRouter()

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
