import { CityAccountIcon, HelpIcon, LogoutIcon, ProfileIcon } from '@assets/ui-icons'
import cx from 'classnames'
import AccountNavBar from 'components/forms/segments/AccountNavBar/AccountNavBar'
import SectionContainer from 'components/forms/segments/SectionContainer/SectionContainer'
import { usePageWrapperContext } from 'components/layouts/PageWrapper'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

import { ROUTES } from '../../frontend/api/constants'
import logger from '../../frontend/utils/logger'

type FormPageLayoutBase = {
  className?: string
  children: ReactNode
  navHidden?: boolean
}

const menuItems = [
  {
    id: 1,
    title: 'account:menu_account_link',
    icon: <CityAccountIcon className="h-6 w-6" />,
    link: '/',
  },
  {
    id: 2,
    title: 'account:menu_profile_link',
    icon: <ProfileIcon className="h-6 w-6" />,
    link: ROUTES.USER_PROFILE,
  },
  {
    id: 3,
    title: 'account:menu_help_link',
    icon: <HelpIcon className="h-6 w-6" />,
    link: ROUTES.HELP,
  },
  {
    id: 4,
    title: 'account:menu_logout_link',
    icon: <LogoutIcon className="h-6 w-6" />,
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
      logger.error(error)
    }
  }

  return (
    <div className={cx('flex min-h-screen flex-col', className)}>
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
