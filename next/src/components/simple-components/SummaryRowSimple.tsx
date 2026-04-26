import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { PropsWithChildren } from 'react'

import { EditIcon } from '@/src/assets/ui-icons'
import cn from '@/src/utils/cn'

type SummaryRowProps = PropsWithChildren<{
  label: string
  isError: boolean
  size?: 'small' | 'large'
  isEditable?: boolean
  onGoToStep?: () => void
}>

const SummaryRowSimple = (props: SummaryRowProps) => {
  const { t } = useTranslation('forms')
  const { size = 'large', children, isError, label, isEditable = true, onGoToStep } = props

  const containerClassName = cn('flex flex-wrap gap-2 border-b py-4 sm:flex-nowrap', {
    'border-red-500 [&>div>*]:block': isError,
    'border-gray-200 hover:[&>div>*]:block': !isError,
    'hover:border-gray-700': isEditable,
  })

  const labelClassName = cn('w-full', {
    'text-size-p-small-r font-semibold lg:text-size-p-large': size === 'large',
    'text-size-p-small-r font-semibold lg:text-size-p-small': size === 'small',
  })

  const valueClassName = cn('grow', {
    'text-size-p-small-r lg:text-size-p-large': size === 'large',
    'text-size-p-small-r lg:text-size-p-small': size === 'small',
  })

  return (
    <div className={containerClassName}>
      <Typography className={labelClassName}>{label}</Typography>
      <div className="flex w-full flex-row items-center">
        <Typography className={valueClassName}>{children}</Typography>
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

export default SummaryRowSimple
