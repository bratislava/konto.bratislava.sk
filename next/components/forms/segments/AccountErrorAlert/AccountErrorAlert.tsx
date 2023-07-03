import Alert from 'components/forms/info-components/Alert'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { isError, isErrorWithCode } from 'frontend/utils/errors'
import { useTranslation } from 'next-i18next'

import logger from '../../../../frontend/utils/logger'
import { Args, formatUnicorn } from '../../../../frontend/utils/string'

interface Props {
  error?: unknown
  args?: Args
  close?: () => void
  solid?: boolean
}

const AccountErrorAlert = ({ error, close, solid, args = {} }: Props) => {
  const { t, i18n } = useTranslation()

  if (!error) {
    return null
  }

  let errorMessage: string

  if (!isError(error)) {
    errorMessage = t(`account:errors.unknown`)
    logger.error(
      'Unexpected Error - instance without message passed into AccountErrorAlert as an error: ',
      error,
    )
  } else if (!isErrorWithCode(error)) {
    errorMessage = t(`account:errors.unknown`)
    logger.error(
      'Unexpected Error - unknown error without error code in AccountErrorAlert: ',
      error.message,
      error,
    )
  } else if (!i18n.exists(`account:errors.${error.code}`)) {
    errorMessage = t(`account:errors.unknown`)
    logger.error('Unexpected Error - unknown error with code', error.code, errorMessage)
  } else {
    // this is the expected case - known error for which we have a translation string
    errorMessage = formatUnicorn(t(`account:errors.${error.code}`), args)
    logger.info('Known error', error.code, error.message, errorMessage, error)
  }
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
