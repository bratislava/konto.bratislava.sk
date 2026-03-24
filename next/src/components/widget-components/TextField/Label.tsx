import { LabelSize } from 'forms-shared/generator/uiOptionsTypes'
import { useTranslation } from 'next-i18next'
import { Label as RACLAbel, LabelProps as RACLLabelProps } from 'react-aria-components'

import cn from '@/src/utils/cn'

export type LabelProps = RACLLabelProps & {
  labelSize?: LabelSize
  isRequired?: boolean
  displayOptionalLabel?: boolean
}

const Label = ({
  children,
  labelSize = 'default',
  isRequired,
  displayOptionalLabel = true,
}: LabelProps) => {
  const { t } = useTranslation()

  const showOptionalLabel = displayOptionalLabel && !isRequired
  const displayAsterisk = !displayOptionalLabel && isRequired

  const labelStyle = cn('relative text-content-passive-primary', {
    'text-p2-semibold after:text-p2-semibold': labelSize === 'default',
    'text-h3 after:text-h3': labelSize === 'h3',
    'text-h4 after:text-h4': labelSize === 'h4',
    'text-h5 after:text-h5': labelSize === 'h5',
    'after:absolute after:ml-0.5 after:text-error after:content-["*"]': displayAsterisk,
  })

  return (
    <RACLAbel className={labelStyle}>
      {children}
      {showOptionalLabel ? (
        <span className="ml-2 font-normal">{t('FieldHeader.optional')}</span>
      ) : null}
    </RACLAbel>
  )
}

export default Label
