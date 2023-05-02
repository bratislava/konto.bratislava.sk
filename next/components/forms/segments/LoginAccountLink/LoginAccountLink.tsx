import AccountLink from 'components/forms/segments/AccountLink/AccountLink'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../frontend/api/constants'

const LoginAccountLink = () => {
  const { t } = useTranslation('account')

  return (
    <AccountLink label={t('login_link')} description={t('login_description')} href={ROUTES.LOGIN} />
  )
}

export default LoginAccountLink
