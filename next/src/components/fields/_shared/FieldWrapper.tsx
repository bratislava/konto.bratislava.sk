import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'
import {
  FieldError as RACFieldError,
  Label as RACLabel,
  Text as RACText,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

import { LabelSize } from './types'

const labelSizeStyles: Record<LabelSize, string> = {
  default: 'text-16-semibold',
  h3: 'text-h3',
  h4: 'text-h4',
  h5: 'text-h5',
}

interface FieldWrapperProps {
  label: string
  isRequired?: boolean
  displayOptionalLabel?: boolean
  labelSize?: LabelSize
  helptext?: ReactNode
  helptextFooter?: ReactNode
  errorMessage?: string
  children: ReactNode
}

const FieldWrapper = ({
  label,
  isRequired,
  displayOptionalLabel = true,
  labelSize = 'default',
  helptext,
  helptextFooter,
  errorMessage,
  children,
}: FieldWrapperProps) => {
  const { t } = useTranslation('account')

  const showOptional = displayOptionalLabel && !isRequired
  const showAsterisk = !displayOptionalLabel && isRequired

  return (
    <>
      <div className="flex flex-col gap-1">
        <RACLabel className={cn('text-content-passive-primary', labelSizeStyles[labelSize])}>
          {label}
          {showAsterisk ? <span className="ml-0.5 text-content-error-default">*</span> : null}
          {showOptional ? (
            <span className="ml-1 text-16 font-normal">{t('FieldHeader.optional')}</span>
          ) : null}
        </RACLabel>
        {helptext ? (
          <RACText
            slot="description"
            // We change default p to div, because we sometimes render full markdown instead of simple text.
            elementType="div"
            className="text-p2 text-content-passive-secondary"
          >
            {helptext}
          </RACText>
        ) : null}
      </div>

      {children}

      {helptextFooter ? (
        <RACText
          slot="description"
          // We change default p to div, because we sometimes render full markdown instead of simple text.
          elementType="div"
          className="text-p2 text-content-passive-secondary"
        >
          {helptextFooter}
        </RACText>
      ) : null}
      <RACFieldError className="text-p2 text-error" data-cy="error-message">
        {errorMessage}
      </RACFieldError>
    </>
  )
}

export default FieldWrapper
