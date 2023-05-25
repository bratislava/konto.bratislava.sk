import ChevronRightIcon from '@assets/images/new-icons/ui/chevron-right.svg'
import TimeIcon from '@assets/images/new-icons/ui/clock.svg'
import CrossIcon from '@assets/images/new-icons/ui/cross.svg'
import SuccessIcon from '@assets/images/new-icons/ui/done.svg'
import NegativeMobileIcon from '@assets/images/new-icons/ui/negative-icon.svg'
import SuccessMobileIcon from '@assets/images/new-icons/ui/success-icon.svg'
import WaitingMobileIcon from '@assets/images/new-icons/ui/waiting-icon.svg'
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
          <span className="h-6 w-6 hidden lg:flex justify-center items-center">{icon}</span>
          <span className={statusStyle}>{statusTitle}</span>
        </>
      )
    }

    switch (data?.status) {
      case 'negative':
        return statusNode(
          <CrossIcon className="text-negative-700 w-6 h-6" />,
          t('account_section_applications.status.negative'),
        )
      case 'warning':
        return statusNode(
          <TimeIcon className="text-warning-700 w-6 h-6" />,
          t('account_section_applications.status.warning'),
        )
      case 'success':
        return statusNode(
          <SuccessIcon className="text-success-700 w-6 h-6" />,
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
        className={cx('w-8 h-8 rounded-full flex justify-center items-center', {
          'bg-negative-50': data?.status === 'negative',
          'bg-warning-50': data?.status === 'warning',
          'bg-success-50': data?.status === 'success',
        })}
      >
        {data?.status === 'negative' && (
          <NegativeMobileIcon className="w-5 h-5 text-negative-700" />
        )}
        {data?.status === 'warning' && <WaitingMobileIcon className="w-5 h-5 text-warning-700" />}
        {data?.status === 'success' && <SuccessMobileIcon className="w-5 h-5 text-success-700" />}
      </span>
    )
  }

  return (
    <>
      {/* Desktop */}
      <Link
        href={`${ROUTES.MY_APPLICATIONS}/1`}
        className="w-full h-full items-center flex justify-center"
      >
        <div
          id="desktop-card"
          className="rounded-lg bg-white w-full h-[124px] lg:flex hidden items-center justify-between border-2 border-gray-200 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-full flex flex-col gap-1 pl-6">
              <span className="text-p3-semibold text-main-700">{data?.category}</span>
              <span className="text-20-semibold">{data?.title}</span>
              <span className="text-p3">{data?.subtitle}</span>
            </div>
            <div className="w-full justify-end flex items-center gap-6">
              <div className="flex flex-col w-full max-w-[200px]">
                <span className="text-16-semibold mb-1">
                  {t('account_section_applications.navigation_sent')}
                </span>
                <span className="w-max">{data?.sentDate}</span>
              </div>
              <div className="flex flex-col gap-1 mr-6 w-full max-w-[200px]">
                <div className="flex">{desktopStatusHandler()}</div>
                {data?.status !== 'warning' && data?.statusDate && (
                  <span className="pl-8">{data?.statusDate}</span>
                )}
              </div>
            </div>
          </div>
          <div className="w-16 min-w-[64px] h-full border-l-2">
            <span className="w-full h-full items-center flex justify-center">
              <ChevronRightIcon />
            </span>
          </div>
        </div>
      </Link>
      {/* Mobile */}
      <div
        id="mobile-card"
        className="bg-white w-full h-[88px] max-[389px]:h-[92px] flex lg:hidden items-center justify-between border-b-2 border-gray-200"
      >
        <Link
          href={`${ROUTES.MY_APPLICATIONS}/1`}
          className="w-full h-full items-center flex justify-center"
        >
          <div className="w-full flex items-start justify-between">
            <div className="flex flex-col w-full max-[389px]:gap-1">
              <div className="flex items-center justify-between">
                <span className="text-p3-semibold max-[389px]:max-w-[220px] text-main-700">
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
