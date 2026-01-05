import { ChevronRightIcon } from '@assets/ui-icons'
import TaxPaidStatus from 'components/forms/segments/AccountSections/TaxesFees/TaxesFeesSection/TaxesFeesCard/TaxPaidStatus'
import MLinkNew from 'components/forms/simple-components/MLinkNew'
import { ROUTES } from 'frontend/api/constants'
import { FormatCurrencyFromCents } from 'frontend/utils/formatCurrency'
import { formatDate, isDefined } from 'frontend/utils/general'
import { useTranslation } from 'next-i18next'
import { ResponseGetTaxesListBodyDto, TaxStatusEnum, TaxType } from 'openapi-clients/tax'
import React from 'react'

type Props = {
  taxData: ResponseGetTaxesListBodyDto
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19579-923&m=dev
 */

const TaxFeeRow = ({ taxData }: Props) => {
  const { t } = useTranslation('account')
  const { year, order, status, createdAt, amountToBePaid, type } = taxData

  const title = {
    [TaxType.Dzn]: t('account_section_payment.tax_card_title.dzn', { year }),
    [TaxType.Ko]: t('account_section_payment.tax_card_title.ko', { year }),
  }[type]

  const href = ROUTES.TAXES_AND_FEES_DETAIL({ year, type, order })
  const isActiveLink = status !== TaxStatusEnum.AwaitingProcessing

  return (
    <>
      {/* Desktop */}
      <div className="wrapper-focus-ring group relative hidden w-full items-center justify-between gap-6 py-4 lg:flex">
        <div className="flex w-full max-w-[450px] flex-col">
          {isActiveLink ? (
            <MLinkNew href={href} variant="unstyled" stretched>
              <h3 className="mb-1 text-16-semibold group-hover:underline">{title}</h3>
            </MLinkNew>
          ) : (
            <h3 className="mb-1 text-16-semibold">{title}</h3>
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
        <div className="h-full w-16">
          {isActiveLink && (
            <div className="flex size-full items-center justify-center">
              <ChevronRightIcon />
            </div>
          )}
        </div>
      </div>
      {/* Mobile */}
      <div className="relative flex w-full items-start justify-between py-4 lg:hidden">
        <div className="flex flex-col gap-2">
          {isActiveLink ? (
            <MLinkNew href={href} variant="unstyled" stretched className="text-p2-semibold">
              {title}
            </MLinkNew>
          ) : (
            <span className="text-p2-semibold">{title}</span>
          )}
          {createdAt && <span>{formatDate(createdAt)}</span>}
          <div className="flex flex-row">
            {isDefined(amountToBePaid) && (
              <span className="text-p3">
                <FormatCurrencyFromCents value={amountToBePaid} />
              </span>
            )}
            <span className="flex items-center">
              {isDefined(amountToBePaid) && (
                <span className="mx-3 size-1 rounded-full bg-gray-700" />
              )}
              <TaxPaidStatus status={status} />
            </span>
          </div>
        </div>
        {isActiveLink && (
          <span className="flex size-5 items-center justify-center">
            <ChevronRightIcon />
          </span>
        )}
      </div>
    </>
  )
}

export default TaxFeeRow
