import { DownloadIcon } from '@assets/ui-icons'
import { TaxPaidStatusEnum } from '@clients/openapi-tax'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { environment } from '../../../../../environment'
import { useUser } from '../../../../../frontend/hooks/useUser'
import AccordionPaymentSchedule from '../../../simple-components/AccordionPaymentSchedule'
import Button from '../../../simple-components/Button'
import ButtonNew from '../../../simple-components/ButtonNew'
import ClipboardCopy from '../../../simple-components/ClipboardCopy'
import TaxesFeesDeliveryMethodBanner from './TaxesFeesDeliveryMethodBanner'
import TaxesFeesDeliveryMethodCard from './TaxesFeesDeliveryMethodCard'
import { useTaxFeeSection } from './useTaxFeeSection'

const Details = () => {
  const {
    taxData,
    redirectToPayment,
    redirectToPaymentIsPending,
    downloadQrCode,
    setOfficialCorrespondenceChannelModalOpen,
  } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const qrCodeBase64 = `data:image/png;base64,${taxData.qrCodeWeb}`
  const hasMultipleInstallments = taxData.taxInstallments.length > 1
  const displayDeliveryMethodCard = environment.featureToggles.taxReportDeliveryMethod

  return (
    <div className="flex w-full flex-col gap-6">
      {displayDeliveryMethodCard && (
        <TaxesFeesDeliveryMethodCard
          onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
        />
      )}
      <div className="flex w-full flex-col-reverse gap-6 md:flex-row lg:gap-8">
        <div className="flex w-full flex-col gap-5 rounded-lg border-0 border-solid border-gray-200 p-0 sm:border-2 sm:px-6 sm:py-5 md:w-[488px]">
          <div className="text-p2">{t('use_one_of_ibans_to_pay')}</div>
          {taxData.paidStatus === TaxPaidStatusEnum.Paid ? null : (
            <div className="text-p2 rounded-5 bg-warning-100 p-3">
              {t('tax_bank_transfer_slow_info')}
            </div>
          )}
          <div className="flex flex-col items-start gap-4">
            <div className="isolate flex flex-col items-start gap-1 self-stretch">
              <div className="text-p2">{t('bank_info.slovak_sporitelna')}</div>
              <div className="flex w-full">
                <div className="text-16-semibold grow">{t('bank_info.slovak_sporitelna_iban')}</div>
                <div className="hidden size-6 cursor-pointer sm:block">
                  <ClipboardCopy copyText={t('bank_info.slovak_sporitelna_iban')} />
                </div>
              </div>
            </div>
            <div className="hidden h-0.5 w-full bg-gray-200 sm:block" />
            <div className="isolate flex flex-col items-start gap-1 self-stretch">
              <div className="text-p2">{t('bank_info.csob')}</div>
              <div className="flex w-full">
                <div className="text-16-semibold grow">{t('bank_info.csob_iban')}</div>
                <div className="hidden size-6 cursor-pointer sm:block">
                  <ClipboardCopy copyText={t('bank_info.csob_iban')} />
                </div>
              </div>
            </div>
            <div className="hidden h-0.5 w-full bg-gray-200 sm:block" />
            <div className="flex flex-col items-start gap-2">
              <div className="grid grid-cols-1 gap-1 lg:grid-cols-2 lg:gap-2">
                <div className="text-16-semibold lg:mr-4">{t('constant_symbol')}</div>
                <div className="text-16 mb-1 lg:mb-0">{t('constant_symbol_number')}</div>
                <div className="text-16-semibold lg:mr-4">{t('variable_symbol')}</div>
                <div className="text-16">{taxData?.variableSymbol}</div>
              </div>
            </div>
            <div className="hidden h-0.5 w-full bg-gray-200 sm:block" />
            <div className="flex w-full flex-col items-start gap-2">
              <div className="text-16-semibold">{t('tax_due')}</div>
              <div className="text-16">
                {hasMultipleInstallments ? (
                  <>
                    <div className="inline">{t('tax_payable_in_installments_1')}</div>
                    <div className="text-16-semibold inline">
                      {t('tax_payable_in_installments_2')}
                    </div>{' '}
                    <div className="inline">{t('tax_payable_in_installments_3')}</div>
                  </>
                ) : (
                  <>
                    <div className="inline">{t('tax_payable_within')}</div>
                    <div className="text-16-semibold inline">
                      {t('validity_decision_with_schedule')}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex grow flex-col gap-4">
          <div className="flex w-full flex-col items-start gap-6 rounded-lg bg-gray-50 p-4 lg:flex-row lg:items-center lg:px-6 lg:py-8">
            <div className="flex grow flex-col items-start gap-2">
              <div className="text-h4">{t('card_payment')}</div>
              <div className="text-16">{t('you_will_be_redirected_to_the_payment_gateway')}</div>
            </div>
            <ButtonNew
              variant="black-solid"
              onPress={() => redirectToPayment()}
              isLoading={redirectToPaymentIsPending}
              // TODO: Translation
              isLoadingText="Presmerovávam…"
              isDisabled={taxData.paidStatus !== TaxPaidStatusEnum.NotPayed}
              fullWidthMobile
            >
              {t('to_pay')}
            </ButtonNew>
          </div>
          <div className="flex grow flex-col gap-4 self-stretch rounded-lg border-2 border-solid border-gray-200 p-4 lg:flex-row lg:p-6">
            <div className="flex w-full grow flex-col items-start justify-between gap-2 self-stretch">
              <div className="flex flex-col items-start gap-2">
                <div className="text-h4">{t('qr_code')}</div>
                <div className="text-16">{t('use_your_banking_app_to_load')}</div>
              </div>
              {/* Desktop 'download' button */}
              <Button
                startIcon={<DownloadIcon className="size-5" />}
                variant="black-outline"
                text={t('download_image')}
                size="sm"
                className="hidden lg:block"
                onPress={downloadQrCode}
              />
            </div>
            <img
              className="flex aspect-square max-h-max max-w-full items-center justify-center self-center bg-[red] sm:max-h-[256px] sm:max-w-[256px]"
              src={qrCodeBase64}
              alt="QR code"
            />

            {/* Mobile 'download' button */}
            <Button
              startIcon={<DownloadIcon className="size-5" />}
              variant="black-outline"
              text={t('download_image')}
              size="sm"
              className="block min-w-full lg:hidden"
              onPress={downloadQrCode}
            />
          </div>
        </div>
      </div>
      {hasMultipleInstallments && <AccordionPaymentSchedule />}
    </div>
  )
}

const PaymentData = () => {
  const { setOfficialCorrespondenceChannelModalOpen } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const { userData } = useUser()
  const displayDeliveryMethodBanner =
    environment.featureToggles.taxReportDeliveryMethod && userData.showEmailCommunicationBanner

  return (
    <div className="flex w-full flex-col items-start gap-3 px-4 lg:gap-6 lg:px-0">
      <div className="text-h3">{t('payment_data')}</div>
      {displayDeliveryMethodBanner ? (
        <div className="flex flex-col gap-6">
          <p className="text-p2">
            {/* TODO: Translations */}
            Po zvolení jednej z nasledujúcich možností, sprístupníme platobné metódy.
          </p>
          <TaxesFeesDeliveryMethodBanner
            onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
          />
        </div>
      ) : (
        <Details />
      )}
    </div>
  )
}

export default PaymentData
