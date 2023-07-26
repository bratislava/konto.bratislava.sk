import {
  CheckIcon,
  ChevronLeftIcon,
  ClockIcon,
  DownloadIcon,
  ErrorIcon,
  PaymentIcon,
} from '@assets/ui-icons'
import cx from 'classnames'
import { getAccessTokenOrLogout } from 'frontend/utils/amplify'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

import { environment } from '../../../../environment'
import { getPaymentGatewayUrlApi } from '../../../../frontend/api/api'
import { ROUTES } from '../../../../frontend/api/constants'
import { Tax } from '../../../../frontend/dtos/taxDto'
import { formatCurrency, formatDate, taxStatusHelper } from '../../../../frontend/utils/general'
import logger from '../../../../frontend/utils/logger'
import Button from '../../simple-components/Button'

interface AccountSectionHeaderBase {
  tax: Tax
}

// https://stackoverflow.com/questions/32545632/how-can-i-download-a-file-using-window-fetch
const downloadPdf = async () => {
  const accessToken = await getAccessTokenOrLogout()
  return fetch(`${String(environment.taxesUrl)}/tax/get-tax-pdf-by-year?year=2023`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((res) => res.blob())
    .then((blob) => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.setAttribute('download', 'dan-z-nehnutelnosti-2023.pdf')
      a.click()
      return null
    })
    .catch((error) => {
      logger.error('Error downloading pdf', error)
    })
}

const statusHandler = (status: 'negative' | 'warning' | 'success', text: string): ReactNode => {
  const statusStyle: string = cx('lg:text-p2-semibold text-p3-semibold', {
    'text-negative-700': status === 'negative',
    'text-warning-700': status === 'warning',
    'text-success-700': status === 'success',
  })
  const statusNode = (icon: ReactNode, statusTitle: string): ReactNode => {
    return (
      <>
        <span className="flex h-6 w-6 items-center justify-center">{icon}</span>
        <span className={statusStyle}>{statusTitle}</span>
      </>
    )
  }

  switch (status) {
    case 'negative':
      return statusNode(<ErrorIcon className="h-6 w-6 text-negative-700" />, text)
    case 'warning':
      return statusNode(<ClockIcon className="h-6 w-6 text-warning-700" />, text)
    case 'success':
      return statusNode(<CheckIcon className="h-6 w-6 text-success-700" />, text)

    default:
      return null
  }
}

const TaxFeeSectionHeader = ({ tax }: AccountSectionHeaderBase) => {
  const { t } = useTranslation('account')
  const router = useRouter()

  const status = taxStatusHelper(tax)

  const redirectToPaymentGateway = async () => {
    try {
      const result = await getPaymentGatewayUrlApi()
      const resultUrl = result.url
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
    <div className="h-full bg-gray-50 px-4 lg:px-0">
      <div className="m-auto flex max-w-screen-lg flex-col gap-4 py-6">
        <div className="flex cursor-pointer items-center gap-0.5">
          <div className="flex h-5 w-5 items-center justify-center">
            <ChevronLeftIcon className="h-5 w-5" />
          </div>
          <button
            type="button"
            className="text-p3-medium underline underline-offset-2"
            onClick={() => router.push(ROUTES.TAXES_AND_FEES)}
          >
            {t('back_to_list')}
          </button>
        </div>
        <div className="flex h-full w-full flex-col items-start gap-2">
          <div className="flex h-full w-full flex-col items-start gap-4">
            <div className="flex w-full flex-row items-center gap-4">
              <div className="text-h1 grow">
                {t('tax_detail_section.title', { year: tax?.year })}
              </div>

              {status.paymentStatus === 'unpaid' && (
                <Button
                  startIcon={<PaymentIcon fill="white" className="h-6 w-6" />}
                  variant="black"
                  text={t('pay_tax')}
                  size="sm"
                  className="hidden md:block"
                  onPress={redirectToPaymentGateway}
                />
              )}
              <Button
                startIcon={<DownloadIcon className="h-5 w-5" />}
                variant="black-outline"
                text={t('download_pdf')}
                size="sm"
                className="hidden md:block"
                onPress={downloadPdf}
              />
            </div>
            <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-4">
              <div className="flex gap-2">
                <div className="lg:text-p2-semibold text-p3-semibold">{t('tax_created')}</div>
                <div className="lg:text-p2 text-p3">{formatDate(tax?.createdAt)}</div>
              </div>
              <div className="hidden h-1.5 w-1.5 rounded-full bg-black md:block" />
              <div className="lg:text-p2-bold text-p3">
                {formatCurrency(tax.amount)}
                {status.paymentStatus === 'partially_paid' ? (
                  <span className="lg:text-p2 text-p-3">
                    {' '}
                    {t('tax_detail_section.tax_remainder_text', {
                      amount: formatCurrency(tax.amount - tax.payedAmount),
                    })}
                  </span>
                ) : null}
              </div>
              <div className="hidden h-1.5 w-1.5 rounded-full bg-black md:block" />
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
                    startIcon={<PaymentIcon className="h-5 w-5" />}
                    variant="black"
                    text={t('pay_tax')}
                    size="sm"
                    className="min-w-full"
                    onPress={redirectToPaymentGateway}
                  />
                )}
                <Button
                  startIcon={<DownloadIcon className="h-5 w-5" />}
                  variant="black-outline"
                  text={t('download_pdf')}
                  size="sm"
                  className="min-w-full"
                  onPress={downloadPdf}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxFeeSectionHeader
