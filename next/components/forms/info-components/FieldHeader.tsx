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
  explicitOptional = false,
  labelProps,
  tooltip,
}: FieldHeaderProps) => {
  const { t } = useTranslation('account', { keyPrefix: 'FieldHeader' })

  const labelStyle = cx('text-p3-semibold sm:text-16-semibold relative text-gray-800', {
    'after:text-16-semibold after:absolute after:bottom-0.5 after:ml-0.5 after:text-main-700 after:content-["*"]':
      required,
  })

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between">
        <div className="flex w-full justify-between">
          <label htmlFor={htmlFor} className={labelStyle} {...labelProps}>
            {label}
          </label>

          <div className="flex items-center">
            {!required && explicitOptional && (
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
