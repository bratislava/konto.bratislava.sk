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
  /**
   * Some field types (radio, checkbox, upload...) need more spacing between the title and the field itself.
   */
  customHeaderBottomMargin?: string
  /**
   * This prop controls the display of the "Optional" label text for optional fields in the form.
   * When set to false (default), an asterisk is displayed next to required fields and nothing is displayed next to optional ones.
   * When set to true, the label text "Optional" is displayed next to optional fields and nothing is displayed next to required ones.
   */
  displayOptionalLabel?: boolean
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
  customHeaderBottomMargin = 'mb-1',
  displayOptionalLabel,
}: FieldHeaderProps) => {
  const { t } = useTranslation('account', { keyPrefix: 'FieldHeader' })

  const useCustomBottomMargin = labelSize === 'default' || !helptextHeader

  const wrapperStyle = cx('flex w-full flex-col', {
    'gap-1': labelSize === 'default',
    'gap-3': labelSize === 'h3' || labelSize === 'h4' || labelSize === 'h5',
    [customHeaderBottomMargin]: useCustomBottomMargin,
    // If there's helptext and large label, we need to have large margin at the bottom
    'mb-8': !useCustomBottomMargin,
  })

  const showOptionalLabel = displayOptionalLabel && !required
  const displayAsterisk = !displayOptionalLabel && required

  const labelStyle = cx('relative text-gray-800', {
    'text-p3-semibold sm:text-16-semibold after:text-p3-semibold after:sm:text-16-semibold':
      labelSize === 'default',
    'text-h3 after:text-h3': labelSize === 'h3',
    'text-h4 after:text-h4': labelSize === 'h4',
    'text-h5 after:text-h5': labelSize === 'h5',
    'mr-2': showOptionalLabel,
    'after:absolute after:ml-0.5 after:text-main-700 after:content-["*"]': displayAsterisk,
  })

  return (
    <div className={wrapperStyle}>
      <div className="flex">
        <div className="grow">
          <label htmlFor={htmlFor} {...labelProps} className={labelStyle}>
            {label}
          </label>
          {showOptionalLabel && <span className="text-p3 sm:text-16">{t('optional')}</span>}
        </div>
        {tooltip && (
          <div
            className={cx('flex-column flex shrink-0 items-center', {
              'ml-5': showOptionalLabel,
              'ml-2': !showOptionalLabel,
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
