import AccountLink from 'components/forms/segments/AccountLink/AccountLink'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../frontend/api/constants'
import { useQueryParamRedirect } from '../../../../frontend/hooks/useQueryParamRedirect'

const LoginAccountLink = () => {
  const { getRouteWithRedirect } = useQueryParamRedirect()
  const { t } = useTranslation('account')

  return (
    <AccountLink
      label={t('login_link')}
      description={t('login_description')}
      href={getRouteWithRedirect(ROUTES.LOGIN)}
    />
  )
}

export default LoginAccountLink
