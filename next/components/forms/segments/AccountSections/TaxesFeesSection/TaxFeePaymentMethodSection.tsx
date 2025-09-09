import Alert from 'components/forms/info-components/Alert'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import { ROUTES } from 'frontend/api/constants'
import cn from 'frontend/cn'
import { FormatCurrencyFromCents } from 'frontend/utils/formatCurrency'
import { formatDate } from 'frontend/utils/general'
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
}

const PaymentMethodItem = ({
  title,
  subtitle,
  amount,
  buttonText,
  buttonVariant,
  buttonHref,
}: PaymentMethodItemProps) => {
  const labelStyle = cn(
    'flex w-full justify-between border-gray-200 nth-2:pt-4 nth-2:lg:border-t-2',
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

  const renderInstallmentPayment = () => {
    if (taxData.installmentPayment?.isPossible === true) {
      return (
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
        )
      )
    }
    switch (taxData.installmentPayment?.reasonNotPossible) {
      case ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum.BelowThreshold:
        return (
          <Alert
            type="warning"
            fullWidth
            message={t('tax_detail_section.tax_payment_under_threshold_alert')}
          />
        )
      case ResponseInstallmentPaymentDetailDtoReasonNotPossibleEnum.AfterDueDate:
        return (
          <Alert
            type="warning"
            fullWidth
            message={t('account_section_payment.tax_payment_year_over')}
          />
        )

      default:
        return null
    }
  }

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
            date: formatDate(taxData.oneTimePayment.dueDate || ''),
          })}
          amount={taxData.overallBalance}
          buttonText={t('pay_all')}
          buttonVariant="black-solid"
          buttonHref={`${ROUTES.TAXES_AND_FEES_PAYMENT(taxData.year)}?sposob-uhrady=zvysna-suma`}
        />
        {renderInstallmentPayment()}
      </div>
    </div>
  )
}

export default PaymentMethodSection
