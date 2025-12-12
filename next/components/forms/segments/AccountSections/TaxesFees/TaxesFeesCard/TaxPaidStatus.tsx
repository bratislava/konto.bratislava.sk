import { useTranslation } from 'next-i18next'
import { TaxStatusEnum } from 'openapi-clients/tax'
import React from 'react'

import cn from '../../../../../../frontend/cn'

type TaxPaidStatusProps = {
  status: TaxStatusEnum
}

const TaxPaidStatus = ({ status }: TaxPaidStatusProps) => {
  const { t } = useTranslation('account')
  const statusStyle: string = cn('w-max text-p3-semibold lg:text-16-semibold', {
    'text-negative-700': status === TaxStatusEnum.NotPaid,
    'text-warning-700':
      status === TaxStatusEnum.OverPaid || status === TaxStatusEnum.AwaitingProcessing,
    'text-transport-700':
      // partially paid should be blue color but we don't such color,
      // colors not defined in design system, using what we have
      status === TaxStatusEnum.PartiallyPaid,
    'text-success-700': status === TaxStatusEnum.Paid,
  })

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
      <span className={statusStyle}>{title}</span>
    </div>
  )
}

export default TaxPaidStatus
