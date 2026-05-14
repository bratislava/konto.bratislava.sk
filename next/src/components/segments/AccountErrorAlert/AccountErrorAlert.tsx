import { useTranslation } from 'next-i18next/pages'
import { useMemo } from 'react'

import Markdown from '@/src/components/formatting/Markdown'
import Alert from '@/src/components/simple-components/Alert'
import {
  errorToLogFields,
  GENERIC_ERROR_MESSAGE,
  isError,
  isErrorWithoutName,
} from '@/src/frontend/utils/errors'
import logger from '@/src/frontend/utils/logger'

interface Props {
  error?: Error | null
  args?: Record<string, string | number>
  close?: () => void
  solid?: boolean
}

const AccountErrorAlert = ({ error, close, solid, args = {} }: Props) => {
  const { t } = useTranslation('account')

  const errorMessage = useMemo<string>(() => {
    if (!error) {
      return ''
    }
    // typescript should guard this mostly, but we're also passing in error from 3rd parties
    if (!isError(error)) {
      logger.error(
        { event: 'unknown_error_rendered', err: errorToLogFields(error) },
        `${GENERIC_ERROR_MESSAGE} - something not error-like passed into AccountErrorAlert`,
      )

      return t('errors.unknown')
    }
    if (isErrorWithoutName(error)) {
      logger.error(
        { event: 'unknown_error_rendered', err: errorToLogFields(error) },
        `${GENERIC_ERROR_MESSAGE} - error without name in AccountErrorAlert`,
      )

      return t('errors.unknown')
    }

    // Translation map for all known errors
    const errorTranslationMap: Record<string, string> = {
      unknown: t('errors.unknown'),
      UserLambdaValidationException: t('errors.UserLambdaValidationException'),
      UnexpectedLambdaException: t('errors.UnexpectedLambdaException'),
      'Bad Request': t('errors.Bad Request'),
      NotAuthorizedException: t('errors.NotAuthorizedException'),
      'NotAuthorizedException User is disabled.': t(
        'errors.NotAuthorizedException User is disabled.',
      ),
      CodeMismatchException: t('errors.CodeMismatchException'),
      LimitExceededException: t('errors.LimitExceededException'),
      TooManyRequestsException: t('errors.TooManyRequestsException'),
      TooManyFailedAttemptsException: t('errors.TooManyFailedAttemptsException'),
      UserNotFoundException: t('errors.UserNotFoundException'),
      MigrationUserNotFoundException: t('errors.MigrationUserNotFoundException', args),
      UserNotConfirmedException: t('errors.UserNotConfirmedException'),
      UsernameExistsException: t('errors.UsernameExistsException', args),
      ExpiredCodeException: t('errors.ExpiredCodeException'),
      IncorrectPasswordException: t('errors.IncorrectPasswordException'),
      InvalidParameterException: t('errors.InvalidParameterException'),
      InvalidPasswordException: t('errors.InvalidPasswordException'),
      CodeDeliveryFailureException: t('errors.CodeDeliveryFailureException'),
      InternalErrorException: t('errors.InternalErrorException'),
      AuthTokenMissingError: t('errors.AuthTokenMissingError'),
      NetworkError: t('errors.NetworkError'),
      AliasExistsException: t('errors.AliasExistsException', args),
      API_ERROR: t('errors.API_ERROR'),
      RFO_ACCESS_ERROR: t('errors.RFO_ACCESS_ERROR'),
      RFO_NOT_RESPONDING: t('errors.RFO_NOT_RESPONDING'),
      DEAD_PERSON: t('errors.DEAD_PERSON'),
      BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY: t(
        'errors.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY',
      ),
      BIRTHNUMBER_IFO_DUPLICITY: t('errors.BIRTHNUMBER_IFO_DUPLICITY'),
      'unsuccessful-identity-verification': t('errors.unsuccessful-identity-verification'),
      'InvalidParameterException Cannot reset password for the user as there is no registered/verified email or phone_number':
        t(
          'errors.InvalidParameterException Cannot reset password for the user as there is no registered/verified email or phone_number',
        ),
    }

    // Check for error with message first (e.g., "NotAuthorizedException User is disabled.")
    const errorKeyWithMessage = `${error.name} ${error.message}`
    if (errorKeyWithMessage in errorTranslationMap) {
      const formattedMessage = errorTranslationMap[errorKeyWithMessage]
      logger.info('Known error with message', error.name, error.message, formattedMessage)

      return formattedMessage
    }

    // Then check for error name only
    if (error.name in errorTranslationMap) {
      const formattedMessage = errorTranslationMap[error.name]
      logger.info('Known error', error.name, error.message, formattedMessage)

      return formattedMessage
    }

    // Unknown error - log error.name/message as structured fields so Grafana
    // search by `event:unknown_error_rendered` and `err.name` works.
    logger.error(
      { event: 'unknown_error_rendered', err: errorToLogFields(error) },
      `${GENERIC_ERROR_MESSAGE} - unknown error with code`,
    )

    return t('errors.unknown')
    // exhaustive-deps disabled because args tend to be passed in as an object re-created on every render
    // instead of fixing this, we may want to get rid of args/present version of formatUnicorn altogether
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  if (!errorMessage) return null

  return (
    <Alert
      message={<Markdown variant="small" content={errorMessage} />}
      type="error"
      className="min-w-full"
      close={close}
      solid={solid}
    />
  )
}

export default AccountErrorAlert
