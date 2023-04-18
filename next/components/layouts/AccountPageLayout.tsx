import BusinessIcon from '@assets/images/new-icons/ui/city-services.svg'
import HelpIcon from '@assets/images/new-icons/ui/help.svg'
import HomeIcon from '@assets/images/new-icons/ui/introduction.svg'
import LogoutIcon from '@assets/images/new-icons/ui/logout.svg'
import MySubmissionIcon from '@assets/images/new-icons/ui/my-submission.svg'
import PaymentIcon from '@assets/images/new-icons/ui/payment.svg'
import ProfileIcon from '@assets/images/new-icons/ui/profile.svg'
import { ROUTES } from '@utils/constants'
import logger from '@utils/logger'
import useAccount from '@utils/useAccount'
import cx from 'classnames'
import AccountNavBar from 'components/forms/segments/AccountNavBar/AccountNavBar'
import { usePageWrapperContext } from 'components/layouts/PageWrapper'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode, useEffect } from 'react'

type AccountPageLayoutBase = {
  className?: string
  children: ReactNode
  hiddenHeaderNav?: boolean
}

const sectionsList = [
  {
    id: 0,
    title: 'account:account_section_intro.navigation',
    icon: <HomeIcon className="w-6 h-6" />,
    link: '/',
  },
  {
    id: 1,
    title: 'account:account_section_services.navigation',
    icon: <BusinessIcon className="w-6 h-6" />,
    link: ROUTES.MUNICIPAL_SERVICES,
  },
  {
    id: 2,
    title: 'account:account_section_applications.navigation',
    icon: <MySubmissionIcon className="w-6 h-6" />,
    link: ROUTES.MY_APPLICATIONS,
  },
  {
    id: 3,
    title: 'account:account_section_payment.title',
    icon: <PaymentIcon className="w-6 h-6" />,
    link: ROUTES.TAXES_AND_FEES,
  },
  {
    id: 4,
    title: 'account:account_section_help.navigation',
    icon: <HelpIcon className="w-6 h-6" />,
    link: ROUTES.I_HAVE_A_PROBLEM,
  },
]

const menuItems = [
  {
    id: 1,
    title: 'account:menu_profile_link',
    icon: <ProfileIcon className="w-5 h-5" />,
    link: ROUTES.USER_PROFILE,
  },
  {
    id: 2,
    title: 'account:menu_help_link',
    icon: <HelpIcon className="w-5 h-5" />,
    link: ROUTES.I_HAVE_A_PROBLEM,
  },
  {
    id: 3,
    title: 'account:menu_logout_link',
    icon: <LogoutIcon className="text-negative-700 w-5 h-5" />,
    link: '/logout',
    backgroundColor: 'bg-negative-50',
  },
]

const AccountPageLayout = ({ className, children, hiddenHeaderNav }: AccountPageLayoutBase) => {
  const { locale, localizations = [] } = usePageWrapperContext()
  const router = useRouter()
  const { isAuth } = useAccount()
  useEffect(() => {
    if (!isAuth) {
      router
        .push({ pathname: ROUTES.LOGIN, query: { from: router.route } })
        .catch((error_) => logger.error('Redirect failed', error_))
    }
  }, [isAuth])

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
