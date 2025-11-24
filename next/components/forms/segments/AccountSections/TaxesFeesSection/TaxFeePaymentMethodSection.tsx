import Alert from 'components/forms/info-components/Alert'
import { ROUTES } from 'frontend/api/constants'
import { formatDate } from 'frontend/utils/general'
import { Trans, useTranslation } from 'next-i18next'
import {
  ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum,
  TaxPaidStatusEnum,
} from 'openapi-clients/tax'
import React from 'react'

import PaymentMethodItem from './PaymentMethodItem'
import { useTaxFeeSection } from './useTaxFeeSection'

const TaxFeePaymentMethodSection = () => {
  const { taxData } = useTaxFeeSection()
  const { t } = useTranslation('account')

  return (
    <div className="flex w-full flex-col px-4 lg:px-0">
      <div className="flex w-full border-t-2 border-gray-200 lg:hidden lg:border-t-0" />
      <div className="flex w-full flex-col gap-4 pt-4 lg:pt-0">
        <div className="text-h3">{t('tax_detail_section.tax_payment_methods')}</div>
        <div className="flex w-full flex-col rounded-lg border-2 border-gray-200 lg:p-6">
          <PaymentMethodItem
            title={
              <Trans
                ns="account"
                i18nKey={
                  taxData.paidStatus === TaxPaidStatusEnum.PartiallyPaid
                    ? 'tax_detail_section.tax_payment_rest'
                    : 'tax_detail_section.tax_payment_full'
                }
                components={{ strong: <strong className="font-semibold" /> }}
              />
            }
            subtitle={t('tax_detail_section.tax_payment_rest_subtitle', {
              date: formatDate(taxData.oneTimePayment.dueDate || ''),
            })}
            amount={taxData.overallBalance}
            buttonText={
              taxData.paidStatus === TaxPaidStatusEnum.PartiallyPaid ? t('pay_rest') : t('pay_all')
            }
            buttonVariant="black-solid"
            buttonHref={`${ROUTES.TAXES_AND_FEES_PAYMENT(taxData.year)}?sposob-uhrady=zvysna-suma`}
          />
          {taxData.installmentPayment?.isPossible &&
            taxData.installmentPayment.activeInstallment?.remainingAmount !== undefined && (
              <PaymentMethodItem
                title={
                  <Trans
                    ns="account"
                    i18nKey="tax_detail_section.tax_payment_installment"
                    components={{ strong: <strong className="font-semibold" /> }}
                  />
                }
                subtitle={t('tax_detail_section.tax_payment_installment_subtitle', {
                  date: formatDate(taxData.installmentPayment.dueDateLastPayment || ''),
                })}
                amount={taxData.installmentPayment.activeInstallment?.remainingAmount}
                buttonText={t('pay_installments')}
                buttonVariant="black-outline"
                buttonHref={`${ROUTES.TAXES_AND_FEES_PAYMENT(taxData.year)}?sposob-uhrady=splatky`}
              />
            )}
          {!taxData.installmentPayment?.isPossible &&
            taxData.installmentPayment?.reasonNotPossible ===
              ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum.BelowThreshold && (
              <Alert
                type="warning"
                fullWidth
                message={t('tax_detail_section.tax_payment_under_threshold_alert')}
              />
            )}
          {!taxData.installmentPayment?.isPossible &&
            taxData.installmentPayment?.reasonNotPossible ===
              ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum.AfterDueDate && (
              <Alert
                type="warning"
                fullWidth
                message={t('account_section_payment.tax_payment_year_over')}
              />
            )}
          {/* {renderInstallmentPayment()} */}
        </div>
      </div>
    </div>
  )
}

export default TaxFeePaymentMethodSection
