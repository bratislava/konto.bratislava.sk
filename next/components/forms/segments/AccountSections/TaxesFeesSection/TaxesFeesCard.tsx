import { ChevronRightIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import { ResponseGetTaxesListBodyDto, TaxStatusEnum } from 'openapi-clients/tax'
import React from 'react'

import { ROUTES } from '../../../../../frontend/api/constants'
import { FormatCurrencyFromCents } from '../../../../../frontend/utils/formatCurrency'
import { formatDate } from '../../../../../frontend/utils/general'
import MLinkNew from '../../../simple-components/MLinkNew'
import TaxPaidStatus from './TaxPaidStatus'

type TaxesFeesCardProps = {
  taxData: ResponseGetTaxesListBodyDto
}

const TaxesFeesCard = ({ taxData }: TaxesFeesCardProps) => {
  const { year, status, createdAt, amountToBePaid } = taxData
  const { t } = useTranslation('account')

  const isActiveLink = status !== TaxStatusEnum.AwaitingProcessing

  return (
    <>
      {/* Desktop */}
      <div className="relative hidden w-full items-center justify-between gap-6 py-4 lg:flex">
        <div className="flex w-full max-w-[450px] flex-col">
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
        <div className="flex w-full items-center gap-18">
          <div className="flex flex-col">
            <span className="mb-1 text-p3-semibold">
              {t('account_section_payment.tax_card_delivered')}
            </span>
            <span className="w-max">{createdAt ? formatDate(createdAt) : '-'}</span>
          </div>
          <div className="flex flex-col">
            <span className="mb-1 text-p3-semibold">
              {t('account_section_payment.tax_card_amount')}
            </span>
            {amountToBePaid === undefined ? (
              <span>-</span>
            ) : (
              <span>
                <FormatCurrencyFromCents value={amountToBePaid} />
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="mb-1 text-p3-semibold">
              {t('account_section_payment.tax_card_status')}
            </span>
            <TaxPaidStatus status={status} />
          </div>
        </div>
        <div className="h-full w-16 min-w-[64px] cursor-pointer">
          {isActiveLink && (
            <div className="flex size-full items-center justify-center">
              <ChevronRightIcon />
            </div>
          )}
        </div>
      </div>
      {/* Mobile */}
      <div className="relative flex h-25 w-full items-center justify-between py-4 lg:hidden">
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
            <div className="">
              {createdAt && <div className="w-max">{formatDate(createdAt)}</div>}
              <div className="flex flex-row">
                {amountToBePaid !== undefined && amountToBePaid !== null && (
                  <span className="text-p3">
                    <FormatCurrencyFromCents value={amountToBePaid} />
                  </span>
                )}
                <span className="flex items-center">
                  {amountToBePaid !== undefined && amountToBePaid !== null && (
                    <span className="mx-3 size-1 rounded-full bg-gray-700" />
                  )}
                  <TaxPaidStatus status={status} />
                </span>
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
