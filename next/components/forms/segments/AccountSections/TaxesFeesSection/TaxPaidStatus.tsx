import { CheckIcon, ClockIcon, ErrorIcon } from '@assets/ui-icons'
import { TaxPaidStatusEnum } from '@clients/openapi-tax'
import cx from 'classnames'
import React from 'react'

type TaxPaidStatusProps = { status: TaxPaidStatusEnum; mobileIcon?: boolean }

const TaxPaidStatus = ({ status, mobileIcon = false }: TaxPaidStatusProps) => {
  const statusStyle: string = cx('text-p3-semibold lg:text-16-semibold w-max', {
    'text-negative-700': status === TaxPaidStatusEnum.NotPaid,
    'text-warning-700':
      status === TaxPaidStatusEnum.PartiallyPaid || status === TaxPaidStatusEnum.OverPaid,
    'text-success-700': status === TaxPaidStatusEnum.Paid,
  })

  const icon = {
    [TaxPaidStatusEnum.NotPaid]: <ErrorIcon className="text-negative-700 size-6" />,
    [TaxPaidStatusEnum.PartiallyPaid]: <ClockIcon className="text-warning-700 size-6" />,
    [TaxPaidStatusEnum.Paid]: <CheckIcon className="text-success-700 size-6" />,
    [TaxPaidStatusEnum.OverPaid]: <ClockIcon className="text-warning-700 size-6" />,
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
        className={cx(mobileIcon ? 'flex' : 'hidden lg:flex', 'size-6 items-center justify-center')}
      >
        {icon}
      </span>
      <span className={statusStyle}>{title}</span>
    </div>
  )
}

export default TaxPaidStatus
