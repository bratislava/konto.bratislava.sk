import HelpIcon from '@assets/images/new-icons/ui/help.svg'
import LogoutIcon from '@assets/images/new-icons/ui/logout.svg'
import CityIcon from '@assets/images/new-icons/ui/municipal-account.svg'
import ProfileIcon from '@assets/images/new-icons/ui/profile.svg'
import { ROUTES } from '@utils/constants'
import cx from 'classnames'
import AccountNavBar from 'components/forms/segments/AccountNavBar/AccountNavBar'
import SectionContainer from 'components/forms/segments/SectionContainer/SectionContainer'
import { usePageWrapperContext } from 'components/layouts/PageWrapper'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

type FormPageLayoutBase = {
  className?: string
  children: ReactNode
  navHidden?: boolean
}

const menuItems = [
  {
    id: 1,
    title: 'account:menu_account_link',
    icon: <CityIcon className="w-6 h-6" />,
    link: '/',
  },
  {
    id: 2,
    title: 'account:menu_profile_link',
    icon: <ProfileIcon className="w-6 h-6" />,
    link: '/user-profile',
  },
  {
    id: 3,
    title: 'account:menu_help_link',
    icon: <HelpIcon className="w-6 h-6" />,
    link: ROUTES.I_HAVE_A_PROBLEM,
  },
  {
    id: 4,
    title: 'account:menu_logout_link',
    icon: <LogoutIcon className="w-6 h-6" />,
    link: '/logout',
  },
]

const FormPageLayout = ({ className, navHidden, children }: FormPageLayoutBase) => {
  const { locale, localizations = [] } = usePageWrapperContext()
  const router = useRouter()

  const [t] = useTranslation()

  const handleLanguageChange = async ({ key }: { key: string }) => {
    const path = localizations.find((l) => l.locale === key)?.slug || ''
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    try {
      await router.push(`/${path}`, undefined, { locale: key })
    } catch (error) {
      // TODO send error to Faro
      console.error(error)
    }
  }

  return (
    <div className={cx('flex flex-col min-h-screen', className)}>
      <SectionContainer>
        <AccountNavBar
          currentLanguage={locale}
          onLanguageChange={handleLanguageChange}
          menuItems={menuItems}
          navHidden={navHidden}
          languages={[
            { key: 'sk', title: t('language_long.sk') },
            { key: 'en', title: t('language_long.en') },
          ]}
        />
      </SectionContainer>

      <div className="bg-gray-0">{children}</div>
    </div>
  )
}

export default FormPageLayout
