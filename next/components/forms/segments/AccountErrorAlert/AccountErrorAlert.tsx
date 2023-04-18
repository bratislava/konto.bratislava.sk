import logger from '@utils/logger'
import { Args, formatUnicorn } from '@utils/string'
import { AccountError } from '@utils/useAccount'
import Alert from 'components/forms/info-components/Alert'
import AccountMarkdown from 'components/forms/segments/AccountMarkdown/AccountMarkdown'
import { useTranslation } from 'next-i18next'

interface Props {
  error?: AccountError | null
  args?: Args
  close?: () => void
  solid?: boolean
}

const AccountErrorAlert = ({ error, close, solid, args = {} }: Props) => {
  const { t, i18n } = useTranslation()

  if (!error) {
    return null
  }

  let errorMessage
  if (i18n.exists(`account:errors.${error.code}`)) {
    errorMessage = formatUnicorn(t(`account:errors.${error.code}`), args)
    logger.error('Known error', error.code, errorMessage)
  } else {
    errorMessage = t(`account:errors.unknown`)
    logger.error('Unknown error', error.code, errorMessage)
  }
  return (
    <Alert
      message={<AccountMarkdown content={errorMessage} variant="sm" disableRemarkGfm />}
      type="error"
      className="min-w-full"
      close={close}
      solid={solid}
    />
  )
}

export default AccountErrorAlert
