import {
  CheckIcon,
  ChevronLeftIcon,
  ClockIcon,
  DownloadIcon,
  ErrorIcon,
  PaymentIcon,
} from '@assets/ui-icons'
import cx from 'classnames'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

import { ROUTES } from '../../../../frontend/api/constants'
import {
  FormatCurrencyFromCents,
  useCurrencyFromCentsFormatter,
} from '../../../../frontend/utils/formatCurrency'
import { formatDate, taxStatusHelper } from '../../../../frontend/utils/general'
import Button from '../../simple-components/Button'
import { useTaxFeeSection } from '../AccountSections/TaxesFeesSection/useTaxFeeSection'

const statusHandler = (status: 'negative' | 'warning' | 'success', text: string): ReactNode => {
  const statusStyle: string = cx('lg:text-p2-semibold text-p3-semibold', {
    'text-negative-700': status === 'negative',
    'text-warning-700': status === 'warning',
    'text-success-700': status === 'success',
  })
  const statusNode = (icon: ReactNode, statusTitle: string): ReactNode => {
    return (
      <>
        <span className="flex size-6 items-center justify-center">{icon}</span>
        <span className={statusStyle}>{statusTitle}</span>
      </>
    )
  }

  switch (status) {
    case 'negative':
      return statusNode(<ErrorIcon className="size-6 text-negative-700" />, text)
    case 'warning':
      return statusNode(<ClockIcon className="size-6 text-warning-700" />, text)
    case 'success':
      return statusNode(<CheckIcon className="size-6 text-success-700" />, text)

    default:
      return null
  }
}

const TaxFeeSectionHeader = () => {
  const { taxData, redirectToPayment, downloadPdf } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const router = useRouter()

  const currencyFromCentsFormatter = useCurrencyFromCentsFormatter()
  const status = taxStatusHelper(taxData)

  return (
    <div className="h-full bg-gray-50 px-4 lg:px-0">
      <div className="m-auto flex max-w-screen-lg flex-col gap-4 py-6">
        <div className="flex cursor-pointer items-center gap-0.5">
          <div className="flex size-5 items-center justify-center">
            <ChevronLeftIcon className="size-5" />
          </div>
          <button
            type="button"
            className="text-p3-medium underline underline-offset-2"
            onClick={() => router.push(ROUTES.TAXES_AND_FEES)}
          >
            {t('back_to_list')}
          </button>
        </div>
        <div className="flex size-full flex-col items-start gap-2">
          <div className="flex size-full flex-col items-start gap-4">
            <div className="flex w-full flex-row items-center gap-4">
              <div className="text-h1 grow">
                {t('tax_detail_section.title', { year: taxData?.year })}
              </div>

              {status.paymentStatus === 'unpaid' && (
                <Button
                  startIcon={<PaymentIcon fill="white" className="size-6" />}
                  variant="black"
                  text={t('pay_tax')}
                  size="sm"
                  className="hidden md:block"
                  onPress={redirectToPayment}
                />
              )}
              {taxData.pdfExport && (
                <Button
                  startIcon={<DownloadIcon className="size-5" />}
                  variant="black-outline"
                  text={t('download_pdf')}
                  size="sm"
                  className="hidden md:block"
                  onPress={downloadPdf}
                />
              )}
            </div>
            <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-4">
              <div className="flex gap-2">
                <div className="lg:text-p2-semibold text-p3-semibold">{t('tax_created')}</div>
                <div className="lg:text-p2 text-p3">{formatDate(taxData?.createdAt)}</div>
              </div>
              <div className="hidden size-1.5 rounded-full bg-black md:block" />
              <div className="lg:text-p2-bold text-p3">
                <FormatCurrencyFromCents value={taxData.amount} />
                {status.paymentStatus === 'partially_paid' ? (
                  <span className="lg:text-p2 text-p-3">
                    {t('tax_detail_section.tax_remainder_text', {
                      amount: currencyFromCentsFormatter.format(
                        taxData.amount - taxData.payedAmount,
                      ),
                    })}
                  </span>
                ) : null}
              </div>
              <div className="hidden size-1.5 rounded-full bg-black md:block" />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cx('flex items-center gap-2', {
                      'gap-1': status.paymentStatus === 'unpaid',
                    })}
                  >
                    {status.paymentStatus === 'unpaid'
                      ? statusHandler('negative', t('tax_detail_section.tax_status.negative'))
                      : status.paymentStatus === 'partially_paid'
                        ? statusHandler('warning', t('tax_detail_section.tax_status.warning'))
                        : statusHandler('success', t('tax_detail_section.tax_status.success'))}
                  </div>
                  {/* <div className="lg:text-p2 text-p3">{formatDate(tax?.updatedAt)}</div> */}
                </div>
              </div>
            </div>

            {/* for mobile version */}
            <div className="block w-full md:hidden">
              <div className="flex flex-col gap-3">
                {status.paymentStatus === 'unpaid' && (
                  <Button
                    startIcon={<PaymentIcon className="size-5" />}
                    variant="black"
                    text={t('pay_tax')}
                    size="sm"
                    className="min-w-full"
                    onPress={redirectToPayment}
                  />
                )}
                {taxData.pdfExport && (
                  <Button
                    startIcon={<DownloadIcon className="size-5" />}
                    variant="black-outline"
                    text={t('download_pdf')}
                    size="sm"
                    className="min-w-full"
                    onPress={downloadPdf}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxFeeSectionHeader
