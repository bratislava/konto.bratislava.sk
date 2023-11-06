import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import * as React from 'react'
import { DOMAttributes } from 'react'

import { FieldBaseProps } from '../widget-components/FieldBase'
import BATooltip from './Tooltip/BATooltip'

export type FieldHeaderProps = FieldBaseProps & {
  htmlFor?: string
  labelProps?: DOMAttributes<never>
}

const FieldHeader = ({
  label,
  htmlFor,
  required,
  labelProps,
  tooltip,
  labelSize = 'default',
}: FieldHeaderProps) => {
  const { t } = useTranslation('account', { keyPrefix: 'FieldHeader' })

  const labelStyle = cx('relative text-gray-800', {
    'after:text-16-semibold after:absolute after:bottom-0.5 after:ml-0.5 after:text-main-700 after:content-["*"]':
      required,
    'text-p3-semibold sm:text-16-semibold': labelSize === 'default',
    'text-h3': labelSize === 'h3',
    'text-h4': labelSize === 'h4',
  })

  const wrapperStyle = cx('flex justify-between', {
    'mb-1': labelSize === 'default',
    'mb-8': labelSize === 'h3',
    'mb-5': labelSize === 'h4',
  })

  return (
    <div className="w-full">
      <div className={wrapperStyle}>
        <div className="flex w-full justify-between">
          <label htmlFor={htmlFor} className={labelStyle} {...labelProps}>
            {label}
          </label>

          <div className="flex items-center">
            {!required && (
              <div className="text-p3 sm:text-16 ml-2 flex items-center">{t('optional')}</div>
            )}
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
        </div>
      </div>
    </div>
  )
}

export default FieldHeader
