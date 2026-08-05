import { useTranslation } from 'next-i18next/pages'
import { useMemo } from 'react'

import Markdown from '@/src/components/formatting/Markdown'
import Alert from '@/src/components/simple-components/Alert'
import { GENERIC_ERROR_MESSAGE, isError, isErrorWithoutName } from '@/src/frontend/utils/errors'
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
        `${GENERIC_ERROR_MESSAGE} - something not error-like passed into AccountErrorAlert: `,
        JSON.stringify(error),
      )

      return t('AccountErrorAlert.errors.unknown')
    }
    if (isErrorWithoutName(error)) {
      // JSON.stringify here because amplify returns custom errors which pino tries to serialize but fails (they either don't have 'message' attribute or have it as private)
      logger.error(
        `${GENERIC_ERROR_MESSAGE} - unknown error without error code in AccountErrorAlert: `,
        error.message,
        JSON.stringify(error),
      )

      return t('AccountErrorAlert.errors.unknown')
    }

    // Translation map for all known errors
    const errorTranslationMap: Record<string, string> = {
      unknown: t('AccountErrorAlert.errors.unknown'),
      UserLambdaValidationException: t('AccountErrorAlert.errors.UserLambdaValidationException'),
      'Bad Request': t('AccountErrorAlert.errors.Bad Request'),
      NotAuthorizedException: t('AccountErrorAlert.errors.NotAuthorizedException'),
      'NotAuthorizedException User is disabled.': t(
        'AccountErrorAlert.errors.NotAuthorizedException User is disabled.',
      ),
      CodeMismatchException: t('AccountErrorAlert.errors.CodeMismatchException'),
      LimitExceededException: t('AccountErrorAlert.errors.LimitExceededException'),
      UserNotFoundException: t('AccountErrorAlert.errors.UserNotFoundException'),
      MigrationUserNotFoundException: t(
        'AccountErrorAlert.errors.MigrationUserNotFoundException',
        args,
      ),
      UserNotConfirmedException: t('AccountErrorAlert.errors.UserNotConfirmedException'),
      UsernameExistsException: t('AccountErrorAlert.errors.UsernameExistsException', args),
      ExpiredCodeException: t('AccountErrorAlert.errors.ExpiredCodeException'),
      IncorrectPasswordException: t('AccountErrorAlert.errors.IncorrectPasswordException'),
      // InvalidPasswordException returns probably also a message which rule failed ("Password did not conform with policy: Password must have symbol characters").
      InvalidPasswordException: t('AccountErrorAlert.errors.InvalidPasswordException'),
      InvalidParameterException: t('AccountErrorAlert.errors.InvalidParameterException'),
      AliasExistsException: t('AccountErrorAlert.errors.AliasExistsException', args),
      API_ERROR: t('AccountErrorAlert.errors.API_ERROR'),
      RFO_ACCESS_ERROR: t('AccountErrorAlert.errors.RFO_ACCESS_ERROR'),
      RFO_NOT_RESPONDING: t('AccountErrorAlert.errors.RFO_NOT_RESPONDING'),
      DEAD_PERSON: t('AccountErrorAlert.errors.DEAD_PERSON'),
      BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY: t(
        'AccountErrorAlert.errors.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY',
      ),
      BIRTHNUMBER_IFO_DUPLICITY: t('AccountErrorAlert.errors.BIRTHNUMBER_IFO_DUPLICITY'),
      'unsuccessful-identity-verification': t(
        'AccountErrorAlert.errors.unsuccessful-identity-verification',
      ),
      'InvalidParameterException Cannot reset password for the user as there is no registered/verified email or phone_number':
        t(
          'AccountErrorAlert.errors.InvalidParameterException Cannot reset password for the user as there is no registered/verified email or phone_number',
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

    // Unknown error
    logger.error(`${GENERIC_ERROR_MESSAGE} - unknown error with code`, error)

    return t('AccountErrorAlert.errors.unknown')
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
