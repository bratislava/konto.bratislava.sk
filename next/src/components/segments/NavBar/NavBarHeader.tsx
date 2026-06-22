import { Button } from '@bratislava/component-library'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useState } from 'react'

import { useConditionalFormRedirects } from '@/src/components/forms/useFormRedirects'
import Icon from '@/src/components/icon-components/Icon'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import BackButton from '@/src/components/segments/NavBar/BackButton'
import SkipToContentButton from '@/src/components/segments/NavBar/SkipToContentButton'
import { useNavMenu } from '@/src/components/segments/NavBar/useNavMenu'
import Brand from '@/src/components/simple-components/Brand'
import DropdownMenu from '@/src/components/simple-components/DropdownMenu/DropdownMenu'
import IdentityVerificationStatus from '@/src/components/simple-components/IdentityVerificationStatus'
import UserAvatar from '@/src/components/simple-components/UserAvatar'
import { useQueryParamRedirect } from '@/src/frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import cn from '@/src/utils/cn'
import { ROUTES } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=EGiWvvrAjJLDEfQk-4
 */

type Props = {
  backButtonHidden?: boolean
}

export const NavBarHeader = ({ backButtonHidden }: Props) => {
  const { t } = useTranslation('account')
  const router = useRouter()

  const { signedInActionsMenuItems } = useNavMenu()

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
      {/* TODO Figma says 64px */}
      <div className="flex h-[57px] items-center gap-x-6">
        <SkipToContentButton />
        {!backButtonHidden && <BackButton />}
        <Brand className="grow" variant="header" />
        <IdentityVerificationStatus />
        <nav className="flex gap-x-8">
          {isSignedIn ? (
            <DropdownMenu
              setIsOpen={setIsMenuOpen}
              items={signedInActionsMenuItems}
              itemVariant="header"
              buttonTrigger={
                <Button
                  variant="unstyled"
                  data-cy="account-button"
                  className="flex items-center gap-4 rounded-lg font-semibold text-content-active-primary-default hover:text-content-active-primary-hover"
                >
                  <UserAvatar userAttributes={userAttributes} />
                  <div className="flex items-center gap-1">
                    {isLegalEntity ? userAttributes?.name : userAttributes?.given_name}
                    <Icon
                      name="chevron-down-small"
                      className={cn('size-5 mix-blend-normal', {
                        '-rotate-180': isMenuOpen,
                      })}
                    />
                  </div>
                </Button>
              }
            />
          ) : (
            <div className="flex items-center gap-6">
              <Button variant="plain" size="small" onPress={login} data-cy="login-button">
                {t('menu_links.login')}
              </Button>
              <Button variant="solid" size="small" onPress={register} data-cy="register-button">
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
