import React, { DOMAttributes, FC } from 'react'

export type FieldErrorMessageProps = {
  errorMessage?: string[]
  errorMessageProps?: DOMAttributes<never>
}

const FieldErrorMessage: FC<FieldErrorMessageProps> = ({
  errorMessage = [],
  errorMessageProps,
}) => {
  return errorMessage.length > 0 ? (
    <div className="mt-1 text-16 text-error" data-cy="error-message" {...errorMessageProps}>
      {errorMessage.map((error, index) => {
        // TODO: Remove this logic (ensure that the strings are properly formatted in the first place)
        const firstCharUppercased = error.slice(0, 1).toUpperCase()
        const restOfError = error.slice(1)
        const lastChar = error.trim().slice(-1)
        const lastCharIsPeriodOrEllipsis = lastChar === '.' || lastChar === '…'

        return (
          <div key={index}>
            {`${firstCharUppercased}${restOfError}${lastCharIsPeriodOrEllipsis ? '' : '.'}`}
          </div>
        )
      })}
    </div>
  ) : null
}

export default FieldErrorMessage
