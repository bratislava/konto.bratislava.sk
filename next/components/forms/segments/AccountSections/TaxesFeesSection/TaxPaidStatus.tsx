import { TaxPaidStatusAllEnum, TaxPaidStatusAllType } from 'frontend/types/types'
import { useTranslation } from 'next-i18next'
import React from 'react'

import cn from '../../../../../frontend/cn'

type TaxPaidStatusProps = {
  status: TaxPaidStatusAllType
  mobileIcon?: boolean
}

const TaxPaidStatus = ({ status }: TaxPaidStatusProps) => {
  const { t } = useTranslation('account')
  const statusStyle: string = cn('w-max text-p3-semibold lg:text-16-semibold', {
    'text-negative-700': status === TaxPaidStatusAllEnum.NotPaid,
    'text-warning-700':
      status === TaxPaidStatusAllEnum.PartiallyPaid ||
      status === TaxPaidStatusAllEnum.OverPaid ||
      status === TaxPaidStatusAllEnum.WaitingForProcessing,
    'text-success-700': status === TaxPaidStatusAllEnum.Paid,
  })

  // TODO: Translations
  const title = {
    [TaxPaidStatusAllEnum.WaitingForProcessing]: t(
      'account_section_payment.tax_card_status_waiting_for_processing',
    ),
    [TaxPaidStatusAllEnum.NotPaid]: t('account_section_payment.tax_card_status_not_paid'),
    [TaxPaidStatusAllEnum.PartiallyPaid]: t(
      'account_section_payment.tax_card_status_partially_paid',
    ),
    [TaxPaidStatusAllEnum.Paid]: t('account_section_payment.tax_card_status_paid'),
    [TaxPaidStatusAllEnum.OverPaid]: t('account_section_payment.tax_card_status_overpaid'),
  }[status]

  return (
    <div className="flex items-center gap-[6px]">
      <span className={statusStyle}>{title}</span>
    </div>
  )
}

export default TaxPaidStatus
