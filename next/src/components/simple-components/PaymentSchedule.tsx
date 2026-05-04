import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { InstallmentPaidStatusEnum } from 'openapi-clients/tax'
import { Fragment } from 'react'

import { FormatCurrencyFromCents } from '@/src/components/formatting/formatCurrency'
import { formatDate } from '@/src/components/formatting/FormatDate'
import { useTaxFee } from '@/src/components/page-contents/TaxesFees/useTaxFee'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import cn from '@/src/utils/cn'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19579-6510&m=dev
 */

const PaymentSchedule = () => {
  const { t } = useTranslation('account')

  const { taxData } = useTaxFee()

  return (
    <ul className="flex w-full flex-col rounded-lg border border-gray-200 px-4 lg:px-6">
      {taxData.installmentPayment.installments?.map((installment, index) => {
        const formattedDate = formatDate(installment.dueDate)
        const translationMap = {
          0: t('tax_detail_section.installments.0', { date: formattedDate }),
          1: t('tax_detail_section.installments.1', { date: formattedDate }),
          2: t('tax_detail_section.installments.2', { date: formattedDate }),
          3: t('tax_detail_section.installments.3', { date: formattedDate }),
        }

        const statusLabel = {
          [InstallmentPaidStatusEnum.Paid]: t('tax_detail_section.installment.status.paid'),
          [InstallmentPaidStatusEnum.OverPaid]: t('tax_detail_section.installment.status.overpaid'),
          [InstallmentPaidStatusEnum.NotPaid]: t('tax_detail_section.installment.status.not_paid'),
          [InstallmentPaidStatusEnum.PartiallyPaid]: t(
            'tax_detail_section.installment.status.partially_paid',
          ),
          [InstallmentPaidStatusEnum.AfterDueDate]: t(
            'tax_detail_section.installment.status.after_due_date',
          ),
        }[installment.status]

        return (
          <Fragment key={index}>
            {index > 0 && <HorizontalDivider asListItem />}
            <li className="flex w-full flex-col items-start py-4 max-lg:gap-2 lg:flex-row">
              <Typography variant="h6" as="span" className="lg:basis-200">
                {/* only first installment is calculated, others are hardcoded so they will always be available for DzN,
               how date calculation works for PKO is not yet determined same in TaxFeePaymentMethodSection */}
                {installment.dueDate
                  ? translationMap[index]
                  : t('tax_detail_section.installments.not_available')}
              </Typography>
              <div className="flex justify-between max-lg:w-full lg:grow">
                <Typography
                  variant="p-small"
                  as="span"
                  className={cn('font-semibold', {
                    'text-content-error-default':
                      installment.status === InstallmentPaidStatusEnum.AfterDueDate,
                    'text-content-warning-default':
                      installment.status === InstallmentPaidStatusEnum.PartiallyPaid ||
                      installment.status === InstallmentPaidStatusEnum.OverPaid,
                    'text-content-success-default':
                      installment.status === InstallmentPaidStatusEnum.Paid,
                  })}
                >
                  {statusLabel}
                </Typography>
                <Typography variant="p-small" as="span" className="font-semibold">
                  <FormatCurrencyFromCents value={installment.remainingAmount} />
                </Typography>
              </div>
            </li>
          </Fragment>
        )
      })}
    </ul>
  )
}

export default PaymentSchedule
