import ChevronLeft from '@assets/images/new-icons/ui/chevron-left.svg'
import TimeIcon from '@assets/images/new-icons/ui/clock.svg'
import SuccessIcon from '@assets/images/new-icons/ui/done.svg'
import FileDownload from '@assets/images/new-icons/ui/download.svg'
import ExclamationIcon from '@assets/images/new-icons/ui/exclamation-mark.svg'
import PaymentIcon from '@assets/images/new-icons/ui/payment.svg'
import { ROUTES } from '@utils/constants'
import cx from 'classnames'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

import Button from '../../simple-components/Button'

type AccountSectionHeaderBase = {
  title: string
  status?: string
  // TODO temp only for testing, remove the prop once server integration is ready
  who?: string
}

const statusHandler = (status: 'negative' | 'warning' | 'success'): ReactNode => {
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
      return statusNode(<ExclamationIcon className="text-negative-700 w-6 h-6" />, 'Neuhradená')
    case 'warning':
      return statusNode(<TimeIcon className="text-warning-700 w-6 h-6" />, 'Čiastočne uhradená')
    case 'success':
      return statusNode(<SuccessIcon className="text-success-700 w-6 h-6" />, 'Uhradená')

    default:
      return null
  }
}

const TaxFeeSectionHeader = (props: AccountSectionHeaderBase) => {
  const { t } = useTranslation('account')
  const router = useRouter()
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
              <div className="text-h1 grow">Daň z nehnuteľností za rok 2023</div>

              <Button
                startIcon={<PaymentIcon fill="white" className="w-6 h-6" />}
                variant="black"
                text={t('pay_tax')}
                size="sm"
                className="md:block hidden"
              />
              <Button
                startIcon={<FileDownload className="w-5 h-5" />}
                variant="black-outline"
                text={t('download_pdf')}
                size="sm"
                className="md:block hidden"
              />
            </div>
            <div className="flex md:flex-row flex-col md:items-center items-start md:gap-4 gap-1">
              <div className="flex gap-2">
                <div className="lg:text-p2-semibold text-p3-semibold">{t('tax_created')}</div>
                <div className="lg:text-p2 text-p3">20. apríla 2023</div>
              </div>
              <div className="w-1.5 h-1.5 bg-black rounded-full md:block hidden" />
              <div className="lg:text-p2-bold text-p3">
                {props.who === 'splatkar' ? '29,66€ / 89,00 €' : '58,00 €'}
              </div>
              <div className="w-1.5 h-1.5 bg-black rounded-full md:block hidden" />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cx('flex items-center gap-2', {
                      'gap-1': props?.status === 'unpaid',
                    })}
                  >
                    {props.who === 'splatkar' ? statusHandler('warning') : statusHandler('success')}
                  </div>
                  <div className="lg:text-p2 text-p3">24. apríla 2023</div>
                </div>
              </div>
            </div>

            {/* for mobile version */}
            <div className="w-full md:hidden block">
              <div className="flex flex-col gap-3">
                <Button
                  startIcon={<PaymentIcon className="w-5 h-5" />}
                  variant="black"
                  text={t('pay_tax')}
                  size="sm"
                  className="min-w-full"
                />
                <Button
                  startIcon={<FileDownload className="w-5 h-5" />}
                  variant="black-outline"
                  text={t('download_pdf')}
                  size="sm"
                  className="min-w-full"
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
