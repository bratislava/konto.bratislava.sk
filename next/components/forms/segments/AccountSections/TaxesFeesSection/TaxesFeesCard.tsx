import { CheckIcon, ChevronRightIcon, ClockIcon, ErrorIcon } from '@assets/ui-icons'
import { ResponseGetTaxesBodyDto, TaxPaidStatusEnum } from '@clients/openapi-tax'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'

import { ROUTES } from '../../../../../frontend/api/constants'
import { FormatCurrencyFromCents } from '../../../../../frontend/utils/formatCurrency'
import { formatDate } from '../../../../../frontend/utils/general'
import MLinkNew from '../../../simple-components/MLinkNew'

type TaxesFeesCardProps = {
  taxData: ResponseGetTaxesBodyDto
}

const TaxesFeesCard = ({ taxData }: TaxesFeesCardProps) => {
  const { year, paidStatus, createdAt, paidAmount, amount } = taxData
  const { t } = useTranslation('account')
  const createdAtFormatted = new Date(createdAt).toLocaleDateString('sk-SK')
  // TODO: Implement dates properly
  const paidDate = false

  const statusHandler = (): ReactNode => {
    const statusStyle: string = cx('text-p3-semibold lg:text-16-semibold ml-0 w-max lg:ml-2', {
      'text-negative-700': paidStatus === TaxPaidStatusEnum.NotPayed,
      'text-warning-700': paidStatus === TaxPaidStatusEnum.PartiallyPaid,
      'text-success-700': paidStatus === TaxPaidStatusEnum.Paid,
    })
    const statusNode = (icon: ReactNode, statusTitle: string): ReactNode => {
      return (
        <>
          <span className="hidden size-6 items-center justify-center lg:flex">{icon}</span>
          <span className={statusStyle}>{statusTitle}</span>
        </>
      )
    }

    switch (paidStatus) {
      case TaxPaidStatusEnum.NotPayed:
        return statusNode(<ErrorIcon className="size-6 text-negative-700" />, 'Neuhradená')
      case TaxPaidStatusEnum.PartiallyPaid:
        return statusNode(<ClockIcon className="size-6 text-warning-700" />, 'Čiastočne uhradená')
      case TaxPaidStatusEnum.Paid:
        return statusNode(<CheckIcon className="size-6 text-success-700" />, 'Uhradená')
      default:
        break
    }
    return null
  }

  return (
    <>
      {/* Desktop */}
      <div className="relative hidden h-[104px] w-full items-center justify-between rounded-lg border-2 border-gray-200 bg-white lg:flex">
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full flex-col pl-6">
            <MLinkNew href={`${ROUTES.TAXES_AND_FEES}/${year}`} variant="unstyled" stretched>
              <h3 className="text-20-semibold mb-1">
                {t('account_section_payment.tax_card_title')}
              </h3>
              <span className="text-p3">{`za rok ${year}`}</span>
            </MLinkNew>
          </div>
          <div className="flex w-full items-center justify-end">
            <div className="flex flex-col px-10">
              <span className="text-16-semibold mb-1">Vytvorená</span>
              <span className="w-max">{createdAtFormatted}</span>
            </div>
            <div className="flex flex-col border-x-2 px-10">
              <span className="text-16-semibold mb-1">Suma</span>
              {paidStatus === TaxPaidStatusEnum.PartiallyPaid && paidAmount ? (
                <span className="flex w-max items-center">
                  <FormatCurrencyFromCents value={paidAmount} /> /{' '}
                  <FormatCurrencyFromCents value={amount} />
                </span>
              ) : (
                <span>
                  <FormatCurrencyFromCents value={amount} />
                </span>
              )}
            </div>
            <div className="flex flex-col items-center px-10">
              <div className="flex">{statusHandler()}</div>
              {paidStatus !== TaxPaidStatusEnum.NotPayed && paidDate && (
                <span className="">{formatDate(paidDate)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="h-full w-16 min-w-[64px] cursor-pointer border-l-2">
          <div className="flex size-full items-center justify-center">
            <ChevronRightIcon />
          </div>
        </div>
      </div>
      {/* Mobile */}
      <div className="relative flex h-24 w-full items-center justify-between border-b-2 border-gray-200 bg-white lg:hidden">
        <div className="flex w-full items-start justify-between">
          <div className="flex flex-col">
            <MLinkNew
              href={`${ROUTES.TAXES_AND_FEES}/${year}`}
              variant="unstyled"
              stretched
              className="text-p2-semibold mb-1 leading-5"
            >{`${t('account_section_payment.tax_card_title')} za rok ${year}`}</MLinkNew>
            <div className="flex flex-wrap items-center">
              {paidStatus === TaxPaidStatusEnum.PartiallyPaid && paidAmount ? (
                <span className="text-p3 flex w-max items-center">
                  <FormatCurrencyFromCents value={paidAmount} /> /{' '}
                  <FormatCurrencyFromCents value={amount} />
                </span>
              ) : (
                <span className="text-p3">
                  <FormatCurrencyFromCents value={amount} />
                </span>
              )}
              <div className="flex items-center">
                <span className="mx-3 size-1 rounded-full bg-gray-700" />
                <div className="flex">{statusHandler()}</div>
              </div>
            </div>
          </div>
          <span className="flex size-5 items-center justify-center">
            <ChevronRightIcon />
          </span>
        </div>
      </div>
    </>
  )
}

export default TaxesFeesCard
