import ChevronLeftIcon from '@assets/images/new-icons/ui/chevron-left.svg'
import TimeIcon from '@assets/images/new-icons/ui/clock.svg'
import CrossIcon from '@assets/images/new-icons/ui/cross.svg'
import SuccessIcon from '@assets/images/new-icons/ui/done.svg'
import DownloadIcon from '@assets/images/new-icons/ui/download.svg'
import cx from 'classnames'
import Button from 'components/forms/simple-components/Button'
import { MyApplicationsSentCardBase } from 'frontend/api/mocks/mocks'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

type MyApplicationDetailsHeaderBase = {
  data: MyApplicationsSentCardBase
}

const MyApplicationDetailsHeader = (props: MyApplicationDetailsHeaderBase) => {
  const { data } = props
  const { t } = useTranslation('account')

  const statusHandler = (status: 'negative' | 'warning' | 'success'): ReactNode => {
    const statusStyle: string = cx('text-p3-semibold lg:text-16-semibold w-max', {
      'text-negative-700': status === 'negative',
      'text-warning-700': status === 'warning',
      'text-success-700': status === 'success',
    })
    const statusNode = (icon: ReactNode, statusTitle: string): ReactNode => {
      return (
        <>
          <span className="flex justify-center items-center">{icon}</span>
          <span className={statusStyle}>{statusTitle}</span>
        </>
      )
    }

    switch (status) {
      case 'negative':
        return statusNode(
          <CrossIcon className="text-negative-700 lg:w-6 lg:h-6 h-5 w-5" />,
          t('account_section_applications.status.negative'),
        )
      case 'warning':
        return statusNode(
          <TimeIcon className="text-warning-700 lg:w-6 lg:h-6 h-5 w-5" />,
          t('account_section_applications.status.warning'),
        )
      case 'success':
        return statusNode(
          <SuccessIcon className="text-success-700 lg:w-6 lg:h-6 h-5 w-5" />,
          t('account_section_applications.status.success'),
        )
      default:
        break
    }

    return null
  }

  return (
    <div className="bg-gray-50">
      <div className="py-4 lg:py-8 flex flex-col justify-end gap-4 lg:gap-6 w-full h-full max-w-screen-lg m-auto lg:px-0">
        <div className="flex flex-col gap-4 lg:gap-6 px-4 lg:px-0">
          <Link href="/moje-ziadosti" className="w-max flex items-center gap-1">
            <ChevronLeftIcon className="w-5 h-5" />
            <span className="text-p3-medium underline-offset-2 underline">{t('back_to_list')}</span>
          </Link>
          <div className="gap-4 flex flex-col lg:gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-p2-semibold text-main-700">{data?.category}</p>
              <div className="w-full flex items-center justify-between">
                <h1 className="text-h1">{data?.title}</h1>
                <Button
                  className="hidden md:flex"
                  startIcon={<DownloadIcon className="w-6 h-6" />}
                  text={t('download_pdf')}
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-4">
              <div className="flex items-center gap-3">
                <p className="text-p3-semibold lg:text-p2-semibold">
                  {t('account_section_applications.navigation_sent')}
                </p>
                <p className="text-p3 lg:text-p2">{data?.sentDate}</p>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-700 hidden lg:block" />
              <div className="flex items-center gap-1">{statusHandler(data?.status)}</div>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-700 hidden lg:block" />
              <div className="flex items-center gap-1">
                <p className="text-p3 lg:text-p2">
                  {t('account_section_applications.last_change')}
                </p>
                <p className="text-p3 lg:text-p2">{data?.statusDate}</p>
              </div>
            </div>
            <Button
              fullWidth
              className="flex md:hidden"
              startIcon={<DownloadIcon className="w-6 h-6" />}
              text={t('download_pdf')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyApplicationDetailsHeader
