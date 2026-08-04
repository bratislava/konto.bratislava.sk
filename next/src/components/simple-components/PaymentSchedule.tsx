import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { InstallmentPaidStatusEnum } from 'openapi-clients/tax'
import { Fragment } from 'react'

import { FormatCurrencyFromCents } from '@/src/components/formatting/formatCurrency'
import { formatDate } from '@/src/components/formatting/FormatDate'
import { useTaxData } from '@/src/components/page-contents/TaxesPageContent/useTaxData'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import cn from '@/src/utils/cn'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19579-6510&m=dev
 */

const PaymentSchedule = () => {
  const { t } = useTranslation('account')

  const { taxData } = useTaxData()

  // TODO: Use Table component

  return (
    <ul className="flex w-full flex-col rounded-lg border border-gray-200 px-4 lg:px-6">
      {taxData.installmentPayment.installments?.map((installment, index) => {
        const formattedDate = formatDate(installment.dueDate)
        const translationMap = {
          0: t('PaymentSchedule.installments.0', { date: formattedDate }),
          1: t('PaymentSchedule.installments.1', { date: formattedDate }),
          2: t('PaymentSchedule.installments.2', { date: formattedDate }),
          3: t('PaymentSchedule.installments.3', { date: formattedDate }),
        }

        const statusLabel = {
          [InstallmentPaidStatusEnum.Paid]: t('PaymentSchedule.status.paid'),
          [InstallmentPaidStatusEnum.OverPaid]: t('PaymentSchedule.status.overpaid'),
          [InstallmentPaidStatusEnum.NotPaid]: t('PaymentSchedule.status.notPaid'),
          [InstallmentPaidStatusEnum.PartiallyPaid]: t('PaymentSchedule.status.partiallyPaid'),
          [InstallmentPaidStatusEnum.AfterDueDate]: t('PaymentSchedule.status.afterDueDate'),
        }[installment.status]

        return (
          <Fragment key={index}>
            {index > 0 && <HorizontalDivider asListItem />}
            <li className="flex w-full flex-col items-start py-4 max-lg:gap-2 lg:flex-row">
              <Typography variant="h6" as="span" className="lg:basis-200">
                {/* only first installment is calculated, others are hardcoded so they will always be available for DzN,
               how date calculation works for PKO is not yet determined same in TaxPaymentMethods */}
                {installment.dueDate
                  ? translationMap[index]
                  : t('PaymentSchedule.installments.notAvailable')}
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
