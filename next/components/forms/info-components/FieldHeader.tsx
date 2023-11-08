import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import * as React from 'react'
import { DOMAttributes } from 'react'
import { LabelSize } from 'schema-generator/generator/uiOptionsTypes'

import FieldHelptext from './FieldHelptext'
import BATooltip from './Tooltip/BATooltip'

export type FieldHeaderProps = {
  label: string
  required?: boolean
  tooltip?: string
  labelSize?: LabelSize
  htmlFor?: string
  labelProps?: DOMAttributes<never>
  helptextHeader?: string
  descriptionProps?: DOMAttributes<never>
}

const FieldHeader = ({
  label,
  htmlFor,
  required,
  labelProps,
  tooltip,
  labelSize = 'default',
  helptextHeader,
  descriptionProps,
}: FieldHeaderProps) => {
  const { t } = useTranslation('account', { keyPrefix: 'FieldHeader' })

  const labelStyle = cx('text-gray-800', {
    'text-p3-semibold sm:text-16-semibold': labelSize === 'default',
    'text-h3': labelSize === 'h3',
    'text-h4': labelSize === 'h4',
    'mr-2': !required,
  })

  const wrapperStyle = cx({
    'mb-1': labelSize === 'default',
    'mb-4': labelSize === 'h3',
    'mb-5': labelSize === 'h4',
  })

  return (
    <div className="w-full">
      <div className={wrapperStyle}>
        <label htmlFor={htmlFor} {...labelProps} className={labelStyle}>
          {label}
        </label>

        {!required && <span className="text-p3 sm:text-16">{t('optional')}</span>}
        {tooltip && (
          <div
            className={cx('flex-column flex items-center', {
              'ml-5': required,
              'ml-2': !required,
            })}
          >
            <BATooltip>{tooltip}</BATooltip>
          </div>
        )}
      </div>
      {helptextHeader && (
        <FieldHelptext helptext={helptextHeader} descriptionProps={descriptionProps} />
      )}
    </div>
  )
}

export default FieldHeader
