import { ChevronRightIcon } from '@assets/ui-icons'
import MLinkNew from 'components/forms/simple-components/MLinkNew'
import { ROUTES } from 'frontend/api/constants'
import cn from 'frontend/cn'
import { FormatCurrencyFromCents } from 'frontend/utils/formatCurrency'
import { formatDate, isDefined } from 'frontend/utils/general'
import { useTranslation } from 'next-i18next'
import { ResponseGetTaxesListBodyDto, TaxStatusEnum, TaxType } from 'openapi-clients/tax'
import React from 'react'

type TaxesFeesOverviewRowProps = {
  taxData: ResponseGetTaxesListBodyDto
}

const PaymentStatus = ({ status }: { status: TaxStatusEnum }) => {
  const { t } = useTranslation('account')

  const title = {
    [TaxStatusEnum.AwaitingProcessing]: t(
      'account_section_payment.tax_card_status_waiting_for_processing',
    ),
    [TaxStatusEnum.NotPaid]: t('account_section_payment.tax_card_status_not_paid'),
    [TaxStatusEnum.PartiallyPaid]: t('account_section_payment.tax_card_status_partially_paid'),
    [TaxStatusEnum.Paid]: t('account_section_payment.tax_card_status_paid'),
    [TaxStatusEnum.OverPaid]: t('account_section_payment.tax_card_status_overpaid'),
  }[status]

  return (
    <div className="flex items-center gap-[6px]">
      <span
        className={cn('w-max text-p3-semibold lg:text-16-semibold', {
          'text-negative-700': status === TaxStatusEnum.NotPaid,
          'text-warning-700':
            status === TaxStatusEnum.OverPaid || status === TaxStatusEnum.AwaitingProcessing,
          'text-transport-700':
            // partially paid should be blue color but we don't such color,
            // colors not defined in design system, using what we have
            status === TaxStatusEnum.PartiallyPaid,
          'text-success-700': status === TaxStatusEnum.Paid,
        })}
      >
        {title}
      </span>
    </div>
  )
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19579-923&m=dev
 */

const TaxesFeesOverviewRow = ({ taxData }: TaxesFeesOverviewRowProps) => {
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
            <PaymentStatus status={status} />
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
              <PaymentStatus status={status} />
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

export default TaxesFeesOverviewRow
