import { DownloadIcon } from '@assets/ui-icons'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { getPaymentGatewayUrlApi } from '../../../../../frontend/api/api'
import { Tax } from '../../../../../frontend/dtos/taxDto'
import { taxStatusHelper } from '../../../../../frontend/utils/general'
import logger from '../../../../../frontend/utils/logger'
import AccordionPaymentSchedule from '../../../simple-components/AccordionPaymentSchedule'
import Button from '../../../simple-components/Button'
import ClipboardCopy from '../../../simple-components/ClipboardCopy'
import TaxFooter from './TaxFooter'

interface PaymentDataProps {
  tax: Tax
}

const PaymentData = ({ tax }: PaymentDataProps) => {
  const { t } = useTranslation('account')
  const status = taxStatusHelper(tax)
  const router = useRouter()

  const qrCodeBase64 = `data:image/png;base64,${tax?.qrCodeWeb}`

  const downloadImage = () => {
    const a = document.createElement('a')
    a.href = qrCodeBase64
    a.download = 'QR-dan-z-nehnutelnosti.png'
    a.click()
  }

  const redirectToPaymentGateway = async () => {
    try {
      const result = await getPaymentGatewayUrlApi()
      const resultUrl = result?.url
      if (typeof resultUrl === 'string') {
        await router.push(resultUrl)
      } else {
        logger.error(result)
        throw new Error('Payment gateway url is not defined')
      }
    } catch (error) {
      logger.error(error)
    }
  }

  return (
    <div className="flex w-full flex-col items-start gap-3 px-4 lg:gap-6 lg:px-0">
      <div className="text-h3">{t('payment_data')}</div>
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-col-reverse gap-6 md:flex-row lg:gap-8">
          <div className="flex w-full flex-col gap-5 rounded-lg border-0 border-solid border-gray-200 p-0 sm:border-2 sm:px-6 sm:py-5 md:w-[488px]">
            <div className="text-p2">{t('use_one_of_ibans_to_pay')}</div>
            {status?.paymentStatus !== 'paid' ? (
              <div className="text-p2 rounded-5 bg-warning-100 p-3">
                {t('tax_bank_transfer_slow_info')}
              </div>
            ) : null}
            <div className="flex flex-col items-start gap-4">
              <div className="isolate flex flex-col items-start gap-1 self-stretch">
                <div className="text-p2">{t('bank_info.slovak_sporitelna')}</div>
                <div className="flex w-full">
                  <div className="text-16-semibold grow">
                    {t('bank_info.slovak_sporitelna_iban')}
                  </div>
                  <div className="hidden h-6 w-6 cursor-pointer sm:block">
                    <ClipboardCopy copyText={t('bank_info.slovak_sporitelna_iban')} />
                  </div>
                </div>
              </div>
              <div className="hidden h-0.5 w-full bg-gray-200 sm:block" />
              <div className="isolate flex flex-col items-start gap-1 self-stretch">
                <div className="text-p2">{t('bank_info.csob')}</div>
                <div className="flex w-full">
                  <div className="text-16-semibold grow">{t('bank_info.csob_iban')}</div>
                  <div className="hidden h-6 w-6 cursor-pointer sm:block">
                    <ClipboardCopy copyText={t('bank_info.csob_iban')} />
                  </div>
                </div>
              </div>
              <div className="hidden h-0.5 w-full bg-gray-200 sm:block" />
              <div className="flex flex-col items-start gap-2">
                <div className="flex flex-col items-start self-stretch lg:flex-row lg:gap-6">
                  <div className="text-16-semibold">{t('constant_symbol')}</div>
                  <div className="text-16">{t('constant_symbol_number')}</div>
                </div>
                <div className="flex flex-col items-start self-stretch lg:flex-row lg:gap-6">
                  <div className="text-16-semibold">{t('variable_symbol')}</div>
                  <div className="text-16">{tax?.variableSymbol}</div>
                </div>
              </div>
              <div className="hidden h-0.5 w-full bg-gray-200 sm:block" />
              <div className="flex w-full flex-col items-start gap-2">
                <div className="text-16-semibold">{t('tax_due')}</div>
                <div className="text-16">
                  {tax?.taxInstallments?.length > 1 ? (
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
            <div className="flex w-full flex-col items-start gap-6 rounded-lg bg-main-200 p-4 lg:flex-row lg:items-center lg:px-6 lg:py-8">
              <div className="flex grow flex-col items-start gap-2">
                <div className="text-h4">{t('card_payment')}</div>
                <div className="text-16">{t('you_will_be_redirected_to_the_payment_gateway')}</div>
              </div>
              {/* Desktop 'To pay' button */}
              <Button
                variant="category"
                size="lg"
                text={t('to_pay')}
                className="hidden min-w-max lg:block"
                onPress={redirectToPaymentGateway}
                disabled={status?.paymentStatus !== 'unpaid'}
              />
              {/* Mobile 'To pay' button */}
              <Button
                variant="category"
                size="sm"
                text={t('to_pay')}
                className="block min-w-full lg:hidden"
                onPress={redirectToPaymentGateway}
                disabled={status?.paymentStatus !== 'unpaid'}
              />
            </div>
            <div className="flex grow flex-col gap-4 self-stretch rounded-lg border-2 border-solid border-gray-200 p-4 lg:flex-row lg:p-6">
              <div className="flex w-full grow flex-col items-start justify-between gap-2 self-stretch">
                <div className="flex flex-col items-start gap-2">
                  <div className="text-h4">{t('qr_code')}</div>
                  <div className="text-16">{t('use_your_banking_app_to_load')}</div>
                </div>
                {/* Desktop 'download' button */}
                <Button
                  startIcon={<DownloadIcon className="h-5 w-5" />}
                  variant="black-outline"
                  text={t('download_image')}
                  size="sm"
                  className="hidden lg:block"
                  onPress={downloadImage}
                />
              </div>
              <img
                className="flex aspect-square max-h-max max-w-full items-center justify-center self-center bg-[red] sm:max-h-[256px] sm:max-w-[256px]"
                src={qrCodeBase64}
                alt="QR code"
              />

              {/* Mobile 'download' button */}
              <Button
                startIcon={<DownloadIcon className="h-5 w-5" />}
                variant="black-outline"
                text={t('download_image')}
                size="sm"
                className="block min-w-full lg:hidden"
                onPress={downloadImage}
              />
            </div>
          </div>
        </div>
        {status.hasMultipleInstallments && (
          <AccordionPaymentSchedule size="md" title={t('payment_schedule.title')} tax={tax} />
        )}
      </div>
      <TaxFooter />
    </div>
  )
}

export default PaymentData
