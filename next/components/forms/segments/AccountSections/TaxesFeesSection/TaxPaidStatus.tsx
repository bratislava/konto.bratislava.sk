import { CheckIcon, ClockIcon, ErrorIcon } from '@assets/ui-icons'
import { TaxPaidStatusEnum } from 'openapi-clients/tax'
import React from 'react'

import cn from '../../../../../frontend/cn'

type TaxPaidStatusProps = { status: TaxPaidStatusEnum; mobileIcon?: boolean }

const TaxPaidStatus = ({ status, mobileIcon = false }: TaxPaidStatusProps) => {
  const statusStyle: string = cn('w-max text-p3-semibold lg:text-16-semibold', {
    'text-negative-700': status === TaxPaidStatusEnum.NotPaid,
    'text-warning-700':
      status === TaxPaidStatusEnum.PartiallyPaid || status === TaxPaidStatusEnum.OverPaid,
    'text-success-700': status === TaxPaidStatusEnum.Paid,
  })

  const icon = {
    [TaxPaidStatusEnum.NotPaid]: <ErrorIcon className="size-6 text-negative-700" />,
    [TaxPaidStatusEnum.PartiallyPaid]: <ClockIcon className="size-6 text-warning-700" />,
    [TaxPaidStatusEnum.Paid]: <CheckIcon className="size-6 text-success-700" />,
    [TaxPaidStatusEnum.OverPaid]: <ClockIcon className="size-6 text-warning-700" />,
  }[status]

  // TODO: Translations
  const title = {
    [TaxPaidStatusEnum.NotPaid]: 'Neuhradená',
    [TaxPaidStatusEnum.PartiallyPaid]: 'Čiastočne uhradená',
    [TaxPaidStatusEnum.Paid]: 'Uhradená',
    [TaxPaidStatusEnum.OverPaid]: 'Preplatok',
  }[status]

  return (
    <div className="flex items-center gap-[6px]">
      <span
        className={cn(mobileIcon ? 'flex' : 'hidden lg:flex', 'size-6 items-center justify-center')}
      >
        {icon}
      </span>
      <span className={statusStyle}>{title}</span>
    </div>
  )
}

export default TaxPaidStatus
