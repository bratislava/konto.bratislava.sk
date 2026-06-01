import { Typography } from '@bratislava/component-library'
import { PropsWithChildren } from 'react'

import { FormContextContext } from '@/src/components/forms/useFormContext'
import { SsrAuthContext } from '@/src/components/logic/SsrAuthContext'
import FormSentPageContent from '@/src/components/page-contents/FormSentPageContent/FormSentPageContent'
import { Stack } from '@/src/components/styleguide/Stack'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

type MockFormContextValue = {
  isTaxForm: boolean
  isEmbedded: boolean
  formDefinition: { feedbackLink?: string }
}

const mockFormContext = (overrides: Partial<MockFormContextValue> = {}): MockFormContextValue => ({
  isTaxForm: false,
  isEmbedded: false,
  formDefinition: { feedbackLink: undefined },
  ...overrides,
})

const MockProviders = ({
  formContext,
  isSignedIn = false,
  children,
}: PropsWithChildren<{ formContext: MockFormContextValue; isSignedIn?: boolean }>) => (
  <SsrAuthContext.Provider value={{ isSignedIn, userAttributes: null, guestIdentityId: null }}>
    <FormContextContext.Provider value={formContext as any}>{children}</FormContextContext.Provider>
  </SsrAuthContext.Provider>
)

type FormVariant = {
  label: string
  formContext: MockFormContextValue
  isSignedIn?: boolean
}

const formVariants: FormVariant[] = [
  { label: 'Generic – not signed in - no feedback link', formContext: mockFormContext() },
  {
    label: 'Generic – signed in - no feedback link',
    formContext: mockFormContext(),
    isSignedIn: true,
  },
  {
    label: 'Generic – with feedback link',
    formContext: mockFormContext({ formDefinition: { feedbackLink: '#' } }),
  },
  {
    label: 'Tax form',
    formContext: mockFormContext({ isTaxForm: true, formDefinition: { feedbackLink: '#' } }),
  },
  { label: 'Embedded', formContext: mockFormContext({ isEmbedded: true }) },
]

const FormSentPageContentShowCase = () => (
  <Wrapper title="Form Sent Page Content" direction="column">
    {formVariants.map(({ label, formContext, isSignedIn }) => (
      <div key={label} className="flex flex-col items-start gap-1">
        <Typography variant="h5" as="h3">
          {label}
        </Typography>
        <Stack className="justify-center *:py-0 *:lg:py-0">
          <MockProviders formContext={formContext} isSignedIn={isSignedIn}>
            <FormSentPageContent />
          </MockProviders>
        </Stack>
      </div>
    ))}
  </Wrapper>
)

export default FormSentPageContentShowCase
