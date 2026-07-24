import { Typography } from '@bratislava/component-library'
import { ReactNode } from 'react'

import { FormTemporarilyDisabledFragment } from '@/src/clients/graphql-strapi/api'
import { SsrAuthContext } from '@/src/components/logic/SsrAuthContext'
import TemporarilyDisabledAlert from '@/src/components/segments/TemporarilyDisabledAlert/TemporarilyDisabledAlert'

import { Stack } from '../Stack'
import { Wrapper } from '../Wrapper'

const MOCK_DATE = '15. 7. 2026'
const MOCK_REASON = 'plánovaná údržba systému.'

const disabledForm = (
  overrides?: Partial<FormTemporarilyDisabledFragment>,
): FormTemporarilyDisabledFragment => ({
  __typename: 'Form',
  isTemporarilyDisabled: true,
  temporarilyDisabledUntil: MOCK_DATE,
  temporarilyDisabledReason: MOCK_REASON,
  ...overrides,
})

type MockAuthProps = {
  isSignedIn: boolean
  children: ReactNode
}

const MockAuth = ({ isSignedIn, children }: MockAuthProps) => (
  <SsrAuthContext.Provider value={{ isSignedIn, userAttributes: null, guestIdentityId: null }}>
    {children}
  </SsrAuthContext.Provider>
)

type CaseProps = {
  label: string
  isSignedIn: boolean
  variant: 'landingPage' | 'form'
  strapiForm: FormTemporarilyDisabledFragment | null | undefined
}

const Case = ({ label, isSignedIn, variant, strapiForm }: CaseProps) => (
  <div className="flex w-full flex-col gap-2">
    <Typography variant="p-small" className="font-semibold">
      {label}
    </Typography>
    <MockAuth isSignedIn={isSignedIn}>
      <TemporarilyDisabledAlert strapiForm={strapiForm} variant={variant} />
    </MockAuth>
  </div>
)

const TemporarilyDisabledAlertShowCase = () => {
  return (
    <Wrapper direction="column" title="Temporarily Disabled Alert">
      <Stack direction="column">
        <Typography variant="h4">Landing page (reason shown)</Typography>
        <Case
          label="Signed in · date · reason"
          isSignedIn
          variant="landingPage"
          strapiForm={disabledForm()}
        />
        <Case
          label="Signed in · date · no reason"
          isSignedIn
          variant="landingPage"
          strapiForm={disabledForm({ temporarilyDisabledReason: null })}
        />
        <Case
          label="Signed in · no date · reason"
          isSignedIn
          variant="landingPage"
          strapiForm={disabledForm({ temporarilyDisabledUntil: null })}
        />
        <Case
          label="Signed in · no date · no reason"
          isSignedIn
          variant="landingPage"
          strapiForm={disabledForm({
            temporarilyDisabledUntil: null,
            temporarilyDisabledReason: null,
          })}
        />
        <Case
          label="Not signed in · date · reason"
          isSignedIn={false}
          variant="landingPage"
          strapiForm={disabledForm()}
        />
        <Case
          label="Not signed in · no date · no reason"
          isSignedIn={false}
          variant="landingPage"
          strapiForm={disabledForm({
            temporarilyDisabledUntil: null,
            temporarilyDisabledReason: null,
          })}
        />
      </Stack>

      <Stack direction="column">
        <Typography variant="h4">Form / summary (reason hidden)</Typography>
        <Case label="Signed in · date" isSignedIn variant="form" strapiForm={disabledForm()} />
        <Case
          label="Signed in · no date"
          isSignedIn
          variant="form"
          strapiForm={disabledForm({ temporarilyDisabledUntil: null })}
        />
        <Case
          label="Not signed in · date"
          isSignedIn={false}
          variant="form"
          strapiForm={disabledForm()}
        />
        <Case
          label="Not signed in · no date"
          isSignedIn={false}
          variant="form"
          strapiForm={disabledForm({ temporarilyDisabledUntil: null })}
        />
      </Stack>

      <Stack direction="column">
        <Typography variant="h4">Not disabled (renders nothing)</Typography>
        <Case
          label="isTemporarilyDisabled: false"
          isSignedIn
          variant="landingPage"
          strapiForm={disabledForm({ isTemporarilyDisabled: false })}
        />
      </Stack>
    </Wrapper>
  )
}

export default TemporarilyDisabledAlertShowCase
