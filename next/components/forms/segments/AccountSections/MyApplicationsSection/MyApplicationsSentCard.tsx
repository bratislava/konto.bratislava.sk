import { CheckIcon, ChevronRightIcon, ClockIcon, CrossIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { MyApplicationsSentCardBase } from 'frontend/api/mocks/mocks'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

import { ROUTES } from '../../../../../frontend/api/constants'

type MyApplicationsSentCardProps = {
  data: MyApplicationsSentCardBase
}

const MyApplicationsSentCard = (props: MyApplicationsSentCardProps) => {
  const { data } = props
  const { t } = useTranslation('account')

  const desktopStatusHandler = (): ReactNode => {
    const statusStyle: string = cx('text-p3-semibold lg:text-16-semibold w-max ml-0 lg:ml-2', {
      'text-negative-700': data?.status === 'negative',
      'text-warning-700': data?.status === 'warning',
      'text-success-700': data?.status === 'success',
    })
    const statusNode = (icon: ReactNode, statusTitle: string): ReactNode => {
      return (
        <>
          <span className="hidden h-6 w-6 items-center justify-center lg:flex">{icon}</span>
          <span className={statusStyle}>{statusTitle}</span>
        </>
      )
    }

    switch (data?.status) {
      case 'negative':
        return statusNode(
          <CrossIcon className="h-6 w-6 text-negative-700" />,
          t('account_section_applications.status.negative'),
        )
      case 'warning':
        return statusNode(
          <ClockIcon className="h-6 w-6 text-warning-700" />,
          t('account_section_applications.status.warning'),
        )
      case 'success':
        return statusNode(
          <CheckIcon className="h-6 w-6 text-success-700" />,
          t('account_section_applications.status.success'),
        )
      default:
        break
    }

    return null
  }

  const mobileStatusHandler = (): ReactNode => {
    return (
      <span
        className={cx('flex h-8 w-8 items-center justify-center rounded-full', {
          'bg-negative-50': data?.status === 'negative',
          'bg-warning-50': data?.status === 'warning',
          'bg-success-50': data?.status === 'success',
        })}
      >
        {data?.status === 'negative' && <CrossIcon className="h-5 w-5 text-negative-700" />}
        {data?.status === 'warning' && <ClockIcon className="h-5 w-5 text-warning-700" />}
        {data?.status === 'success' && <CheckIcon className="h-5 w-5 text-success-700" />}
      </span>
    )
  }

  return (
    <>
      {/* Desktop */}
      <Link
        href={`${ROUTES.MY_APPLICATIONS}/1`}
        className="flex h-full w-full items-center justify-center"
      >
        <div
          id="desktop-card"
          className="hidden h-[124px] w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white lg:flex"
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex w-full flex-col gap-1 pl-6">
              <span className="text-p3-semibold text-main-700">{data?.category}</span>
              <span className="text-20-semibold">{data?.title}</span>
              <span className="text-p3">{data?.subtitle}</span>
            </div>
            <div className="flex w-full items-center justify-end gap-6">
              <div className="flex w-full max-w-[200px] flex-col">
                <span className="text-16-semibold mb-1">
                  {t('account_section_applications.navigation_sent')}
                </span>
                <span className="w-max">{data?.sentDate}</span>
              </div>
              <div className="mr-6 flex w-full max-w-[200px] flex-col gap-1">
                <div className="flex">{desktopStatusHandler()}</div>
                {data?.status !== 'warning' && data?.statusDate && (
                  <span className="pl-8">{data?.statusDate}</span>
                )}
              </div>
            </div>
          </div>
          <div className="h-full w-16 min-w-[64px] border-l-2">
            <span className="flex h-full w-full items-center justify-center">
              <ChevronRightIcon />
            </span>
          </div>
        </div>
      </Link>
      {/* Mobile */}
      <div
        id="mobile-card"
        className="flex h-[88px] w-full items-center justify-between border-b-2 border-gray-200 bg-white max-[389px]:h-[92px] lg:hidden"
      >
        <Link
          href={`${ROUTES.MY_APPLICATIONS}/1`}
          className="flex h-full w-full items-center justify-center"
        >
          <div className="flex w-full items-start justify-between">
            <div className="flex w-full flex-col max-[389px]:gap-1">
              <div className="flex items-center justify-between">
                <span className="text-p3-semibold text-main-700 max-[389px]:max-w-[220px]">
                  {data?.category}
                </span>
                <span>{mobileStatusHandler()}</span>
              </div>
              <span className="text-p2-semibold leading-5 max-[389px]:max-w-[220px]">
                {data?.title}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </>
  )
}

export default MyApplicationsSentCard
