import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'
import { Label as RACLabel, Text as RACText } from 'react-aria-components'

import cn from '@/src/utils/cn'

import { LabelSize } from './types'

interface FieldHeaderProps {
  label: string
  isRequired?: boolean
  displayOptionalLabel?: boolean
  labelSize?: LabelSize
  helptext?: ReactNode
}

const labelSizeStyles: Record<LabelSize, string> = {
  default: 'text-16-semibold',
  h3: 'text-h3',
  h4: 'text-h4',
  h5: 'text-h5',
}

const FieldHeader = ({
  label,
  isRequired,
  displayOptionalLabel = true,
  labelSize = 'default',
  helptext,
}: FieldHeaderProps) => {
  const { t } = useTranslation('account')

  const showOptional = displayOptionalLabel && !isRequired
  const showAsterisk = !displayOptionalLabel && isRequired

  return (
    <div className="mb-2 flex flex-col gap-1">
      <RACLabel className={cn('text-content-passive-primary', labelSizeStyles[labelSize])}>
        {label}
        {showAsterisk && <span className="ml-0.5 text-main-700">*</span>}
        {showOptional && (
          <span className="ml-1 text-16 font-normal">{t('FieldHeader.optional')}</span>
        )}
      </RACLabel>
      {helptext && (
        <RACText slot="description" className="text-p2 text-content-passive-secondary">
          {helptext}
        </RACText>
      )}
    </div>
  )
}

export default FieldHeader
