import {
  HelpIcon,
  HomeIcon,
  LogoutIcon,
  MySubmissionsIcon,
  PaymentIcon,
  ProfileIcon,
  ServicesIcon,
} from '@assets/ui-icons'
import { Auth } from 'aws-amplify'
import cx from 'classnames'
import NavBar, { MenuSectionItemBase } from 'components/forms/segments/NavBar/NavBar'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

import { ROUTES } from '../../frontend/api/constants'
import { isDefined } from '../../frontend/utils/general'

type AccountPageLayoutBase = {
  className?: string
  children: ReactNode
  hiddenHeaderNav?: boolean
}

const AccountPageLayout = ({ className, children, hiddenHeaderNav }: AccountPageLayoutBase) => {
  const router = useRouter()

  const [t] = useTranslation('common')

  const logoutHandler = async () => {
    await Auth.signOut()
    await router.push(ROUTES.LOGIN)
  }

  const sectionsList: MenuSectionItemBase[] = [
    {
      id: 0,
      title: 'account:account_section_intro.navigation',
      icon: <HomeIcon className="h-6 w-6" />,
      url: '/',
    },
    {
      id: 1,
      title: 'account:account_section_services.navigation',
      icon: <ServicesIcon className="h-6 w-6" />,
      url: ROUTES.MUNICIPAL_SERVICES,
    },
    {
      id: 2,
      title: 'account:account_section_applications.navigation',
      icon: <MySubmissionsIcon className="h-6 w-6" />,
      url: ROUTES.MY_APPLICATIONS,
    },
    {
      id: 3,
      title: 'account:account_section_payment.title',
      icon: <PaymentIcon className="h-6 w-6" />,
      url: ROUTES.TAXES_AND_FEES,
    },
    {
      id: 4,
      title: 'account:account_section_help.navigation',
      icon: <HelpIcon className="h-6 w-6" />,
      url: ROUTES.HELP,
    },
  ].filter(isDefined)

  const menuItems: MenuItemBase[] = [
    {
      id: 1,
      title: t('account:menu_profile_link'),
      icon: <ProfileIcon className="h-5 w-5" />,
      url: ROUTES.USER_PROFILE,
    },
    // TODO this is duplicated today in mobile menu, we need a flag or two different lists for mobile & desktop
    {
      id: 2,
      title: t('account:menu_help_link'),
      icon: <HelpIcon className="h-5 w-5" />,
      url: ROUTES.HELP,
    },
    {
      id: 3,
      title: t('account:menu_logout_link'),
      icon: <LogoutIcon className="h-5 w-5 text-negative-700" />,
      onPress: logoutHandler,
      itemClassName: 'bg-negative-50',
    },
  ]

  return (
    <div className={cx('flex min-h-screen flex-col', className)}>
      <header className="relative z-30">
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
      <main className="relative z-0">
        <div className="bg-gray-0">{children}</div>
      </main>
    </div>
  )
}

export default AccountPageLayout
