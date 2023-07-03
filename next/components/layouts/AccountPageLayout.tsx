import BusinessIcon from '@assets/images/new-icons/ui/city-services.svg'
import HelpIcon from '@assets/images/new-icons/ui/help.svg'
import HomeIcon from '@assets/images/new-icons/ui/introduction.svg'
import LogoutIcon from '@assets/images/new-icons/ui/logout.svg'
import MySubmissionIcon from '@assets/images/new-icons/ui/my-submission.svg'
import PaymentIcon from '@assets/images/new-icons/ui/payment.svg'
import ProfileIcon from '@assets/images/new-icons/ui/profile.svg'
import cx from 'classnames'
import AccountNavBar, {
  MenuSectionItemBase,
} from 'components/forms/segments/AccountNavBar/AccountNavBar'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import { usePageWrapperContext } from 'components/layouts/PageWrapper'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode, useEffect } from 'react'

import { environment } from '../../environment'
import { ROUTES } from '../../frontend/api/constants'
import useAccount from '../../frontend/hooks/useAccount'
import { isDefined } from '../../frontend/utils/general'
import logger from '../../frontend/utils/logger'

type AccountPageLayoutBase = {
  className?: string
  children: ReactNode
  hiddenHeaderNav?: boolean
  isPublicPage?: boolean
}

const AccountPageLayout = ({
  className,
  children,
  hiddenHeaderNav,
  isPublicPage,
}: AccountPageLayoutBase) => {
  const { locale, localizations = [] } = usePageWrapperContext()
  const router = useRouter()
  const { isAuth, logout } = useAccount()

  useEffect(() => {
    if (!isPublicPage && !isAuth && router.route !== ROUTES.PAYMENT_RESULT) {
      router
        .push({ pathname: ROUTES.LOGIN, query: { from: router.route } })
        .catch((error_) => logger.error('Redirect failed', error_))
    }
  }, [isAuth, isPublicPage, router])

  const [t] = useTranslation('common')

  const handleLanguageChange = async ({ key }: { key: string }) => {
    const path = localizations.find((l) => l.locale === key)?.slug || ''
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    try {
      await router.push(`/${path}`, undefined, { locale: key })
    } catch (error) {
      logger.error(error)
    }
  }

  const logoutHandler = async () => {
    logout()
    await router.push(ROUTES.LOGIN)
  }

  const sectionsList: MenuSectionItemBase[] = [
    {
      id: 0,
      title: 'account:account_section_intro.navigation',
      icon: <HomeIcon className="w-6 h-6" />,
      url: '/',
    },
    {
      id: 1,
      title: 'account:account_section_services.navigation',
      icon: <BusinessIcon className="w-6 h-6" />,
      url: ROUTES.MUNICIPAL_SERVICES,
    },
    environment.featureToggles.forms
      ? {
          id: 2,
          title: 'account:account_section_applications.navigation',
          icon: <MySubmissionIcon className="w-6 h-6" />,
          url: ROUTES.MY_APPLICATIONS,
        }
      : null,
    {
      id: 3,
      title: 'account:account_section_payment.title',
      icon: <PaymentIcon className="w-6 h-6" />,
      url: ROUTES.TAXES_AND_FEES,
    },
    {
      id: 4,
      title: 'account:account_section_help.navigation',
      icon: <HelpIcon className="w-6 h-6" />,
      url: ROUTES.HELP,
    },
  ].filter(isDefined)

  const menuItems: MenuItemBase[] = [
    {
      id: 1,
      title: t('account:menu_profile_link'),
      icon: <ProfileIcon className="w-5 h-5" />,
      url: ROUTES.USER_PROFILE,
    },
    // TODO this is duplicated today in mobile menu, we need a flag or two different lists for mobile & desktop
    {
      id: 2,
      title: t('account:menu_help_link'),
      icon: <HelpIcon className="w-5 h-5" />,
      url: ROUTES.HELP,
    },
    {
      id: 3,
      title: t('account:menu_logout_link'),
      icon: <LogoutIcon className="text-negative-700 w-5 h-5" />,
      onPress: logoutHandler,
      itemClassName: 'bg-negative-50',
    },
  ]

  return (
    <div className={cx('flex flex-col min-h-screen', className)}>
      <AccountNavBar
        currentLanguage={locale}
        onLanguageChange={handleLanguageChange}
        sectionsList={sectionsList}
        menuItems={menuItems}
        navHidden
        hiddenHeaderNav={hiddenHeaderNav}
        languages={[
          { key: 'sk', title: t('language_long.sk') },
          { key: 'en', title: t('language_long.en') },
        ]}
      />
      <div className="bg-gray-0">{children}</div>
    </div>
  )
}

export default AccountPageLayout
