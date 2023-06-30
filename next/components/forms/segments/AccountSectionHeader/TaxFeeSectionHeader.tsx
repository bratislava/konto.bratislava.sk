import ChevronLeft from '@assets/images/new-icons/ui/chevron-left.svg'
import TimeIcon from '@assets/images/new-icons/ui/clock.svg'
import SuccessIcon from '@assets/images/new-icons/ui/done.svg'
import FileDownload from '@assets/images/new-icons/ui/download.svg'
import ExclamationIcon from '@assets/images/new-icons/ui/exclamation-mark.svg'
import PaymentIcon from '@assets/images/new-icons/ui/payment.svg'
import cx from 'classnames'
import { getAccessTokenOrLogout } from 'frontend/utils/amplify'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

import { getPaymentGatewayUrlApi } from '../../../../frontend/api/api'
import { ROUTES } from '../../../../frontend/api/constants'
import { Tax } from '../../../../frontend/dtos/taxDto'
import { formatCurrency, formatDate, taxStatusHelper } from '../../../../frontend/utils/general'
import logger from '../../../../frontend/utils/logger'
import Button from '../../simple-components/Button'

interface AccountSectionHeaderBase {
  tax: Tax
}

const downloadPdf = async () => {
  const accessToken = await getAccessTokenOrLogout()
  return fetch(`${String(process.env.NEXT_PUBLIC_TAXES_URL)}/tax/get-tax-pdf-by-year?year=2023`, {
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
        <span className="h-6 w-6 flex justify-center items-center">{icon}</span>
        <span className={statusStyle}>{statusTitle}</span>
      </>
    )
  }

  switch (status) {
    case 'negative':
      return statusNode(<ExclamationIcon className="text-negative-700 w-6 h-6" />, text)
    case 'warning':
      return statusNode(<TimeIcon className="text-warning-700 w-6 h-6" />, text)
    case 'success':
      return statusNode(<SuccessIcon className="text-success-700 w-6 h-6" />, text)

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

  // https://stackoverflow.com/questions/32545632/how-can-i-download-a-file-using-window-fetch

  return (
    <div className="lg:px-0 bg-gray-50 h-full px-4">
      <div className="flex flex-col py-6 gap-4 max-w-screen-lg m-auto">
        <div className="flex items-center gap-0.5 cursor-pointer">
          <div className="w-5 h-5 flex justify-center items-center">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <button
            type="button"
            className="text-p3-medium underline-offset-2 underline"
            onClick={() => router.push(ROUTES.TAXES_AND_FEES)}
          >
            {t('back_to_list')}
          </button>
        </div>
        <div className="flex flex-col items-start gap-2 w-full h-full">
          <div className="flex flex-col items-start gap-4 h-full w-full">
            <div className="flex flex-row items-center gap-4 w-full">
              <div className="text-h1 grow">
                {t('tax_detail_section.title', { year: tax?.year })}
              </div>

              {status.paymentStatus === 'unpaid' && (
                <Button
                  startIcon={<PaymentIcon fill="white" className="w-6 h-6" />}
                  variant="black"
                  text={t('pay_tax')}
                  size="sm"
                  className="md:block hidden"
                  onPress={redirectToPaymentGateway}
                />
              )}
              <Button
                startIcon={<FileDownload className="w-5 h-5" />}
                variant="black-outline"
                text={t('download_pdf')}
                size="sm"
                className="md:block hidden"
                onPress={downloadPdf}
              />
            </div>
            <div className="flex md:flex-row flex-col md:items-center items-start md:gap-4 gap-1">
              <div className="flex gap-2">
                <div className="lg:text-p2-semibold text-p3-semibold">{t('tax_created')}</div>
                <div className="lg:text-p2 text-p3">{formatDate(tax?.createdAt)}</div>
              </div>
              <div className="w-1.5 h-1.5 bg-black rounded-full md:block hidden" />
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
              <div className="w-1.5 h-1.5 bg-black rounded-full md:block hidden" />
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
            <div className="w-full md:hidden block">
              <div className="flex flex-col gap-3">
                {status.paymentStatus === 'unpaid' && (
                  <Button
                    startIcon={<PaymentIcon className="w-5 h-5" />}
                    variant="black"
                    text={t('pay_tax')}
                    size="sm"
                    className="min-w-full"
                    onPress={redirectToPaymentGateway}
                  />
                )}
                <Button
                  startIcon={<FileDownload className="w-5 h-5" />}
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
