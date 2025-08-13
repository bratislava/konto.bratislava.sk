import { ChevronRightIcon } from '@assets/ui-icons'
import { TaxPaidStatusAllType } from 'frontend/types/types'
import { useTranslation } from 'next-i18next'
import { ResponseGetTaxesBodyDto, TaxPaidStatusEnum } from 'openapi-clients/tax'
import React from 'react'

import { ROUTES } from '../../../../../frontend/api/constants'
import { FormatCurrencyFromCents } from '../../../../../frontend/utils/formatCurrency'
import { formatDate } from '../../../../../frontend/utils/general'
import MLinkNew from '../../../simple-components/MLinkNew'
import TaxPaidStatus from './TaxPaidStatus'

type TaxesFeesCardProps = {
  taxData: Partial<Omit<ResponseGetTaxesBodyDto, 'paidStatus' | 'amount' | 'paidAmount'>> & {
    paidStatus: TaxPaidStatusAllType
    amount: number | null
    paidAmount: number | null
    year: number
  }
  isActiveLink: boolean
}

const TaxesFeesCard = ({ taxData, isActiveLink }: TaxesFeesCardProps) => {
  const { year, paidStatus, createdAt, paidAmount, amount } = taxData
  const { t } = useTranslation('account')

  // TODO: change appearence of this card, check figma
  return (
    <>
      {/* Desktop */}
      <div className="relative hidden h-[104px] w-full items-center justify-between rounded-lg border-2 border-gray-200 bg-white lg:flex">
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full max-w-[450px] flex-col pl-6">
            {isActiveLink ? (
              <MLinkNew href={ROUTES.TAXES_AND_FEES_YEAR(year)} variant="unstyled" stretched>
                <h3 className="mb-1 text-16-semibold">
                  {t('account_section_payment.tax_card_title', { year })}
                </h3>
              </MLinkNew>
            ) : (
              <h3 className="mb-1 text-16-semibold">
                {t('account_section_payment.tax_card_title', { year })}
              </h3>
            )}
          </div>
          <div className="flex w-full items-center">
            <div className="flex flex-col px-10">
              <span className="mb-1 text-p3-semibold">
                {t('account_section_payment.tax_card_delivered')}
              </span>
              <span className="w-max">{createdAt ? formatDate(createdAt) : '-'}</span>
            </div>
            <div className="flex flex-col px-10">
              <span className="mb-1 text-p3-semibold">
                {t('account_section_payment.tax_card_amount')}
              </span>
              {amount === null ? (
                <span>-</span>
              ) : paidStatus === TaxPaidStatusEnum.PartiallyPaid && paidAmount ? (
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
            <div className="flex flex-col px-10">
              <span className="mb-1 text-p3-semibold">
                {t('account_section_payment.tax_card_status')}
              </span>
              <TaxPaidStatus status={paidStatus} />
            </div>
          </div>
        </div>
        {isActiveLink && (
          <div className="h-full w-16 min-w-[64px] cursor-pointer">
            <div className="flex size-full items-center justify-center">
              <ChevronRightIcon />
            </div>
          </div>
        )}
      </div>
      {/* Mobile */}
      <div className="relative flex h-24 w-full items-center justify-between border-b-2 border-gray-200 bg-white lg:hidden">
        <div className="flex w-full items-start justify-between">
          <div className="flex flex-col">
            {isActiveLink ? (
              <MLinkNew
                href={ROUTES.TAXES_AND_FEES_YEAR(year)}
                variant="unstyled"
                stretched
                className="mb-1 text-p2-semibold leading-5"
              >{`${t('account_section_payment.tax_card_title', { year })}`}</MLinkNew>
            ) : (
              <span className="mb-1 text-p2-semibold leading-5">{`${t('account_section_payment.tax_card_title', { year })}`}</span>
            )}
            <div className="flex flex-wrap items-center">
              {amount !== null && paidStatus === TaxPaidStatusEnum.PartiallyPaid && paidAmount && (
                <span className="flex w-max items-center text-p3">
                  <FormatCurrencyFromCents value={paidAmount} /> /{' '}
                  <FormatCurrencyFromCents value={amount} />
                </span>
              )}
              {amount !== null &&
                (paidStatus !== TaxPaidStatusEnum.PartiallyPaid || !paidAmount) && (
                  <span className="text-p3">
                    <FormatCurrencyFromCents value={amount} />
                  </span>
                )}
              <div className="flex items-center">
                {amount !== null && <span className="mx-3 size-1 rounded-full bg-gray-700" />}
                <TaxPaidStatus status={paidStatus} />
              </div>
            </div>
          </div>
          {isActiveLink && (
            <span className="flex size-5 items-center justify-center">
              <ChevronRightIcon />
            </span>
          )}
        </div>
      </div>
    </>
  )
}

export default TaxesFeesCard
