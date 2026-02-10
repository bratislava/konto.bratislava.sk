import Alert from 'components/forms/info-components/Alert'
import TaxFeePaymentMethodsItem from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeePaymentMethods/TaxFeePaymentMethodsItem'
import { useTaxFeeSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import { ROUTES } from 'frontend/api/constants'
import { formatDate } from 'frontend/utils/general'
import { Trans, useTranslation } from 'next-i18next'
import {
  ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum,
  TaxStatusEnum,
  TaxType,
} from 'openapi-clients/tax'
import React from 'react'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20611-9839&t=u3JLgxW8MYc6kzxt-4
 */

const TaxFeePaymentMethods = () => {
  const { t } = useTranslation('account')

  const { taxData } = useTaxFeeSection()
  const { paidStatus, oneTimePayment, installmentPayment, overallBalance } = taxData

  const paymentPagePath = ROUTES.TAXES_AND_FEES_PAYMENT({
    year: taxData.year,
    type: taxData.type,
    order: taxData.order,
  })

  return (
    <div className="flex w-full flex-col gap-4 px-4 pt-4 lg:px-0 lg:pt-0">
      <div className="text-h5">{t('tax_detail_section.tax_payment_methods')}</div>
      <div className="flex w-full flex-col rounded-lg border-2 border-gray-200">
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
          subtitle={
            // only first installment is calculated, others are hardcoded so they will always be available for DzN,
            // how date calculation works for PKO is not yet determined same in PaymentSchedule
            oneTimePayment.dueDate
              ? t('tax_detail_section.tax_payment_rest_subtitle', {
                  date: formatDate(oneTimePayment.dueDate || ''),
                })
              : t('tax_detail_section.tax_payment_rest_subtitle_not_available')
          }
          amount={overallBalance}
          buttonText={
            paidStatus === TaxStatusEnum.PartiallyPaid
              ? t('taxes.payment.pay_rest')
              : t('taxes.payment.pay_all')
          }
          buttonVariant="solid"
          buttonHref={`${paymentPagePath}?sposob-uhrady=zvysna-suma`}
        />
        {installmentPayment?.isPossible &&
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
                      date: formatDate(installmentPayment.activeInstallment?.dueDate || ''),
                    })
                  : t('tax_detail_section.tax_payment_installment_subtitle_not_available')
              }
              amount={installmentPayment.activeInstallment?.remainingAmount}
              buttonVariant="outline"
              buttonText={t('taxes.payment.pay_installment')}
              buttonHref={`${paymentPagePath}?sposob-uhrady=splatky`}
            />
          )}
        {!installmentPayment?.isPossible &&
          installmentPayment?.reasonNotPossible ===
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
        {!installmentPayment?.isPossible &&
          installmentPayment?.reasonNotPossible ===
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
