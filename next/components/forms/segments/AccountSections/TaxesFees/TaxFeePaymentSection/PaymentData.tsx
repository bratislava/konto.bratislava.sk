import {
  ApplePayIcon,
  ArrowRightIcon,
  CreditCardIcon,
  DownloadIcon,
  GooglePayIcon,
  PaymentHandIcon,
  QrCodeIcon,
} from '@assets/ui-icons'
import HorizontalDivider from 'components/forms/HorizontalDivider'
import Alert from 'components/forms/info-components/Alert'
import { useTaxFeeSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import ClipboardCopy from 'components/forms/simple-components/ClipboardCopy'
import PaymentSchedule from 'components/forms/simple-components/PaymentSchedule'
import { useUser } from 'frontend/hooks/useUser'
import { PaymentMethod, PaymentMethodType } from 'frontend/types/types'
import { FormatCurrencyFromCents } from 'frontend/utils/formatCurrency'
import { isDefined, isProductionDeployment } from 'frontend/utils/general'
import { useSearchParams } from 'next/navigation'
import { Trans, useTranslation } from 'next-i18next'
import { TaxType } from 'openapi-clients/tax'
import React, { Fragment } from 'react'

type Props = {
  paymentMethod: PaymentMethodType
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19567-650&m=dev
 */

const PaymentData = ({ paymentMethod }: Props) => {
  const { t } = useTranslation('account')

  const {
    taxData,
    redirectToFullPaymentMutate,
    redirectToInstallmentPaymentMutate,
    redirectToFullPaymentIsPending,
    redirectToInstallmentPaymentIsPending,
    downloadQrCodeOneTimePayment,
    downloadQrCodeInstallmentPayment,
  } = useTaxFeeSection()

  const { userData } = useUser()

  const searchParams = useSearchParams()
  const paymentMethodParam = searchParams.get('sposob-uhrady') as PaymentMethodType

  const qrCodeBase64oneTimePayment = `data:image/png;base64,${taxData.oneTimePayment.qrCode}`
  const qrCodeBase64InstallmentPayment = `data:image/png;base64,${taxData.installmentPayment.activeInstallment?.qrCode}`
  const hasMultipleInstallments = taxData.installmentPayment.isPossible

  const variableSymbol =
    paymentMethod === PaymentMethod.Installments
      ? taxData?.installmentPayment.activeInstallment?.variableSymbol
      : taxData?.oneTimePayment.variableSymbol

  const amountToPay =
    paymentMethod === PaymentMethod.Installments
      ? taxData?.installmentPayment.activeInstallment?.remainingAmount
      : taxData?.oneTimePayment.amount

  const handleRedirectToPayment = () =>
    paymentMethod === PaymentMethod.Installments
      ? redirectToInstallmentPaymentMutate()
      : redirectToFullPaymentMutate()

  const isLoading =
    paymentMethod === PaymentMethod.Installments
      ? redirectToInstallmentPaymentIsPending
      : redirectToFullPaymentIsPending

  const handleDownloadQrCode =
    paymentMethod === PaymentMethod.Installments
      ? downloadQrCodeInstallmentPayment
      : downloadQrCodeOneTimePayment

  const qrCodeImageSrc =
    paymentMethod === PaymentMethod.Installments
      ? qrCodeBase64InstallmentPayment
      : qrCodeBase64oneTimePayment

  const bankPaymentInfoRows = [
    taxData.type === TaxType.Dzn
      ? {
          label: t('taxes.payment_data.bank_info.slovenska_sporitelna_title'),
          value: t('taxes.payment_data.bank_info.slovenska_sporitelna_iban.dzn'),
          clipboardCopyValue: t('taxes.payment_data.bank_info.slovenska_sporitelna_iban.dzn'),
        }
      : null,
    taxData.type === TaxType.Dzn
      ? {
          label: t('taxes.payment_data.bank_info.csob_title'),
          value: t('taxes.payment_data.bank_info.csob_iban.dzn'),
          clipboardCopyValue: t('taxes.payment_data.bank_info.csob_iban.dzn'),
        }
      : null,
    taxData.type === TaxType.Ko
      ? {
          label: t('taxes.payment_data.bank_info.csob_title'),
          value: t('taxes.payment_data.bank_info.csob_iban.ko'),
          clipboardCopyValue: t('taxes.payment_data.bank_info.csob_iban.ko'),
        }
      : null,
    {
      label: t('taxes.payment_data.variable_symbol'),
      value: variableSymbol,
      clipboardCopyValue: variableSymbol,
    },
    {
      label: t('taxes.payment_data.sum'),
      value: amountToPay ? <FormatCurrencyFromCents value={amountToPay} /> : null,
      clipboardCopyValue: amountToPay ? (amountToPay / 100).toFixed(2) : null,
    },
    {
      label: t('taxes.payment_data.beneficiary_name'),
      value: t('taxes.payment_data.beneficiary_name_value'),
      clipboardCopyValue: t('taxes.payment_data.beneficiary_name_value'),
    },
  ].filter(isDefined)

  return (
    <div className="flex w-full flex-col gap-6">
      {paymentMethodParam === PaymentMethod.Installments && (
        <>
          <Alert
            type="warning"
            fullWidth
            message={
              <Trans
                ns="account"
                i18nKey="tax_detail_section.tax_payment_installment_alert_before_next_payment"
                components={{ strong: <strong className="font-semibold" /> }}
                values={{ email: userData.email }}
              />
            }
          />

          {hasMultipleInstallments && (
            <div className="flex flex-col gap-3">
              <span className="text-h5">{t('taxes.payment_data.installments.title')}</span>
              <PaymentSchedule />
            </div>
          )}
        </>
      )}

      <div className="flex flex-col gap-2 lg:gap-4">
        <div className="text-h5">{t('taxes.payment_data.payment_methods_title')}</div>
        <div className="rounded-lg border px-4 lg:px-6">
          {
            // Temporarily hide pay-by-card option for KO on production, until we setup correct payment gateway
            (taxData.type !== TaxType.Ko || !isProductionDeployment()) && (
              <>
                <div className="flex flex-col gap-4 py-4 lg:flex-row lg:justify-between lg:py-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
                    <div className="flex flex-row-reverse items-center justify-between gap-4 lg:flex-row lg:justify-start">
                      <PaymentHandIcon className="size-8 lg:size-12" />
                      <span className="text-h5">{t('taxes.payment_data.card_payment_title')}</span>
                    </div>
                    <div className="flex flex-row items-center gap-1.5 lg:gap-3">
                      <div className="rounded-lg bg-background-passive-primary px-3 py-1">
                        <CreditCardIcon className="size-5" />
                      </div>
                      <ApplePayIcon className="size-12" />
                      <GooglePayIcon className="size-12" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-12">
                    <span className="w-full text-h5 lg:w-auto">
                      {amountToPay && <FormatCurrencyFromCents value={amountToPay} />}
                    </span>
                    <ButtonNew
                      variant="black-solid"
                      onPress={handleRedirectToPayment}
                      isLoading={isLoading}
                      endIcon={<ArrowRightIcon />}
                      isLoadingText={t('taxes.payment_data.redirect_to_payment_loading_text')}
                      className="max-lg:w-full"
                    >
                      {t('taxes.payment.to_pay')}
                    </ButtonNew>
                  </div>
                </div>
                <HorizontalDivider />
              </>
            )
          }

          <div className="flex flex-col gap-4 py-4 lg:gap-6 lg:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
              <div className="flex w-full flex-row-reverse items-center justify-between gap-5 lg:flex-row lg:justify-start">
                <QrCodeIcon className="size-8 lg:size-12" />
                <span className="text-h5">
                  {t('taxes.payment_data.qr_code_and_bank_transfer_title')}
                </span>
              </div>
              <span className="text-h5 max-lg:w-full">
                {amountToPay && <FormatCurrencyFromCents value={amountToPay} />}
              </span>
            </div>
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:gap-4">
              <ul className="flex w-full flex-col rounded-lg border px-4 py-2 lg:px-6">
                {bankPaymentInfoRows.map((row, index) => {
                  return (
                    <Fragment key={index}>
                      {index > 0 && <HorizontalDivider />}
                      {/* TODO consider separating this row into a component */}
                      <div className="flex gap-3 self-stretch py-3 lg:gap-4 lg:py-4">
                        <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                          <span className="text-p2-semibold">{row.label}</span>
                          <span className="text-p2">{row.value}</span>
                        </div>
                        <span className="size-6">
                          {row.clipboardCopyValue ? (
                            <ClipboardCopy copyText={row.clipboardCopyValue} />
                          ) : null}
                        </span>
                      </div>
                    </Fragment>
                  )
                })}
              </ul>
              <div className="flex max-w-120 flex-col gap-4 self-stretch rounded-lg border p-4 lg:flex-row">
                <div className="flex w-full grow flex-col items-start justify-between gap-4">
                  <div className="flex flex-col items-start gap-2">
                    <div className="text-h6">{t('taxes.payment_data.qr_code')}</div>
                    <div className="text-16">
                      {t('taxes.payment_data.use_your_banking_app_to_load')}
                    </div>
                  </div>
                  <ButtonNew
                    startIcon={<DownloadIcon />}
                    variant="black-outline"
                    className="text-nowrap max-lg:w-full"
                    onPress={handleDownloadQrCode}
                  >
                    {t('taxes.payment_data.download_qr_code')}
                  </ButtonNew>
                </div>
                <div className="flex h-full flex-col justify-center lg:w-100">
                  <img className="aspect-square w-full" src={qrCodeImageSrc} alt="QR code" />{' '}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentData
