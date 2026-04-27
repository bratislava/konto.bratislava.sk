import { LabelSize } from 'forms-shared/generator/uiOptionsTypes'
import { useTranslation } from 'next-i18next/pages'
import * as React from 'react'
import { DOMAttributes } from 'react'

import FieldHelptext, { FieldHelptextProps } from '@/src/components/widget-components/FieldHelptext'
import cn from '@/src/utils/cn'

export type FieldHeaderProps = FieldHelptextProps & {
  label: string
  isRequired?: boolean
  labelSize?: LabelSize
  htmlFor?: string
  labelProps?: DOMAttributes<never>
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
  isRequired,
  labelProps,
  labelSize = 'default',
  helptext,
  helptextMarkdown,
  descriptionProps,
  customHeaderBottomMargin = 'mb-1',
  displayOptionalLabel = true,
}: FieldHeaderProps) => {
  const { t } = useTranslation('account')

  const useCustomBottomMargin = labelSize === 'default' || !helptext

  const wrapperStyle = cn('flex w-full flex-col', {
    'gap-1': labelSize === 'default',
    'gap-3': labelSize === 'h3' || labelSize === 'h4' || labelSize === 'h5',
    [customHeaderBottomMargin]: useCustomBottomMargin,
    // If there's helptext and large label, we need to have large margin at the bottom
    'mb-8': !useCustomBottomMargin,
  })

  const showOptionalLabel = displayOptionalLabel && !isRequired
  const displayAsterisk = !displayOptionalLabel && isRequired

  const labelStyle = cn('relative text-gray-800', {
    'text-size-p-small-r font-semibold after:text-size-p-small-r lg:text-size-p-small lg:after:text-size-p-small':
      labelSize === 'default',
    'text-size-h3-r after:text-size-h3-r lg:text-size-h3 lg:after:text-size-h3': labelSize === 'h3',
    'text-size-h4-r after:text-size-h4-r lg:text-size-h4 lg:after:text-size-h4': labelSize === 'h4',
    'text-size-h5-r after:text-size-h5-r lg:text-size-h5 lg:after:text-size-h5': labelSize === 'h5',
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
          {showOptionalLabel && (
            <span className="text-size-p-small-r lg:text-size-p-small">
              {t('FieldHeader.optional')}
            </span>
          )}
        </div>
      </div>
      {helptext ? (
        <FieldHelptext
          helptext={helptext}
          helptextMarkdown={helptextMarkdown}
          descriptionProps={descriptionProps}
        />
      ) : null}
    </div>
  )
}

export default FieldHeader
