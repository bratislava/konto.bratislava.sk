import url from 'node:url'

import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { MLinkProps } from '@/src/components/simple-components/MLink'
import { useQueryParamRedirect } from '@/src/frontend/hooks/useQueryParamRedirect'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  variant: 'login' | 'registration' | 'forgotten-password'
  // Used in RegistrationModal for saving drafts before logging-in and redirecting back to form
  // The function passed to onLoginPress MUST contain redirect to login page, since the href is ignored
  onLoginPress?: () => void
}

const AccountLink = ({ variant, onLoginPress: onLoginPressFromProps }: Props) => {
  const { t } = useTranslation()

  const { getRouteWithRedirect } = useQueryParamRedirect()

  const { label, description, href, onLoginPress } = (
    {
      login: {
        label: t('AccountLink.login.linkText'),
        description: t('AccountLink.login.description'),
        // Standard href to login page, used when onLoginPress is undefined
        href: getRouteWithRedirect(ROUTES.LOGIN),
        onLoginPress: onLoginPressFromProps,
      },
      registration: {
        label: t('AccountLink.register.linkText'),
        description: t('AccountLink.register.description'),
        href: getRouteWithRedirect(ROUTES.REGISTER),
      },
      'forgotten-password': {
        label: t('AccountLink.forgottenPassword.linkText'),
        description: t('AccountLink.forgottenPassword.description'),
        href: getRouteWithRedirect(ROUTES.FORGOTTEN_PASSWORD),
      },
    } satisfies Record<
      Props['variant'],
      { label: string; description: string; href: MLinkProps['href']; onLoginPress?: () => void }
    >
  )[variant]

  return (
    <div className="flex flex-col justify-between lg:flex-row">
      <Typography variant="p-small" className="font-semibold text-gray-800">
        {description}
      </Typography>
      <Button
        variant="link"
        className="font-semibold"
        // Ignore the href if onLoginPress is present
        {...(onLoginPress
          ? { onPress: onLoginPress }
          : {
              // getRouteWithRedirect returns UrlObject, so we must convert it to string (until Button accepts UrlObject as href).
              href: url.format(href),
              hasLinkIcon: false,
            })}
      >
        {label}
      </Button>
    </div>
  )
}

export default AccountLink
