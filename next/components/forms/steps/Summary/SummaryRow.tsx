import { EditIcon } from '@assets/ui-icons'
import { ReactNode } from 'react'

import cn from '../../../../frontend/cn'

export interface SummaryRowData {
  label: string
  value?: ReactNode | string | null
  schemaPath?: string
  isError: boolean
  isConditional?: boolean
  name?: string
}

interface SummaryRowProps {
  data: SummaryRowData
  size?: 'small' | 'large'
  isEditable?: boolean
  onGoToStep?: () => void
}

const SummaryRow = (props: SummaryRowProps) => {
  const { data, size = 'large', isEditable = true, onGoToStep } = props

  const containerClassName = cn('flex flex-row flex-wrap gap-2 border-b-2 py-2.5 md:flex-nowrap', {
    'border-red-500 [&>div>*]:block': data.isError,
    'border-gray-200 hover:[&>div>*]:block': !data.isError,
    'hover:border-gray-700': isEditable,
  })

  const labelClassName = cn('w-full flex-1', {
    'text-p1-semibold': size === 'large',
    'text-p2-semibold': size === 'small',
  })

  const valueClassName = cn('grow', {
    'text-p1': size === 'large',
    'text-p2': size === 'small',
  })

  return (
    <div className={containerClassName} data-cy={`summary-row-${data.name}`}>
      <p className={labelClassName}>{data.label}</p>
      <div className="flex w-full flex-1 flex-row items-center">
        <span className={valueClassName}>{data.value || '-'}</span>
        {isEditable && (
          <div className="w-5 lg:hidden lg:hover:block">
            <EditIcon className="flex size-5 cursor-pointer" onClick={onGoToStep} />
          </div>
        )}
      </div>
    </div>
  )
}

export default SummaryRow
