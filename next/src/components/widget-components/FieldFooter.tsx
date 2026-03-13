import { DOMAttributes } from 'react'

import FieldErrorMessage, {
  FieldErrorMessageProps,
} from '@/src/components/widget-components/FieldErrorMessage'
import FieldHelptext from '@/src/components/widget-components/FieldHelptext'

export type FieldFooterProps = FieldErrorMessageProps & {
  helptextFooter?: string
  helptextFooterMarkdown?: boolean
  isDisabled?: boolean
  descriptionProps?: DOMAttributes<never>
}

const FieldFooter = ({
  helptextFooter,
  helptextFooterMarkdown,
  descriptionProps,
  isDisabled,
  errorMessage,
  errorMessageProps,
}: FieldFooterProps) => {
  return (
    <>
      {!isDisabled && (
        <FieldErrorMessage errorMessage={errorMessage} errorMessageProps={errorMessageProps} />
      )}
      {helptextFooter && (
        <FieldHelptext
          helptext={helptextFooter}
          helptextMarkdown={helptextFooterMarkdown}
          descriptionProps={descriptionProps}
        />
      )}
    </>
  )
}

export default FieldFooter
