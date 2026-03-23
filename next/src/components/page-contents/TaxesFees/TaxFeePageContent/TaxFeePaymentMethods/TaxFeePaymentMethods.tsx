import { Trans, useTranslation } from 'next-i18next'
import {
  InstallmentPaidStatusEnum,
  ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum,
  TaxStatusEnum,
  TaxType,
} from 'openapi-clients/tax'

import { formatDate } from '@/src/components/formatting/FormatDate'
import TaxFeePaymentMethodsItem from '@/src/components/page-contents/TaxesFees/TaxFeePageContent/TaxFeePaymentMethods/TaxFeePaymentMethodsItem'
import { useTaxFee } from '@/src/components/page-contents/TaxesFees/useTaxFee'
import Alert from '@/src/components/simple-components/Alert'
import { ROUTES } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20611-9839&t=u3JLgxW8MYc6kzxt-4
 */

const TaxFeePaymentMethods = () => {
  const { t } = useTranslation('account')

  const { taxData } = useTaxFee()
  const { paidStatus, oneTimePayment, installmentPayment, overallBalance } = taxData

  const firstInstallment = installmentPayment.installments?.[0]
  const isFirstInstallmentPaid =
    firstInstallment?.status === InstallmentPaidStatusEnum.Paid ||
    firstInstallment?.status === InstallmentPaidStatusEnum.OverPaid

  const paymentPagePath = ROUTES.TAXES_AND_FEES_PAYMENT({
    year: taxData.year,
    type: taxData.type,
    order: taxData.order,
  })

  // If first installment is paid, there is no need to show the subtitle with due date for the one-time payment
  const oneTimePaymentSubtitle: string | undefined = isFirstInstallmentPaid
    ? undefined
    : oneTimePayment.dueDate
      ? t('tax_detail_section.tax_payment_rest_subtitle', {
          date: formatDate(oneTimePayment.dueDate),
        })
      : t('tax_detail_section.tax_payment_rest_subtitle_not_available')

  return (
    <div className="flex w-full flex-col gap-4 px-4 pt-4 lg:px-0 lg:pt-0">
      <div className="text-h5">{t('tax_detail_section.tax_payment_methods')}</div>
      <div className="flex w-full flex-col rounded-lg border border-gray-200">
        <TaxFeePaymentMethodsItem
          title={
            taxData.paidStatus === TaxStatusEnum.PartiallyPaid ? (
              <Trans
                ns="account"
                i18nKey="tax_detail_section.tax_payment_rest"
                components={{ strong: <strong className="font-semibold" /> }}
              />
            ) : (
              <Trans
                ns="account"
                i18nKey="tax_detail_section.tax_payment_full"
                components={{ strong: <strong className="font-semibold" /> }}
              />
            )
          }
          subtitle={oneTimePaymentSubtitle}
          amount={overallBalance}
          buttonText={
            paidStatus === TaxStatusEnum.PartiallyPaid
              ? t('taxes.payment.pay_rest')
              : t('taxes.payment.pay_all')
          }
          buttonVariant="solid"
          buttonHref={`${paymentPagePath}?sposob-uhrady=zvysna-suma`}
        />
        {installmentPayment.isPossible &&
          installmentPayment.activeInstallment?.remainingAmount !== undefined && (
            <TaxFeePaymentMethodsItem
              title={
                <Trans
                  ns="account"
                  i18nKey="tax_detail_section.tax_payment_installment"
                  components={{ strong: <strong className="font-semibold" /> }}
                />
              }
              subtitle={
                installmentPayment.activeInstallment?.dueDate
                  ? t('tax_detail_section.tax_payment_installment_subtitle', {
                      date: formatDate(installmentPayment.activeInstallment?.dueDate),
                    })
                  : t('tax_detail_section.tax_payment_installment_subtitle_not_available')
              }
              amount={installmentPayment.activeInstallment?.remainingAmount}
              buttonVariant="outline"
              buttonText={t('taxes.payment.pay_installment')}
              buttonHref={`${paymentPagePath}?sposob-uhrady=splatky`}
            />
          )}
        {!installmentPayment.isPossible &&
          installmentPayment.reasonNotPossible ===
            ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum.BelowThreshold &&
          taxData.type === TaxType.Dzn && (
            <div className="p-4 lg:p-6 lg:pt-0">
              <Alert
                type="warning"
                fullWidth
                message={t('tax_detail_section.tax_payment_under_threshold_alert')}
              />
            </div>
          )}
        {!installmentPayment.isPossible &&
          installmentPayment.reasonNotPossible ===
            ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum.AfterDueDate && (
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

export default TaxFeePaymentMethods
