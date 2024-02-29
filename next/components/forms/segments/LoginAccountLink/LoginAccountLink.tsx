import AccountLink from 'components/forms/segments/AccountLink/AccountLink'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../frontend/api/constants'
import { useLoginRedirect } from '../../../../frontend/hooks/useLoginRedirect'

const LoginAccountLink = () => {
  const { getRouteWithCurrentUrlAsLoginRedirect } = useLoginRedirect()
  const { t } = useTranslation('account')

  return (
    <AccountLink
      label={t('login_link')}
      description={t('login_description')}
      href={getRouteWithCurrentUrlAsLoginRedirect(ROUTES.LOGIN)}
    />
  )
}

export default LoginAccountLink
