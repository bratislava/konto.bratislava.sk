import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { ReactNode } from 'react'
import { FieldError as RACFieldError } from 'react-aria-components/FieldError'
import { Label as RACLabel } from 'react-aria-components/Label'
import { Text as RACText } from 'react-aria-components/Text'

import cn from '@/src/utils/cn'

import { LabelSize } from './types'

const labelSizeStyles = {
  default: 'text-size-p-small-r lg:text-size-p-small',
  h3: 'text-size-h3-r lg:text-size-h3',
  h4: 'text-size-h4-r lg:text-size-h4',
  h5: 'text-size-h5-r lg:text-size-h5',
}

type FieldWrapperProps = {
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

  // Showing "(optional)" is the default approach, but we still want to keep the door open for using
  // asterisks = hiding "(optional)", by setting displayOptionalLabel={false}
  const showOptional = displayOptionalLabel && !isRequired
  const showAsterisk = !displayOptionalLabel && isRequired

  return (
    <>
      {/* TODO There is gap-2 in Figma design, but we agreed gap-1 looks better. Keeping gap-1 until the discussion is resolved. */}
      <div className="flex flex-col gap-1">
        <RACLabel className={cn('flex text-content-passive-primary', labelSizeStyles[labelSize])}>
          <Typography as="span" className="font-semibold">
            {label}
          </Typography>
          {showAsterisk ? (
            <Typography as="span" className="ml-0.5 font-semibold text-content-error-default">
              *
            </Typography>
          ) : null}
          {showOptional ? (
            <Typography variant="p-small" className="ml-1 font-normal">
              {t('FieldHeader.optional')}
            </Typography>
          ) : null}
        </RACLabel>
        {helptext ? (
          <RACText
            slot="description"
            // We change default p to div, because we sometimes render full markdown instead of simple text.
            elementType="div"
            className="text-size-p-small-r text-content-passive-secondary lg:text-size-p-small"
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
          className="text-size-p-small-r text-content-passive-secondary lg:text-size-p-small"
        >
          {helptextFooter}
        </RACText>
      ) : null}
      <RACFieldError
        className="text-size-p-small-r text-error lg:text-size-p-small"
        data-cy="error-message"
      >
        {errorMessage}
      </RACFieldError>
    </>
  )
}

export default FieldWrapper
