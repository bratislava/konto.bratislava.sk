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
  const { isSignedIn, isLegalEntity } = useSsrAuth()
  const { signOut } = useSignOut()

  const router = useRouter()
  // https://stackoverflow.com/a/59253905
  const [mainScrollTopMargin, setMainScrollTopMargin] = useState(0)

  // It is not possible to measure the height of header directly, because it is `display: contents`, the header also
  // might include status bar, that we don't want to include in the height calculation because it hides when scrolling
  // (as it is not sticky)
  const desktopNavbarRef = useRef<HTMLDivElement>(null)
  const mobileNavbarRef = useRef<HTMLDivElement>(null)

  const handleHeaderResize = () => {
    setMainScrollTopMargin(
      Math.max(
        desktopNavbarRef.current?.getBoundingClientRect().height ?? 0,
        mobileNavbarRef.current?.getBoundingClientRect().height ?? 0,
      ),
    )
  }

  useResizeObserver({ ref: desktopNavbarRef, onResize: handleHeaderResize })
  useResizeObserver({ ref: mobileNavbarRef, onResize: handleHeaderResize })

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

  // Hide taxes and fees section for legal entities
  const filteredSections = sectionsList.filter(
    (section) => !(isLegalEntity && section.url === ROUTES.TAXES_AND_FEES),
  )

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
          icon: <LogoutIcon className="text-negative-700 size-5" />,
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
      {/* `contents` is here for sticky elements inside to work */}
      <header className="relative z-30 contents">
        <NavBar
          sectionsList={filteredSections}
          menuItems={menuItems}
          navHidden
          hiddenHeaderNav={hiddenHeaderNav}
          languages={[
            { key: 'sk', title: t('language_long.sk') },
            { key: 'en', title: t('language_long.en') },
          ]}
          desktopNavbarRef={desktopNavbarRef}
          mobileNavbarRef={mobileNavbarRef}
        />
      </header>
      <main
        style={{
          '--main-scroll-top-margin': `${mainScrollTopMargin}px`,
        }}
        className="**:scroll-mt-(--main-scroll-top-margin) relative z-0"
      >
        <div className="bg-gray-0">{children}</div>
      </main>
    </div>
  )
}

export default AccountPageLayout
