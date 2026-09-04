import { DOMAttributes, FC } from 'react'

export type FieldErrorMessageProps = {
  errorMessage?: string[]
  errorMessageProps?: DOMAttributes<never>
}

const FieldErrorMessage: FC<FieldErrorMessageProps> = ({
  errorMessage = [],
  errorMessageProps,
}) => {
  return errorMessage.length > 0 ? (
    <div
      className="mt-1 text-size-p-small-r text-error lg:text-size-p-small"
      data-cy="error-message"
      {...errorMessageProps}
    >
      {errorMessage.map((error, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index}>{error}</div>
      ))}
    </div>
  ) : null
}

export default FieldErrorMessage
