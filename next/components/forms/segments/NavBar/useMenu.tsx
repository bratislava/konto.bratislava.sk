import {
  HelpIcon,
  HomeIcon,
  LogoutIcon,
  MySubmissionsIcon,
  PaymentIcon,
  ProfileIcon,
  ServicesIcon,
} from '@assets/ui-icons'
import { MenuSectionItemBase } from 'components/forms/segments/NavBar/NavBar'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import { useConditionalFormRedirects } from 'components/forms/useFormRedirects'
import { ROUTES } from 'frontend/api/constants'
import { useQueryParamRedirect } from 'frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import { useSignOut } from 'frontend/utils/amplifyClient'
import { isDefined } from 'frontend/utils/general'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'


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

  const menuSections: (MenuSectionItemBase & { hidden?: boolean })[] = [
    {
      id: 0,
      title: t('account_section_intro.navigation'),
      icon: <HomeIcon className="size-6" />,
      url: '/',
    },
    {
      id: 1,
      title: t('account_section_services.navigation'),
      icon: <ServicesIcon className="size-6" />,
      url: ROUTES.MUNICIPAL_SERVICES,
    },
    {
      id: 2,
      title: t('account_section_applications.navigation'),
      icon: <MySubmissionsIcon className="size-6" />,
      url: ROUTES.MY_APPLICATIONS,
    },
    {
      id: 3,
      title: t('account_section_payment.title'),
      icon: <PaymentIcon className="size-6" />,
      url: ROUTES.TAXES_AND_FEES,
      hidden: isLegalEntity,
    },
    {
      id: 4,
      title: t('account_section_help.navigation'),
      icon: <HelpIcon className="size-6" />,
      url: ROUTES.HELP,
    },
  ].filter((section) => isDefined(section) && !section.hidden)

  // TODO consider using this in desktop menu
  const menuItems: MenuItemBase[] = isSignedIn
    ? [
      {
        id: 0,
        title: t('menu_links.profile'),
        icon: <ProfileIcon className="size-5" />,
        url: ROUTES.USER_PROFILE,
      },
      {
        id: 1,
        title: t('menu_links.help'),
        icon: <HelpIcon className="size-5" />,
        url: ROUTES.HELP,
      },
      {
        id: 2,
        title: t('menu_links.logout'),
        icon: <LogoutIcon className="size-5 text-negative-700" />,
        onPress: () => signOut(),
        itemClassName: 'bg-negative-50',
      },
    ]
    : [
      {
        id: 0,
        title: t('menu_links.login'),
        icon: <ProfileIcon className="size-5" />,
        onPress: login,
      },
      {
        id: 1,
        title: t('menu_links.register'),
        icon: <ProfileIcon className="size-5" />,
        onPress: register,
      },
    ]

  return { menuSections, menuItems }
}

export default useMenu
