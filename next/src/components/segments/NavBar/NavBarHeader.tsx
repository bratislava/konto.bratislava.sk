import { Button } from '@bratislava/component-library'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { ChevronDownSmallIcon } from '@/src/assets/ui-icons'
import { useConditionalFormRedirects } from '@/src/components/forms/useFormRedirects'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import UserAvatar from '@/src/components/segments/NavBar/UserAvatar'
import Brand from '@/src/components/simple-components/Brand'
import IdentityVerificationStatus from '@/src/components/simple-components/IdentityVerificationStatus'
import MenuDropdown, {
  MenuItemBase,
} from '@/src/components/simple-components/MenuDropdown/MenuDropdown'
import { useQueryParamRedirect } from '@/src/frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import cn from '@/src/utils/cn'
import { ROUTES } from '@/src/utils/routes'

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
    <SectionContainer>
      <div className="flex h-[57px] items-center gap-x-6">
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
    </SectionContainer>
  )
}

export default NavBarHeader
