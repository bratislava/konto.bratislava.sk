import { EditIcon } from '@assets/ui-icons'
import { PropsWithChildren } from 'react'
import cn from '../../../frontend/cn'

type SummaryRowProps = PropsWithChildren<{
  label: string
  isError: boolean
  size?: 'small' | 'large'
  isEditable?: boolean
  onGoToStep?: () => void
}>

const SummaryRowSimple = (props: SummaryRowProps) => {
  const { size = 'large', children, isError, label, isEditable = true, onGoToStep } = props

  const containerClassName = cn('flex flex-wrap gap-2 border-b-2 py-4 sm:flex-nowrap', {
    'border-red-500 [&>div>*]:block': isError,
    'border-gray-200 hover:[&>div>*]:block': !isError,
    'hover:border-gray-700': isEditable,
  })

  const labelClassName = cn('w-full', {
    'text-p1-semibold': size === 'large',
    'text-p2-semibold': size === 'small',
  })

  const valueClassName = cn('grow', {
    'text-p1': size === 'large',
    'text-p2': size === 'small',
  })

  return (
    <div className={containerClassName}>
      <p className={labelClassName}>{label}</p>
      <div className="flex w-full flex-row items-center">
        <div className={valueClassName}>{children}</div>
        {isEditable && <EditIcon className="hidden cursor-pointer" onClick={onGoToStep} />}
      </div>
    </div>
  )
}

export default SummaryRowSimple
