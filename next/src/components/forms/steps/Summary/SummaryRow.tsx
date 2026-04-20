import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { ReactNode } from 'react'

import { EditIcon } from '@/src/assets/ui-icons'
import cn from '@/src/utils/cn'

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
  hasBorder?: boolean
  onGoToStep?: () => void
}

const SummaryRow = (props: SummaryRowProps) => {
  const { t } = useTranslation('forms')
  const { data, size = 'large', isEditable = true, hasBorder = true, onGoToStep } = props

  const containerClassName = cn('flex flex-row flex-wrap gap-2 py-2.5 md:flex-nowrap', {
    'border-red-500 [&>div>*]:block': data.isError,
    'border-gray-200 hover:[&>div>*]:block': !data.isError,
    'hover:border-gray-700': isEditable,
    'border-b': hasBorder,
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
          <Button
            variant="icon-wrapped-negative-margin"
            icon={<EditIcon />}
            aria-label={t('SummaryRow.EditButton.aria')}
            onPress={onGoToStep}
          />
        )}
      </div>
    </div>
  )
}

export default SummaryRow
