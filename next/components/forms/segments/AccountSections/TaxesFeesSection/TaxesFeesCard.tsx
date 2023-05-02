import ChevronRightIcon from '@assets/images/new-icons/ui/chevron-right.svg'
import TimeIcon from '@assets/images/new-icons/ui/clock.svg'
import SuccessIcon from '@assets/images/new-icons/ui/done.svg'
import ExclamationIcon from '@assets/images/new-icons/ui/exclamation-mark.svg'
import { ROUTES } from '../../../../../frontend/constants'
import { formatCurrency, formatDate } from '../../../../../frontend/utils'
import cx from 'classnames'
import { TaxesCardBase } from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesSection'
import Link from 'next/link'
import { ReactNode } from 'react'

const TaxesFeesCard = (props: TaxesCardBase) => {
  const { title, yearPay, createDate, currentPaid, finishPrice, paidDate = '', status } = props

  const statusHandler = (): ReactNode => {
    const statusStyle: string = cx('text-p3-semibold lg:text-16-semibold w-max ml-0 lg:ml-2', {
      'text-negative-700': status === 'unpaid',
      'text-warning-700': status === 'partially_paid',
      'text-success-700': status === 'paid',
    })
    const statusNode = (icon: ReactNode, statusTitle: string): ReactNode => {
      return (
        <>
          <span className="h-6 w-6 hidden lg:flex justify-center items-center">{icon}</span>
          <span className={statusStyle}>{statusTitle}</span>
        </>
      )
    }

    switch (status) {
      case 'unpaid':
        return statusNode(<ExclamationIcon className="text-negative-700 w-6 h-6" />, 'Neuhradená')
      case 'partially_paid':
        return statusNode(<TimeIcon className="text-warning-700 w-6 h-6" />, 'Čiastočne uhradená')
      case 'paid':
        return statusNode(<SuccessIcon className="text-success-700 w-6 h-6" />, 'Uhradená')
      default:
        break
    }
    return null
  }

  return (
    <Link href={`${ROUTES.TAXES_AND_FEES}/2023`}>
      {/* Desktop */}
      <div
        id="desktop-card"
        className="rounded-lg bg-white w-full h-[104px] lg:flex hidden items-center justify-between border-2 border-gray-200"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-full flex flex-col pl-6">
            <span className="text-20-semibold mb-1">{title}</span>
            <span className="text-p3">{`za rok ${yearPay}`}</span>
          </div>
          <div className="w-full justify-end flex items-center">
            <div className="flex flex-col px-10">
              <span className="text-16-semibold mb-1">Vytvorená</span>
              <span className="w-max">{createDate}</span>
            </div>
            <div className="flex flex-col px-10 border-x-2">
              <span className="text-16-semibold mb-1">Suma</span>
              {status === 'partially_paid' && currentPaid ? (
                <span className="w-max flex items-center">{`${formatCurrency(
                  currentPaid,
                )} / ${formatCurrency(finishPrice)}`}</span>
              ) : (
                <span>{formatCurrency(finishPrice)}</span>
              )}
            </div>
            <div className="flex flex-col items-center px-10">
              <div className="flex">{statusHandler()}</div>
              {status !== 'unpaid' && paidDate && <span className="">{formatDate(paidDate)}</span>}
            </div>
          </div>
        </div>
        <div className="cursor-pointer w-16 min-w-[64px] h-full border-l-2">
          <div className="w-full h-full items-center flex justify-center">
            <ChevronRightIcon />
          </div>
        </div>
      </div>
      {/* Mobile */}
      <div
        id="mobile-card"
        className="bg-white w-full h-24 flex lg:hidden items-center justify-between border-b-2 border-gray-200"
      >
        <Link
          href={`${ROUTES.TAXES_AND_FEES}/2023`}
          className="w-full h-full items-center flex justify-center"
        >
          <div className="w-full flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-p2-semibold leading-5 mb-1">{`${title} za rok ${yearPay}`}</span>
              <div className="flex items-center flex-wrap">
                {status === 'partially_paid' && currentPaid ? (
                  <span className="text-p3 w-max flex items-center">{`${formatCurrency(
                    currentPaid,
                  )} / ${formatCurrency(finishPrice)}`}</span>
                ) : (
                  <span className="text-p3">{formatCurrency(finishPrice)}</span>
                )}
                <div className="flex items-center">
                  <span className="rounded-full w-1 h-1 bg-gray-700 mx-3" />
                  <div className="flex">{statusHandler()}</div>
                </div>
              </div>
            </div>
            <span className="h-5 w-5 flex justify-center items-center">
              <ChevronRightIcon />
            </span>
          </div>
        </Link>
      </div>
    </Link>
  )
}

export default TaxesFeesCard
