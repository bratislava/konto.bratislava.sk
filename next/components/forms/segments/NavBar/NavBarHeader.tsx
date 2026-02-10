import UserAvatar from 'components/forms/segments/NavBar/UserAvatar'
import Brand from 'components/forms/simple-components/Brand'
import Button from 'components/forms/simple-components/Button'
import IdentityVerificationStatus from 'components/forms/simple-components/IdentityVerificationStatus'
import MenuDropdown, {
  MenuItemBase,
} from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import { useConditionalFormRedirects } from 'components/forms/useFormRedirects'
import { ROUTES } from 'frontend/api/constants'
import cn from 'frontend/cn'
import { useQueryParamRedirect } from 'frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { ChevronDownSmallIcon } from '@/assets/ui-icons'

type Props = {
  menuItems: MenuItemBase[]
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=EGiWvvrAjJLDEfQk-4
 */

export const NavBarHeader = ({ menuItems }: Props) => {
  const { t } = useTranslation('account')
  const router = useRouter()

  const { getRouteWithCurrentUrlRedirect } = useQueryParamRedirect()
  const { userAttributes, isSignedIn, isLegalEntity } = useSsrAuth()

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  // we need to keep the work in progress of the open form if navigating away form it
  const optionalFormRedirectsContext = useConditionalFormRedirects()
  const login = () =>
    optionalFormRedirectsContext
      ? optionalFormRedirectsContext.login()
      : router.push(getRouteWithCurrentUrlRedirect(ROUTES.LOGIN))
  const register = () =>
    optionalFormRedirectsContext
      ? optionalFormRedirectsContext.register()
      : router.push(getRouteWithCurrentUrlRedirect(ROUTES.REGISTER))

  return (
    <div className="m-auto hidden h-[57px] max-w-(--breakpoint-lg) items-center gap-x-6 lg:flex">
      <Brand
        className="group grow"
        url={ROUTES.HOME}
        title={
          <p className="text-p2 text-font group-hover:text-gray-600">
            {t('NavBar.capitalCityOfSR')}
            <span className="font-semibold"> Bratislava</span>
          </p>
        }
      />
      <IdentityVerificationStatus />
      <nav className="flex gap-x-8 font-semibold text-font/75">
        {isSignedIn ? (
          <MenuDropdown
            setIsOpen={setIsMenuOpen}
            buttonTrigger={
              <Button
                variant="unstyled"
                data-cy="account-button"
                className="flex items-center gap-4 font-semibold text-font/75"
              >
                <UserAvatar userAttributes={userAttributes} />
                <div className="flex items-center gap-1 font-light lg:font-semibold">
                  {isLegalEntity ? userAttributes?.name : userAttributes?.given_name}
                  <ChevronDownSmallIcon
                    className={cn('hidden size-5 mix-blend-normal lg:flex', {
                      '-rotate-180': isMenuOpen,
                    })}
                  />
                </div>
              </Button>
            }
            itemVariant="header"
            items={menuItems}
          />
        ) : (
          <div className="flex items-center gap-6">
            <Button variant="plain" size="small" onPress={login} data-cy="login-button">
              {t('menu_links.login')}
            </Button>
            <Button variant="solid" onPress={register} size="small" data-cy="register-button">
              {t('menu_links.register')}
            </Button>
          </div>
        )}
      </nav>
    </div>
  )
}

export default NavBarHeader
