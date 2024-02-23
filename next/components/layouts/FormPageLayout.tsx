import { CityAccountIcon, HelpIcon, LogoutIcon, ProfileIcon } from '@assets/ui-icons'
import cx from 'classnames'
import NavBar from 'components/forms/segments/NavBar/NavBar'
import SectionContainer from 'components/forms/segments/SectionContainer/SectionContainer'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

import { ROUTES } from '../../frontend/api/constants'

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
  const [t] = useTranslation()

  return (
    <div className={cx('flex min-h-screen flex-col', className)}>
      <SectionContainer>
        <NavBar
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
