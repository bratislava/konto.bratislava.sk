import { ChevronRightIcon } from '@assets/ui-icons'
import { ResponseGetTaxesBodyDto, TaxPaidStatusEnum } from '@clients/openapi-tax'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ROUTES } from '../../../../../frontend/api/constants'
import { FormatCurrencyFromCents } from '../../../../../frontend/utils/formatCurrency'
import { formatDate } from '../../../../../frontend/utils/general'
import MLinkNew from '../../../simple-components/MLinkNew'
import TaxPaidStatus from './TaxPaidStatus'

type TaxesFeesCardProps = {
  taxData: ResponseGetTaxesBodyDto
}

const TaxesFeesCard = ({ taxData }: TaxesFeesCardProps) => {
  const { year, paidStatus, createdAt, paidAmount, amount } = taxData
  const { t } = useTranslation('account')

  return (
    <>
      {/* Desktop */}
      <div className="relative hidden h-[104px] w-full items-center justify-between rounded-lg border-2 border-gray-200 bg-white lg:flex">
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full flex-col pl-6">
            <MLinkNew href={ROUTES.TAXES_AND_FEES_YEAR(year)} variant="unstyled" stretched>
              <h3 className="mb-1 text-20-semibold">
                {t('account_section_payment.tax_card_title')}
              </h3>
              <span className="text-p3">{`za rok ${year}`}</span>
            </MLinkNew>
          </div>
          <div className="flex w-full items-center justify-end">
            <div className="flex flex-col px-10">
              <span className="mb-1 text-16-semibold">Vytvorená</span>
              <span className="w-max">{formatDate(createdAt)}</span>
            </div>
            <div className="flex flex-col border-x-2 px-10">
              <span className="mb-1 text-16-semibold">Suma</span>
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
              <TaxPaidStatus status={paidStatus} />
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
              href={ROUTES.TAXES_AND_FEES_YEAR(year)}
              variant="unstyled"
              stretched
              className="mb-1 text-p2-semibold leading-5"
            >{`${t('account_section_payment.tax_card_title')} za rok ${year}`}</MLinkNew>
            <div className="flex flex-wrap items-center">
              {paidStatus === TaxPaidStatusEnum.PartiallyPaid && paidAmount ? (
                <span className="flex w-max items-center text-p3">
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
                <TaxPaidStatus status={paidStatus} />
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
