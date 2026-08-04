import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import {
  InstallmentPaidStatusEnum,
  InstallmentPaymentReasonNotPossibleEnum,
  TaxStatusEnum,
  TaxType,
} from 'openapi-clients/tax'

import { formatDate } from '@/src/components/formatting/FormatDate'
import TaxPaymentMethodsItem from '@/src/components/page-contents/TaxesPageContent/TaxPageContent/TaxPaymentMethods/TaxPaymentMethodsItem'
import { useTaxData } from '@/src/components/page-contents/TaxesPageContent/useTaxData'
import Alert from '@/src/components/simple-components/Alert'
import { ROUTES } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20611-9839&t=u3JLgxW8MYc6kzxt-4
 */

const TaxPaymentMethods = () => {
  const { t } = useTranslation('account')

  const { taxData } = useTaxData()
  const { paidStatus, oneTimePayment, installmentPayment, overallBalance } = taxData

  const firstInstallment = installmentPayment.installments?.[0]
  const isFirstInstallmentPaid =
    firstInstallment?.status === InstallmentPaidStatusEnum.Paid ||
    firstInstallment?.status === InstallmentPaidStatusEnum.OverPaid

  const paymentPagePath = ROUTES.TAXES_TAX_PAYMENT({
    year: taxData.year,
    type: taxData.type,
    order: taxData.order,
  })

  // If first installment is paid, there is no need to show the subtitle with due date for the one-time payment
  const oneTimePaymentSubtitleText = oneTimePayment.dueDate
    ? t('TaxPaymentMethods.oneTimePaymentSubtitle', {
        date: formatDate(oneTimePayment.dueDate),
      })
    : t('TaxPaymentMethods.oneTimePaymentSubtitleNotAvailable')
  const oneTimePaymentSubtitle = isFirstInstallmentPaid ? undefined : oneTimePaymentSubtitleText

  return (
    <div className="flex w-full flex-col gap-4 px-4 pt-4 lg:px-0 lg:pt-0">
      <Typography variant="h5" as="p" className="font-semibold">
        {t('TaxPaymentMethods.title')}
      </Typography>
      <div className="flex w-full flex-col rounded-lg border border-gray-200">
        <TaxPaymentMethodsItem
          title={
            taxData.paidStatus === TaxStatusEnum.PartiallyPaid
              ? t('TaxPaymentMethods.rest')
              : t('TaxPaymentMethods.full')
          }
          subtitle={oneTimePaymentSubtitle}
          amount={overallBalance}
          buttonText={
            paidStatus === TaxStatusEnum.PartiallyPaid
              ? t('TaxPaymentMethods.payRest')
              : t('TaxPaymentMethods.payAll')
          }
          buttonVariant="solid"
          buttonHref={`${paymentPagePath}?sposob-uhrady=zvysna-suma`}
        />
        {installmentPayment.isPossible &&
          installmentPayment.activeInstallment?.remainingAmount !== undefined && (
            <TaxPaymentMethodsItem
              title={t('TaxPaymentMethods.installment')}
              subtitle={
                installmentPayment.activeInstallment?.dueDate
                  ? t('TaxPaymentMethods.installmentSubtitle', {
                      date: formatDate(installmentPayment.activeInstallment?.dueDate),
                    })
                  : t('TaxPaymentMethods.installmentSubtitleNotAvailable')
              }
              amount={installmentPayment.activeInstallment?.remainingAmount}
              buttonVariant="outline"
              buttonText={t('TaxPaymentMethods.payInstallment')}
              buttonHref={`${paymentPagePath}?sposob-uhrady=splatky`}
            />
          )}
        {!installmentPayment.isPossible &&
          installmentPayment.reasonNotPossible ===
            InstallmentPaymentReasonNotPossibleEnum.BelowThreshold &&
          taxData.type === TaxType.Dzn && (
            <div className="p-4 lg:p-6 lg:pt-0">
              <Alert
                type="warning"
                fullWidth
                message={t('TaxPaymentMethods.underThresholdAlert')}
              />
            </div>
          )}
        {!installmentPayment.isPossible &&
          installmentPayment.reasonNotPossible ===
            InstallmentPaymentReasonNotPossibleEnum.AfterDueDate && (
            <div className="p-4 lg:p-6 lg:pt-0">
              <Alert
                type="warning"
                fullWidth
                message={t('account_section_payment.tax_payment_year_over')}
              />
            </div>
          )}
      </div>
    </div>
  )
}

export default TaxPaymentMethods
