import Alert from 'components/forms/info-components/Alert'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { GENERIC_ERROR_MESSAGE, isError, isErrorWithoutName } from 'frontend/utils/errors'
import { useTranslation } from 'next-i18next'
import { useMemo } from 'react'

import logger from '../../../../frontend/utils/logger'

interface Props {
  error?: Error | null
  args?: { [key: string]: string | number }
  close?: () => void
  solid?: boolean
}

const AccountErrorAlert = ({ error, close, solid, args = {} }: Props) => {
  const { t } = useTranslation()

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
      return t('account:errors.unknown')
    }
    if (isErrorWithoutName(error)) {
      // JSON.stringify here because amplify returns custom errors which pino tries to serialize but fails (they either don't have 'message' attribute or have it as private)
      logger.error(
        `${GENERIC_ERROR_MESSAGE} - unknown error without error code in AccountErrorAlert: `,
        error.message,
        JSON.stringify(error),
      )
      return t('account:errors.unknown')
    }

    // Translation map for all known errors
    const errorTranslationMap: Record<string, string> = {
      unknown: t('account:errors.unknown'),
      UserLambdaValidationException: t('account:errors.UserLambdaValidationException'),
      'Bad Request': t('account:errors.Bad Request'),
      NotAuthorizedException: t('account:errors.NotAuthorizedException'),
      'NotAuthorizedException User is disabled.': t(
        'account:errors.NotAuthorizedException User is disabled.',
      ),
      CodeMismatchException: t('account:errors.CodeMismatchException'),
      LimitExceededException: t('account:errors.LimitExceededException'),
      UserNotFoundException: t('account:errors.UserNotFoundException'),
      MigrationUserNotFoundException: t('account:errors.MigrationUserNotFoundException', args),
      UserNotConfirmedException: t('account:errors.UserNotConfirmedException'),
      UsernameExistsException: t('account:errors.UsernameExistsException', args),
      ExpiredCodeException: t('account:errors.ExpiredCodeException'),
      IncorrectPasswordException: t('account:errors.IncorrectPasswordException'),
      AliasExistsException: t('account:errors.AliasExistsException', args),
      API_ERROR: t('account:errors.API_ERROR'),
      RFO_ACCESS_ERROR: t('account:errors.RFO_ACCESS_ERROR'),
      RFO_NOT_RESPONDING: t('account:errors.RFO_NOT_RESPONDING'),
      DEAD_PERSON: t('account:errors.DEAD_PERSON'),
      BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY: t(
        'account:errors.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY',
      ),
      BIRTHNUMBER_IFO_DUPLICITY: t('account:errors.BIRTHNUMBER_IFO_DUPLICITY'),
      'unsuccessful-identity-verification': t('account:errors.unsuccessful-identity-verification'),
      'InvalidParameterException Cannot reset password for the user as there is no registered/verified email or phone_number':
        t(
          'account:errors.InvalidParameterException Cannot reset password for the user as there is no registered/verified email or phone_number',
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
    return t('account:errors.unknown')
    // exhaustive-deps disabled because args tend to be passed in as an object re-created on every render
    // instead of fixing this, we may want to get rid of args/present version of formatUnicorn altogether
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  if (!errorMessage) return null

  return (
    <Alert
      message={
        <AccountMarkdown
          // not sure, but maybe there need to be error variant
          // uLinkVariant="error"
          content={errorMessage}
          variant="sm"
          disableRemarkGfm
        />
      }
      type="error"
      className="min-w-full"
      close={close}
      solid={solid}
    />
  )
}

export default AccountErrorAlert
