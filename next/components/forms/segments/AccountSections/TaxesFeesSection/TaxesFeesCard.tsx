import { CheckIcon, ChevronRightIcon, ClockIcon, ErrorIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { TaxesCardBase } from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesSection'
import Link from 'next/link'
import { ReactNode } from 'react'

import { ROUTES } from '../../../../../frontend/api/constants'
import { formatCurrency, formatDate } from '../../../../../frontend/utils/general'

const TaxesFeesCard = (props: TaxesCardBase) => {
  const { title, yearPay, createDate, currentPaid, finishPrice, paidDate = '', status } = props

  const statusHandler = (): ReactNode => {
    const statusStyle: string = cx('text-p3-semibold lg:text-16-semibold ml-0 w-max lg:ml-2', {
      'text-negative-700': status === 'unpaid',
      'text-warning-700': status === 'partially_paid',
      'text-success-700': status === 'paid',
    })
    const statusNode = (icon: ReactNode, statusTitle: string): ReactNode => {
      return (
        <>
          <span className="hidden h-6 w-6 items-center justify-center lg:flex">{icon}</span>
          <span className={statusStyle}>{statusTitle}</span>
        </>
      )
    }

    switch (status) {
      case 'unpaid':
        return statusNode(<ErrorIcon className="h-6 w-6 text-negative-700" />, 'Neuhradená')
      case 'partially_paid':
        return statusNode(<ClockIcon className="h-6 w-6 text-warning-700" />, 'Čiastočne uhradená')
      case 'paid':
        return statusNode(<CheckIcon className="h-6 w-6 text-success-700" />, 'Uhradená')
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
        className="hidden h-[104px] w-full items-center justify-between rounded-lg border-2 border-gray-200 bg-white lg:flex"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full flex-col pl-6">
            <span className="text-20-semibold mb-1">{title}</span>
            <span className="text-p3">{`za rok ${yearPay}`}</span>
          </div>
          <div className="flex w-full items-center justify-end">
            <div className="flex flex-col px-10">
              <span className="text-16-semibold mb-1">Vytvorená</span>
              <span className="w-max">{createDate}</span>
            </div>
            <div className="flex flex-col border-x-2 px-10">
              <span className="text-16-semibold mb-1">Suma</span>
              {status === 'partially_paid' && currentPaid ? (
                <span className="flex w-max items-center">{`${formatCurrency(
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
        <div className="h-full w-16 min-w-[64px] cursor-pointer border-l-2">
          <div className="flex h-full w-full items-center justify-center">
            <ChevronRightIcon />
          </div>
        </div>
      </div>
      {/* Mobile */}
      <div
        id="mobile-card"
        className="flex h-24 w-full items-center justify-between border-b-2 border-gray-200 bg-white lg:hidden"
      >
        <Link
          href={`${ROUTES.TAXES_AND_FEES}/2023`}
          className="flex h-full w-full items-center justify-center"
        >
          <div className="flex w-full items-start justify-between">
            <div className="flex flex-col">
              <span className="text-p2-semibold mb-1 leading-5">{`${title} za rok ${yearPay}`}</span>
              <div className="flex flex-wrap items-center">
                {status === 'partially_paid' && currentPaid ? (
                  <span className="text-p3 flex w-max items-center">{`${formatCurrency(
                    currentPaid,
                  )} / ${formatCurrency(finishPrice)}`}</span>
                ) : (
                  <span className="text-p3">{formatCurrency(finishPrice)}</span>
                )}
                <div className="flex items-center">
                  <span className="mx-3 h-1 w-1 rounded-full bg-gray-700" />
                  <div className="flex">{statusHandler()}</div>
                </div>
              </div>
            </div>
            <span className="flex h-5 w-5 items-center justify-center">
              <ChevronRightIcon />
            </span>
          </div>
        </Link>
      </div>
    </Link>
  )
}

export default TaxesFeesCard
