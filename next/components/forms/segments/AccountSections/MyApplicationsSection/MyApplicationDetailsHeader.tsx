import { CheckIcon, ChevronLeftIcon, ClockIcon, CrossIcon, DownloadIcon } from '@assets/ui-icons'
import cx from 'classnames'
import Button from 'components/forms/simple-components/Button'
import { MyApplicationsSentCardBase } from 'frontend/api/mocks/mocks'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

type MyApplicationDetailsHeaderBase = {
  data?: MyApplicationsSentCardBase
}

const MyApplicationDetailsHeader = (props: MyApplicationDetailsHeaderBase) => {
  const { data } = props
  const { t } = useTranslation('account')

  const statusHandler = (status?: 'negative' | 'warning' | 'success'): ReactNode => {
    const statusStyle: string = cx('text-p3-semibold lg:text-16-semibold w-max', {
      'text-negative-700': status === 'negative',
      'text-warning-700': status === 'warning' || !status,
      'text-success-700': status === 'success',
    })
    const statusNode = (icon: ReactNode, statusTitle: string): ReactNode => {
      return (
        <>
          <span className="flex items-center justify-center">{icon}</span>
          <span className={statusStyle}>{statusTitle}</span>
        </>
      )
    }

    switch (status) {
      case 'negative':
        return statusNode(
          <CrossIcon className="h-5 w-5 text-negative-700 lg:h-6 lg:w-6" />,
          t('account_section_applications.status.negative'),
        )
      case 'warning':
        return statusNode(
          <ClockIcon className="h-5 w-5 text-warning-700 lg:h-6 lg:w-6" />,
          t('account_section_applications.status.warning'),
        )
      case 'success':
        return statusNode(
          <CheckIcon className="h-5 w-5 text-success-700 lg:h-6 lg:w-6" />,
          t('account_section_applications.status.success'),
        )
      default:
        break
    }

    return null
  }

  return (
    <div className="bg-gray-50">
      <div className="m-auto flex h-full w-full max-w-screen-lg flex-col justify-end gap-4 py-4 lg:gap-6 lg:px-0 lg:py-8">
        <div className="flex flex-col gap-4 px-4 lg:gap-6 lg:px-0">
          <Link href="/moje-ziadosti" className="flex w-max items-center gap-1">
            <ChevronLeftIcon className="h-5 w-5" />
            <span className="text-p3-medium underline underline-offset-2">{t('back_to_list')}</span>
          </Link>
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-p2-semibold text-main-700">{data?.category}</p>
              <div className="flex w-full items-center justify-between">
                <h1 className="text-h1">{data?.title}</h1>
                <Button
                  className="hidden md:flex"
                  startIcon={<DownloadIcon className="h-6 w-6" />}
                  text={t('download_pdf')}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-4">
              <div className="flex items-center gap-3">
                <p className="text-p3-semibold lg:text-p2-semibold">
                  {t('account_section_applications.navigation_sent')}
                </p>
                <p className="text-p3 lg:text-p2">{data?.sentDate}</p>
              </div>
              <span className="hidden h-1.5 w-1.5 rounded-full bg-gray-700 lg:block" />
              <div className="flex items-center gap-1">{statusHandler(data?.status)}</div>
              <span className="hidden h-1.5 w-1.5 rounded-full bg-gray-700 lg:block" />
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
              startIcon={<DownloadIcon className="h-6 w-6" />}
              text={t('download_pdf')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyApplicationDetailsHeader
