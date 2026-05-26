import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { ReactNode } from 'react'

import { useConditionalFormRedirects } from '@/src/components/forms/useFormRedirects'
import Icon from '@/src/components/icon-components/Icon'
import { MenuItemBase } from '@/src/components/simple-components/MenuDropdown/MenuDropdown'
import { useQueryParamRedirect } from '@/src/frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { useSignOut } from '@/src/frontend/utils/amplifyClient'
import { isDefined } from '@/src/frontend/utils/general'
import { ROUTES } from '@/src/utils/routes'

export type MenuSectionBase = {
  id: number
  title: string
  icon: ReactNode
  url: string
}

export const useMenu = () => {
  const { t } = useTranslation('account')

  const { isSignedIn, isLegalEntity } = useSsrAuth()
  const { signOut } = useSignOut()

  // we need to keep the work in progress of the open form if navigating away form it
  const optionalFormRedirectsContext = useConditionalFormRedirects()
  const { getRouteWithCurrentUrlRedirect } = useQueryParamRedirect()
  const router = useRouter()

  const login = optionalFormRedirectsContext
    ? () => optionalFormRedirectsContext.login()
    : async () => {
        await router.push(getRouteWithCurrentUrlRedirect(ROUTES.LOGIN))
      }

  const register = optionalFormRedirectsContext
    ? () => optionalFormRedirectsContext.register()
    : async () => {
        await router.push(getRouteWithCurrentUrlRedirect(ROUTES.REGISTER))
      }

  const menuSections: (MenuSectionBase & { hidden?: boolean })[] = [
    {
      id: 0,
      title: t('account_section_intro.navigation'),
      icon: <Icon name="home" className="size-6" />,
      url: '/',
    },
    {
      id: 1,
      title: t('account_section_services.navigation'),
      icon: <Icon name="city-services" className="size-6" />,
      url: ROUTES.MUNICIPAL_SERVICES,
    },
    {
      id: 2,
      title: t('account_section_applications.navigation'),
      icon: <Icon name="submission" className="size-6" />,
      url: ROUTES.MY_APPLICATIONS,
    },
    {
      id: 3,
      title: t('account_section_payment.title'),
      icon: <Icon name="payment" className="size-6" />,
      url: ROUTES.TAXES_AND_FEES,
      hidden: isLegalEntity,
    },
  ].filter((section) => isDefined(section) && !section.hidden)

  // TODO consider using this in desktop menu
  const menuItems: MenuItemBase[] = isSignedIn
    ? [
        {
          id: 0,
          title: t('menu_links.profile'),
          icon: <Icon name="user" className="size-5" />,
          url: ROUTES.USER_PROFILE,
        },
        {
          id: 1,
          title: t('menu_links.help'),
          icon: <Icon name="help" className="size-5" />,
          url: ROUTES.HELP,
        },
        {
          id: 2,
          title: t('menu_links.logout'),
          icon: <Icon name="logout" className="size-5 text-negative-700" />,
          onPress: () => signOut(),
          itemClassName: 'bg-negative-50',
        },
      ]
    : [
        {
          id: 0,
          title: t('menu_links.login'),
          icon: <Icon name="user" className="size-5" />,
          onPress: login,
        },
        {
          id: 1,
          title: t('menu_links.register'),
          icon: <Icon name="user" className="size-5" />,
          onPress: register,
        },
      ]

  return { menuSections, menuItems }
}

export default useMenu
