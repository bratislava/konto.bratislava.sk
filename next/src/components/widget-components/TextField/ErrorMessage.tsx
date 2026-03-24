import {
  FieldError as RACFieldError,
  FieldErrorProps as RACFieldErrorProps,
} from 'react-aria-components'

export type ErrorMessageProps = RACFieldErrorProps

const ErrorMessage = ({ ...rest }: ErrorMessageProps) => {
  return <RACFieldError className="text-16 text-error" data-cy="error-message" {...rest} />
}

export default ErrorMessage
