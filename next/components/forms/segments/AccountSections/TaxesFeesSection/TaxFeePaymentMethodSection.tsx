import Alert from 'components/forms/info-components/Alert'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import { ROUTES } from 'frontend/api/constants'
import cn from 'frontend/cn'
import { FormatCurrencyFromCents } from 'frontend/utils/formatCurrency'
import { Trans, useTranslation } from 'next-i18next'
import { ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum } from 'openapi-clients/tax'
import React from 'react'

import { useTaxFeeSection } from './useTaxFeeSection'

interface PaymentMethodItemProps {
  title: React.ReactNode
  subtitle: string
  amount: number
  buttonText: string
  buttonVariant: 'black-solid' | 'black-outline'
  buttonHref: string
  isSinglePaymentOption?: boolean
}

const PaymentMethodItem = ({
  title,
  subtitle,
  amount,
  buttonText,
  buttonVariant,
  buttonHref,
  isSinglePaymentOption = false,
}: PaymentMethodItemProps) => {
  const labelStyle = cn(
    'flex w-full justify-between',
    isSinglePaymentOption
      ? 'border-b-0'
      : 'border-gray-200 not-last:pb-4 lg:border-b-2 lg:last:border-b-0',
  )
  return (
    <div className={labelStyle}>
      <div>
        <div className="text-p2">{title}</div>
        <div className="text-p2-semibold text-category-600">{subtitle}</div>
      </div>
      <div className="flex flex-row items-center gap-8">
        <span className="text-p1-semibold">
          <FormatCurrencyFromCents value={amount} />
        </span>
        <ButtonNew variant={buttonVariant} href={buttonHref} fullWidthMobile hasLinkIcon>
          {buttonText}
        </ButtonNew>
      </div>
    </div>
  )
}

const PaymentMethodSection = () => {
  const { taxData } = useTaxFeeSection()
  const { t } = useTranslation('account')

  // TODO: check if this works
  const showAlertPaymentYearOver =
    taxData.installmentPayment?.isPossible === false &&
    taxData.installmentPayment?.reasonNotPossible ===
      ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum.AfterDueDate

  // TODO: if installment payment is more than 66 euros and it is not past payment date,
  // TODO: check if this works
  const showAlertPaymentInstallment =
    taxData.installmentPayment?.isPossible &&
    taxData.installmentPayment?.reasonNotPossible ===
      ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum.BelowThreshold
  // const showAlertPaymentInstallment = !taxData.installmentPayment?.activeInstallment?.remainingAmount ||
  // taxData.installmentPayment?.activeInstallment?.remainingAmount === 0 + payment date is not past

  const isSinglePayment = !taxData.installmentPayment?.isPossible

  return (
    <div className="flex w-full flex-col gap-4 px-4 lg:px-0">
      <div className="text-h3">{t('tax_detail_section.tax_payment_methods')}</div>
      <div className="flex w-full flex-col gap-6 rounded-lg border-2 border-gray-200 p-6">
        <PaymentMethodItem
          title={
            <Trans
              ns="account"
              i18nKey="tax_detail_section.tax_payment_rest"
              components={{ strong: <strong className="font-semibold" /> }}
            />
          }
          subtitle={t('tax_detail_section.tax_payment_rest_subtitle', {
            // TODO: add date from taxData
            date: '31.8.2025',
          })}
          amount={taxData.overallBalance}
          buttonText={t('pay_all')}
          buttonVariant="black-solid"
          buttonHref={`${ROUTES.TAXES_AND_FEES_PAYMENT(taxData.year)}?sposob-uhrady=zvysna-suma`}
          isSinglePaymentOption={isSinglePayment}
        />
        {/* show only if tax has installments, more than 66 euros */}
        {showAlertPaymentInstallment &&
          taxData.installmentPayment?.activeInstallment?.remainingAmount && (
            <PaymentMethodItem
              title={
                <Trans
                  ns="account"
                  i18nKey="tax_detail_section.tax_payment_installment"
                  components={{ strong: <strong className="font-semibold" /> }}
                />
              }
              subtitle={t('tax_detail_section.tax_payment_installment_subtitle', {
                // TODO: add date from taxData
                date: '31.8.2025',
              })}
              amount={taxData.installmentPayment.activeInstallment.remainingAmount}
              buttonText={t('pay_installments')}
              buttonVariant="black-outline"
              buttonHref={`${ROUTES.TAXES_AND_FEES_PAYMENT(taxData.year)}?sposob-uhrady=splatky`}
            />
          )}
        {showAlertPaymentYearOver && (
          <Alert
            type="warning"
            fullWidth
            message={t('account_section_payment.tax_payment_year_over')}
          />
        )}
      </div>
    </div>
  )
}

export default PaymentMethodSection
