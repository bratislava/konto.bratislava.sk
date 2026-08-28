import { Typography } from '@bratislava/component-library'
import { ClientInfoResponseDto } from 'openapi-clients/city-account'
import { useRef } from 'react'

import { SsrAuthContext, SsrAuthContextType } from '@/src/components/logic/SsrAuthContext'
import NavBar from '@/src/components/segments/NavBar/NavBar'
import { AccountType, Tier, UserAttributes } from '@/src/frontend/dtos/accountDto'
import { AmplifyClientOAuthProvider } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'

import { Wrapper } from '../Wrapper'

/**
 * Mocks the auth attributes the NavBar reads through `useSsrAuth`, so every functional
 * variant (logged out / logged in / legal entity / verification tiers) can be rendered
 * side by side without a real session.
 */
const makeUserAttributes = (overrides: Partial<UserAttributes>): UserAttributes => ({
  given_name: 'Jana',
  family_name: 'Nováková',
  name: 'Jana Nováková',
  email: 'jana.novakova@example.com',
  ...overrides,
})

const loggedOut: SsrAuthContextType = {
  isSignedIn: false,
  userAttributes: null,
  guestIdentityId: null,
}

const signedIn = (userAttributes: UserAttributes): SsrAuthContextType => ({
  isSignedIn: true,
  userAttributes,
  guestIdentityId: null,
})

const physicalPersonNotVerified = signedIn(
  makeUserAttributes({
    'custom:account_type': AccountType.FyzickaOsoba,
    'custom:tier': Tier.NEW,
  }),
)

const physicalPersonInQueue = signedIn(
  makeUserAttributes({
    'custom:account_type': AccountType.FyzickaOsoba,
    'custom:tier': Tier.QUEUE_IDENTITY_CARD,
  }),
)

const physicalPersonVerified = signedIn(
  makeUserAttributes({
    'custom:account_type': AccountType.FyzickaOsoba,
    'custom:tier': Tier.IDENTITY_CARD,
  }),
)

const legalEntityVerified = signedIn(
  makeUserAttributes({
    name: 'Bratislavská Firma s.r.o.',
    'custom:account_type': AccountType.PravnickaOsoba,
    'custom:tier': Tier.IDENTITY_CARD,
  }),
)

const dpbClientInfo: ClientInfoResponseDto = { clientId: 'dpb-demo', clientName: 'DPB' }

type NavBarVariantProps = {
  title: string
  note?: string
  ssrAuth: SsrAuthContextType
  variant?: 'default' | 'auth'
  hasBackButton?: boolean
  oauthClientInfo?: ClientInfoResponseDto | null
}

const NavBarVariant = ({
  title,
  note,
  ssrAuth,
  variant = 'default',
  hasBackButton = false,
  oauthClientInfo = null,
}: NavBarVariantProps) => {
  const desktopNavbarRef = useRef<HTMLDivElement>(null)
  const mobileNavbarRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col gap-2">
      <Typography variant="p-default-bold">{title}</Typography>
      {note && (
        <Typography variant="p-small" className="text-gray-600">
          {note}
        </Typography>
      )}
      {/*
        `transform` establishes a containing block so the mobile NavBar (position: fixed)
        stays inside this preview box instead of jumping to the top of the viewport.
      */}
      <div
        className="relative min-h-14 rounded-lg border border-dashed border-gray-500 bg-background-passive-base"
        style={{ transform: 'translateZ(0)' }}
      >
        <SsrAuthContext.Provider value={ssrAuth}>
          <AmplifyClientOAuthProvider clientInfo={oauthClientInfo}>
            <NavBar
              variant={variant}
              hasBackButton={hasBackButton}
              desktopNavbarRef={desktopNavbarRef}
              mobileNavbarRef={mobileNavbarRef}
            />
          </AmplifyClientOAuthProvider>
        </SsrAuthContext.Provider>
      </div>
    </div>
  )
}

const NavBarShowCase = () => {
  return (
    <Wrapper direction="column" title="NavBar">
      <div className="flex flex-col gap-8">
        <NavBarVariant
          title="Default — logged out"
          note="Shows the main navigation menu with login & register actions."
          ssrAuth={loggedOut}
        />

        <NavBarVariant
          title="Default — logged out, with back button"
          note="hasBackButton renders the back arrow before the brand."
          ssrAuth={loggedOut}
          hasBackButton
        />

        <NavBarVariant
          title="Default — signed in (individual, identity not verified)"
          note="Account dropdown + 'verification required' status. Tier: NEW."
          ssrAuth={physicalPersonNotVerified}
        />

        <NavBarVariant
          title="Default — signed in (individual, verification in queue)"
          note="Account dropdown + 'in queue' status. Tier: QUEUE_IDENTITY_CARD."
          ssrAuth={physicalPersonInQueue}
        />

        <NavBarVariant
          title="Default — signed in (individual, identity verified)"
          note="Account dropdown + green 'verified' status. Tier: IDENTITY_CARD."
          ssrAuth={physicalPersonVerified}
        />

        <NavBarVariant
          title="Default — signed in (legal entity, verified)"
          note="Company name is shown; the Taxes & Fees menu item is hidden for legal entities."
          ssrAuth={legalEntityVerified}
        />

        <NavBarVariant
          title="Auth variant — logged out"
          note="Used on auth/OAuth pages. Hides the nav menu; no OAuth client logo when not an OAuth login."
          ssrAuth={loggedOut}
          variant="auth"
        />

        <NavBarVariant
          title="Auth variant — OAuth login (DPB)"
          note="Brand is unlinked and the OAuth client logo (DPB) is shown on the right."
          ssrAuth={loggedOut}
          variant="auth"
          oauthClientInfo={dpbClientInfo}
        />

        <NavBarVariant
          title="Auth variant — OAuth login (DPB), with back button"
          ssrAuth={loggedOut}
          variant="auth"
          hasBackButton
          oauthClientInfo={dpbClientInfo}
        />
      </div>
    </Wrapper>
  )
}

export default NavBarShowCase
