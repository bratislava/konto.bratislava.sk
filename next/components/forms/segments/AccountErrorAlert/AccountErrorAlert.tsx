import { Args, formatUnicorn } from '@utils/string'
import { AccountError } from '@utils/useAccount'
import Alert from 'components/forms/info-components/Alert'
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

  const errorMessage = i18n.exists(`account:errors.${error.code}`)
    ? formatUnicorn(t(`account:errors.${error.code}`), args)
    : t(`account:errors.unknown`)
  return (
    <Alert message={errorMessage} type="error" className="min-w-full" close={close} solid={solid} />
  )
}

export default AccountErrorAlert
