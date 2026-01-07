import {
  ApplePayIcon,
  CreditCardIcon,
  DownloadIcon,
  GooglePayIcon,
  PaymentHandIcon,
  QrCodeIcon,
} from '@assets/ui-icons'
import HorizontalDivider from 'components/forms/HorizontalDivider'
import Alert from 'components/forms/info-components/Alert'
import { useTaxFeeSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import Button from 'components/forms/simple-components/Button'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import ClipboardCopy from 'components/forms/simple-components/ClipboardCopy'
import PaymentSchedule from 'components/forms/simple-components/PaymentSchedule'
import { useUser } from 'frontend/hooks/useUser'
import { PaymentMethod, PaymentMethodType } from 'frontend/types/types'
import { FormatCurrencyFromCents } from 'frontend/utils/formatCurrency'
import { useSearchParams } from 'next/navigation'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'

type Props = {
  paymentMethod: PaymentMethodType
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19567-650&m=dev
 */

const PaymentData = ({ paymentMethod }: Props) => {
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

  const { t } = useTranslation('account')
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
          <div className="text-h5">{t('taxes.payment_data.installments.title')}</div>

          {hasMultipleInstallments && <PaymentSchedule />}
        </>
      )}

      <div className="text-h5">{t('taxes.payment_data.payment_methods_title')}</div>
      <div className="px- rounded-lg border px-4 lg:px-6">
        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:py-6">
          <div className="flex flex-row items-center justify-between gap-2 lg:grow">
            <div className="flex flex-row items-center gap-2">
              <PaymentHandIcon className="size-12" />
              <div className="text-h5">{t('taxes.payment_data.card_payment_title')}</div>
            </div>
            <div className="flex flex-row items-center gap-2 lg:grow">
              <div className="rounded-lg bg-gray-50 px-3 py-1">
                <CreditCardIcon className="size-6" />
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
              isLoadingText={t('taxes.payment_data.redirect_to_payment_loading_text')}
              fullWidthMobile
            >
              {t('taxes.payment.to_pay')}
            </ButtonNew>
          </div>
        </div>
        <HorizontalDivider />
        <div className="flex flex-col gap-6 py-6">
          <div className="flex w-full items-center gap-4">
            <QrCodeIcon className="size-8" />
            <span className="text-h4">
              {t('taxes.payment_data.qr_code_and_bank_transfer_title')}
            </span>
          </div>
          <div className="flex w-full flex-col-reverse gap-6 md:flex-row lg:gap-4">
            <div className="flex w-full gap-5 rounded-lg border-0 border-gray-200 p-0 md:border md:px-4 md:py-5 lg:px-6">
              <div className="flex w-full flex-col justify-between">
                <div className="isolate flex flex-col justify-between gap-1 self-stretch py-3 lg:flex-row lg:py-0">
                  <span className="text-p2">
                    {t('taxes.payment_data.bank_info.slovenska_sporitelna')}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="grow text-16-semibold">
                      {t('taxes.payment_data.bank_info.slovenska_sporitelna_iban')}
                    </span>
                    <span className="size-6 cursor-pointer">
                      <ClipboardCopy
                        copyText={t('taxes.payment_data.bank_info.slovenska_sporitelna_iban')}
                      />
                    </span>
                  </span>
                </div>
                <HorizontalDivider />
                <div className="isolate flex flex-col justify-between gap-1 self-stretch py-3 lg:flex-row lg:py-0">
                  <span className="text-p2">{t('taxes.payment_data.bank_info.csob')}</span>
                  <span className="flex items-center gap-2">
                    <span className="grow text-16-semibold">
                      {t('taxes.payment_data.bank_info.csob_iban')}
                    </span>
                    <span className="size-6 cursor-pointer">
                      <ClipboardCopy copyText={t('taxes.payment_data.bank_info.csob_iban')} />
                    </span>
                  </span>
                </div>
                <HorizontalDivider />
                <div className="isolate flex flex-col justify-between gap-1 self-stretch py-3 lg:flex-row lg:py-0">
                  <span className="text-p2">{t('taxes.payment_data.variable_symbol')}</span>
                  <span className="flex items-center gap-2">
                    <span className="grow text-16-semibold">{variableSymbol}</span>
                    <span className="size-6 cursor-pointer">
                      {variableSymbol && <ClipboardCopy copyText={variableSymbol} />}
                    </span>
                  </span>
                </div>
                <HorizontalDivider />
                <div className="isolate flex flex-col justify-between gap-1 self-stretch py-3 lg:flex-row lg:py-0">
                  <span className="text-p2">{t('taxes.payment_data.sum')}</span>
                  <span className="flex items-center gap-2">
                    <span className="grow text-16-semibold">
                      {amountToPay && <FormatCurrencyFromCents value={amountToPay} />}
                    </span>
                    <span className="size-6 cursor-pointer">
                      {amountToPay && <ClipboardCopy copyText={(amountToPay / 100).toFixed(2)} />}
                    </span>
                  </span>
                </div>
                <HorizontalDivider />
                <div className="isolate flex flex-col justify-between gap-1 self-stretch py-3 lg:flex-row lg:py-0">
                  <span className="text-p2">{t('taxes.payment_data.beneficiary_name')}</span>
                  <span className="flex items-center gap-2">
                    <span className="grow text-16-semibold">
                      {t('taxes.payment_data.beneficiary_name_value')}
                    </span>
                    <span className="size-6 cursor-pointer">
                      <ClipboardCopy copyText={t('taxes.payment_data.beneficiary_name_value')} />
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex grow flex-col gap-4 self-stretch rounded-lg border-gray-200 p-0 lg:flex-row lg:border lg:p-6">
              <div className="flex w-full grow flex-col items-start justify-between gap-2 self-stretch">
                <div className="flex flex-col items-start gap-2">
                  <div className="text-h4">{t('taxes.payment_data.qr_code')}</div>
                  <div className="text-16">
                    {t('taxes.payment_data.use_your_banking_app_to_load')}
                  </div>
                </div>
                <Button
                  startIcon={<DownloadIcon className="size-5" />}
                  variant="black-outline"
                  text={t('taxes.payment_data.download_qr_code')}
                  size="sm"
                  className="block min-w-full lg:w-auto"
                  onPress={handleDownloadQrCode}
                />
              </div>
              <img
                className="flex aspect-square max-h-max max-w-full items-center justify-center"
                src={qrCodeImageSrc}
                alt="QR code"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentData
