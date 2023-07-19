import EditIcon from '@assets/images/new-icons/ui/pen.svg'
import cx from 'classnames'

export interface SummaryRowData {
  label: string
  value?: string | null
  schemaPath: string
  isError: boolean
  isConditional?: boolean
}

interface SummaryRowProps {
  data: SummaryRowData
  size?: 'small' | 'large'
  isEditable?: boolean
  onGoToStep?: () => void
}

const SummaryRow = (props: SummaryRowProps) => {
  const { data, size = 'large', isEditable = true, onGoToStep } = props

  const containerClassName = cx('border-b-2 md:flex-nowrap flex flex-wrap flex-row py-2.5 gap-2', {
    '[&>div>*]:block border-red-500': data.isError,
    'border-gray-200 [&>div>*]:hover:block': !data.isError,
    'hover:border-gray-700': isEditable,
  })

  const labelClassName = cx('w-full', {
    'text-p1-semibold': size === 'large',
    'text-p2-semibold': size === 'small',
  })

  const valueClassName = cx('grow', {
    'text-p1': size === 'large',
    'text-p2': size === 'small',
  })

  return (
    <div className={containerClassName}>
      <p className={labelClassName}>{data.label}</p>
      <div className="w-full flex flex-row items-center">
        <p className={valueClassName}>{data.value || '-'}</p>
        {isEditable && (
          <div className="w-5 lg:hidden hover:lg:block">
            {/* TODO: Recover file scan */}
            {/* {data.fileScanState === 'scan' ? ( */}
            {/*  <UnionWaitIcon className="cursor-pointer flex w-5 h-5" onClick={onGoToStep} /> */}
            {/* ) : ( */}
            <EditIcon className="cursor-pointer flex w-5 h-5" onClick={onGoToStep} />
            {/* )} */}
          </div>
        )}
      </div>
    </div>
  )
}

export default SummaryRow
