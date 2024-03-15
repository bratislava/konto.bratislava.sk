import {
  HelpIcon,
  HomeIcon,
  LogoutIcon,
  MySubmissionsIcon,
  PaymentIcon,
  ProfileIcon,
  ServicesIcon,
} from '@assets/ui-icons'
import { useResizeObserver } from '@react-aria/utils'
import cx from 'classnames'
import NavBar, { MenuSectionItemBase } from 'components/forms/segments/NavBar/NavBar'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import { useConditionalFormRedirects } from 'components/forms/useFormRedirects'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode, useRef, useState } from 'react'

import { ROUTES } from '../../frontend/api/constants'
import { useQueryParamRedirect } from '../../frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '../../frontend/hooks/useSsrAuth'
import { useSignOut } from '../../frontend/utils/amplifyClient'
import { isDefined } from '../../frontend/utils/general'

type AccountPageLayoutBase = {
  className?: string
  children: ReactNode
  hiddenHeaderNav?: boolean
}

declare module 'react' {
  interface CSSProperties {
    '--main-scroll-top-margin'?: string
  }
}

const AccountPageLayout = ({ className, children, hiddenHeaderNav }: AccountPageLayoutBase) => {
  const { getRouteWithCurrentUrlRedirect } = useQueryParamRedirect()
  const { isSignedIn } = useSsrAuth()
  const { signOut } = useSignOut()

  const router = useRouter()
  const headerRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  // https://stackoverflow.com/a/59253905
  const [mainScrollTopMargin, setMainScrollTopMargin] = useState(0)

  useResizeObserver({
    ref: headerRef,
    onResize: () => {
      setMainScrollTopMargin(mainRef.current?.offsetTop ?? 0)
    },
  })

  const [t] = useTranslation('common')

  // we need to keep the work in progress of the open form if navigating away form it
  const optionalFormRedirectsContext = useConditionalFormRedirects()
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

  const sectionsList: MenuSectionItemBase[] = [
    {
      id: 0,
      title: 'account:account_section_intro.navigation',
      icon: <HomeIcon className="size-6" />,
      url: '/',
    },
    {
      id: 1,
      title: 'account:account_section_services.navigation',
      icon: <ServicesIcon className="size-6" />,
      url: ROUTES.MUNICIPAL_SERVICES,
    },
    {
      id: 2,
      title: 'account:account_section_applications.navigation',
      icon: <MySubmissionsIcon className="size-6" />,
      url: ROUTES.MY_APPLICATIONS,
    },
    {
      id: 3,
      title: 'account:account_section_payment.title',
      icon: <PaymentIcon className="size-6" />,
      url: ROUTES.TAXES_AND_FEES,
    },
    {
      id: 4,
      title: 'account:account_section_help.navigation',
      icon: <HelpIcon className="size-6" />,
      url: ROUTES.HELP,
    },
  ].filter(isDefined)

  // TODO consider using this in desktop menu
  const menuItems: MenuItemBase[] = isSignedIn
    ? [
        {
          id: 0,
          title: t('account:menu_profile_link'),
          icon: <ProfileIcon className="size-5" />,
          url: ROUTES.USER_PROFILE,
        },
        {
          id: 1,
          title: t('account:menu_help_link'),
          icon: <HelpIcon className="size-5" />,
          url: ROUTES.HELP,
        },
        {
          id: 2,
          title: t('account:menu_logout_link'),
          icon: <LogoutIcon className="size-5 text-negative-700" />,
          onPress: () => signOut(),
          itemClassName: 'bg-negative-50',
        },
      ]
    : [
        {
          id: 0,
          title: t('account:menu_login_link'),
          icon: <ProfileIcon className="size-5" />,
          onPress: login,
        },
        {
          id: 1,
          title: t('account:menu_register_link'),
          icon: <ProfileIcon className="size-5" />,
          onPress: register,
        },
      ]

  return (
    <div className={cx('flex min-h-screen flex-col', className)}>
      <header className="relative z-30" ref={headerRef}>
        <NavBar
          sectionsList={sectionsList}
          menuItems={menuItems}
          navHidden
          hiddenHeaderNav={hiddenHeaderNav}
          languages={[
            { key: 'sk', title: t('language_long.sk') },
            { key: 'en', title: t('language_long.en') },
          ]}
        />
      </header>
      <main
        ref={mainRef}
        style={{
          '--main-scroll-top-margin': `${mainScrollTopMargin}px`,
        }}
        className="relative z-0 [&_*]:scroll-mt-[--main-scroll-top-margin]"
      >
        <div className="bg-gray-0">{children}</div>
      </main>
    </div>
  )
}

export default AccountPageLayout
