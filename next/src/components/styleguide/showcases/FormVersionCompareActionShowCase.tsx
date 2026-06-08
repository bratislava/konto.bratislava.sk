import { Typography } from '@bratislava/component-library'
import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'
import { PropsWithChildren } from 'react'

import FormVersionCompareAction from '@/src/components/forms/FormVersionCompareAction'
import { FormContextContext } from '@/src/components/forms/useFormContext'
import { SsrAuthContext } from '@/src/components/logic/SsrAuthContext'
import { Stack } from '@/src/components/styleguide/Stack'
import { Wrapper } from '@/src/components/styleguide/Wrapper'

type MockFormContextValue = {
  formId: string
  versionCompareContinueAction: VersionCompareContinueAction
  formDefinition: { slug: string }
}

const mockFormContext = (
  versionCompareContinueAction: VersionCompareContinueAction,
): MockFormContextValue => ({
  formId: 'mock-form-id',
  versionCompareContinueAction,
  formDefinition: { slug: 'mock-slug' },
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

type Variant = {
  label: string
  versionCompareContinueAction: VersionCompareContinueAction
  isSignedIn?: boolean
}

const variants: Variant[] = [
  {
    label: 'Minor change – not signed in',
    versionCompareContinueAction: VersionCompareContinueAction.RequiresBump,
  },
  {
    label: 'Minor change – signed in',
    versionCompareContinueAction: VersionCompareContinueAction.RequiresBump,
    isSignedIn: true,
  },
  {
    label: 'Major change – not signed in',
    versionCompareContinueAction: VersionCompareContinueAction.CannotContinue,
  },
  {
    label: 'Major change – signed in',
    versionCompareContinueAction: VersionCompareContinueAction.CannotContinue,
    isSignedIn: true,
  },
]

const FormVersionCompareActionShowCase = () => (
  <Wrapper title="FormVersionCompareAction" direction="column">
    <div className="flex w-full flex-col gap-12">
      {variants.map(({ label, versionCompareContinueAction, isSignedIn }) => (
        <div key={label} className="flex flex-col items-start gap-1">
          <Typography variant="h5" as="h3">
            {label}
          </Typography>
          <Stack className="justify-center *:py-0 *:lg:py-0">
            <MockProviders
              formContext={mockFormContext(versionCompareContinueAction)}
              isSignedIn={isSignedIn}
            >
              <FormVersionCompareAction />
            </MockProviders>
          </Stack>
        </div>
      ))}
    </div>
  </Wrapper>
)

export default FormVersionCompareActionShowCase
