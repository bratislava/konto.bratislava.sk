import {
  ApplePayIcon,
  CreditCardIcon,
  DownloadIcon,
  GooglePayIcon,
  PaymentHandIcon,
  QrCodeIcon,
} from '@assets/ui-icons'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import { useUser } from 'frontend/hooks/useUser'
import { PaymentMethod, PaymentMethodType } from 'frontend/types/types'
import { FormatCurrencyFromCents } from 'frontend/utils/formatCurrency'
import { useSearchParams } from 'next/navigation'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'

import Alert from '../../../info-components/Alert'
import Button from '../../../simple-components/Button'
import ButtonNew from '../../../simple-components/ButtonNew'
import ClipboardCopy from '../../../simple-components/ClipboardCopy'
import PaymentSchedule from '../../../simple-components/PaymentSchedule'
import TaxesFeesVerifyAndSetDeliveryMethodBanner from './TaxesFeesVerifyAndSetDeliveryBanner'
import { useTaxChannel } from './useTaxChannel'
import { useTaxFeeSection } from './useTaxFeeSection'

type DetailsProps = {
  paymentMethod: PaymentMethodType
}

const Details = ({ paymentMethod }: DetailsProps) => {
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

  const sum =
    paymentMethod === PaymentMethod.Installments
      ? taxData?.installmentPayment.activeInstallment?.remainingAmount
      : taxData?.oneTimePayment.amount

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
          <div className="text-h3">{t('payment_data_installments')}</div>

          {hasMultipleInstallments && <PaymentSchedule />}
        </>
      )}

      <div className="text-h3">{t('payment_data')}</div>
      <div className="flex flex-col gap-4 rounded-lg border-2 border-solid border-gray-200 p-4 lg:flex-row lg:p-6">
        <div className="flex flex-row items-center justify-between gap-2 lg:grow">
          <div className="flex flex-row items-center gap-2">
            <PaymentHandIcon className="size-12" />
            <div className="text-h5">{t('card_payment')}</div>
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
            {sum && <FormatCurrencyFromCents value={sum} />}
          </span>
          <ButtonNew
            variant="black-solid"
            onPress={() =>
              paymentMethod === PaymentMethod.Installments
                ? redirectToInstallmentPaymentMutate()
                : redirectToFullPaymentMutate()
            }
            isLoading={
              paymentMethod === PaymentMethod.Installments
                ? redirectToInstallmentPaymentIsPending
                : redirectToFullPaymentIsPending
            }
            isLoadingText={t('redirect_to_payment_loading')}
            fullWidthMobile
          >
            {t('to_pay')}
          </ButtonNew>
        </div>
      </div>
      <div className="flex flex-col gap-6 rounded-lg border-2 border-solid border-gray-200 p-6">
        <div className="flex w-full items-center gap-4">
          <QrCodeIcon className="size-8" />
          <span className="text-h4">{t('qr_code_and_bank_transfer')}</span>
        </div>
        <div className="flex w-full flex-col-reverse gap-6 md:flex-row lg:gap-4">
          <div className="flex w-full gap-5 rounded-lg border-0 border-solid border-gray-200 p-0 md:border-2 md:px-4 md:py-5 lg:px-6">
            <div className="flex w-full flex-col justify-between">
              <div className="isolate flex flex-col justify-between gap-1 self-stretch py-3 lg:flex-row lg:py-0">
                <span className="text-p2">{t('bank_info.slovak_sporitelna')}</span>
                <span className="flex items-center gap-2">
                  <span className="grow text-16-semibold">
                    {t('bank_info.slovak_sporitelna_iban')}
                  </span>
                  <span className="size-6 cursor-pointer">
                    <ClipboardCopy copyText={t('bank_info.slovak_sporitelna_iban')} />
                  </span>
                </span>
              </div>
              <div className="h-0.5 w-full bg-gray-200" />
              <div className="isolate flex flex-col justify-between gap-1 self-stretch py-3 lg:flex-row lg:py-0">
                <span className="text-p2">{t('bank_info.csob')}</span>
                <span className="flex items-center gap-2">
                  <span className="grow text-16-semibold">{t('bank_info.csob_iban')}</span>
                  <span className="size-6 cursor-pointer">
                    <ClipboardCopy copyText={t('bank_info.csob_iban')} />
                  </span>
                </span>
              </div>
              <div className="h-0.5 w-full bg-gray-200" />
              <div className="isolate flex flex-col justify-between gap-1 self-stretch py-3 lg:flex-row lg:py-0">
                <span className="text-p2">{t('variable_symbol')}</span>
                <span className="flex items-center gap-2">
                  <span className="grow text-16-semibold">{variableSymbol}</span>
                  <span className="size-6 cursor-pointer">
                    {variableSymbol && <ClipboardCopy copyText={variableSymbol} />}
                  </span>
                </span>
              </div>
              <div className="h-0.5 w-full bg-gray-200" />
              <div className="isolate flex flex-col justify-between gap-1 self-stretch py-3 lg:flex-row lg:py-0">
                <span className="text-p2">{t('sum')}</span>
                <span className="flex items-center gap-2">
                  <span className="grow text-16-semibold">
                    {sum && <FormatCurrencyFromCents value={sum} />}
                  </span>
                  <span className="size-6 cursor-pointer">
                    {sum && <ClipboardCopy copyText={(sum / 100).toFixed(2)} />}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex grow flex-col gap-4 self-stretch rounded-lg border-solid border-gray-200 p-0 lg:flex-row lg:border-2 lg:p-6">
            <div className="flex w-full grow flex-col items-start justify-between gap-2 self-stretch">
              <div className="flex flex-col items-start gap-2">
                <div className="text-h4">{t('qr_code')}</div>
                <div className="text-16">{t('use_your_banking_app_to_load')}</div>
              </div>
              <Button
                startIcon={<DownloadIcon className="size-5" />}
                variant="black-outline"
                text={t('download_qr_code')}
                size="sm"
                className="block min-w-full lg:w-auto"
                onPress={
                  paymentMethod === PaymentMethod.Installments
                    ? downloadQrCodeInstallmentPayment
                    : downloadQrCodeOneTimePayment
                }
              />
            </div>
            <img
              className="flex aspect-square max-h-max max-w-full items-center justify-center"
              src={
                paymentMethod === PaymentMethod.Installments
                  ? qrCodeBase64InstallmentPayment
                  : qrCodeBase64oneTimePayment
              }
              alt="QR code"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const PaymentData = () => {
  const { setOfficialCorrespondenceChannelModalOpen } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const { tierStatus } = useSsrAuth()
  const { isInQueue, isIdentityVerified } = tierStatus
  const { showDeliveryMethodNotSetBanner } = useTaxChannel()
  const searchParams = useSearchParams()
  const paymentMethodParam = searchParams.get('sposob-uhrady') as PaymentMethodType

  return (
    <div className="flex w-full flex-col items-start gap-3 px-4 lg:gap-6 lg:px-0">
      {(!isIdentityVerified && !isInQueue) || showDeliveryMethodNotSetBanner ? (
        <div className="flex flex-col gap-6">
          <Alert type="warning" fullWidth message={t('payment_method_access_prompt')} />
          <TaxesFeesVerifyAndSetDeliveryMethodBanner
            onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
          />
        </div>
      ) : (
        <Details paymentMethod={paymentMethodParam} />
      )}
    </div>
  )
}

export default PaymentData
