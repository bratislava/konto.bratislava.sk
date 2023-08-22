import Alert from 'components/forms/info-components/Alert'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { GENERIC_ERROR_MESSAGE, isError, isErrorWithCode } from 'frontend/utils/errors'
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
  const { t, i18n } = useTranslation()

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
      return t(`account:errors.unknown`)
    }
    if (!isErrorWithCode(error)) {
      // JSON.stringify here because amplify returns custom errors which pino tries to serialize but fails (they either don't have 'message' attribute or have it as private)
      logger.error(
        `${GENERIC_ERROR_MESSAGE} - unknown error without error code in AccountErrorAlert: `,
        error.message,
        JSON.stringify(error),
      )
      return t(`account:errors.unknown`)
    }
    if (!i18n.exists(`account:errors.${error.code}`)) {
      logger.error(`${GENERIC_ERROR_MESSAGE} - unknown error with code`, error.code, errorMessage)
      return t(`account:errors.unknown`)
    }
    // this is the expected case - known error for which we have a translation string
    const formattedMessage = t(`account:errors.${error.code}`, args)
    logger.info('Known error', error.code, error.message, formattedMessage)
    return formattedMessage
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
