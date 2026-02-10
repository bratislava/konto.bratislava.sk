import Link, { LinkProps } from 'next/link'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '@/frontend/api/constants'
import { useQueryParamRedirect } from '@/frontend/hooks/useQueryParamRedirect'

type Props = {
  variant: 'login' | 'registration' | 'forgotten-password'
}

const AccountLink = ({ variant }: Props) => {
  const { t } = useTranslation('account')
  const { getRouteWithRedirect } = useQueryParamRedirect()

  const { label, description, href } = (
    {
      login: {
        label: t('auth.links.login_link_text'),
        description: t('auth.links.login_description'),
        href: getRouteWithRedirect(ROUTES.LOGIN),
      },
      registration: {
        label: t('auth.links.register_link_text'),
        description: t('auth.links.register_description'),
        href: getRouteWithRedirect(ROUTES.REGISTER),
      },
      'forgotten-password': {
        label: t('auth.links.forgotten_password_link_text'),
        description: t('auth.links.forgotten_password_description'),
        href: getRouteWithRedirect(ROUTES.FORGOTTEN_PASSWORD),
      },
    } satisfies Record<
      Props['variant'],
      { label: string; description: string; href: LinkProps['href'] }
    >
  )[variant]

  return (
    <div className="flex flex-col justify-between md:flex-row">
      <div className="text-16-semibold text-gray-800">{description}</div>
      <Link
        href={href}
        className="font-semibold text-gray-700 underline hover:text-gray-600 focus:text-gray-800"
      >
        {label}
      </Link>
    </div>
  )
}

export default AccountLink
