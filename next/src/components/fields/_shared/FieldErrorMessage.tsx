import { FieldError as RACFieldError } from 'react-aria-components'

interface FieldErrorMessageProps {
  errorMessage?: string
}

const FieldErrorMessage = ({ errorMessage }: FieldErrorMessageProps) => {
  if (!errorMessage) return null

  return (
    <RACFieldError className="mt-2 text-p2 text-border-error" data-cy="error-message">
      {errorMessage}
    </RACFieldError>
  )
}

export default FieldErrorMessage
