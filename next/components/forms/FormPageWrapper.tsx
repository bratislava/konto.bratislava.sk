import { useRouter } from 'next/router'
import { usePlausible } from 'next-plausible'
import React, { useEffect } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import AccountPageLayout from '../layouts/AccountPageLayout'
import FormPage from './FormPage'
import FormProviders from './FormProviders'
import ThankYouFormSection from './segments/AccountSections/ThankYouSection/ThankYouFormSection'
import ConditionalWrap from './simple-components/ConditionalWrap'
import { FormContextProvider, FormServerContext } from './useFormContext'
import { FormSentRenderer } from './useFormSent'

export type FormPageWrapperProps = {
  formServerContext: FormServerContext
}

// custom plausible tracking - we exclude '/mestske-sluzby/*/*' in top level plausible provider
// instead, we track these as custom events: formSlug#hash
const useCustomPlausibleFormPagesTracking = (formSlug: string) => {
  const router = useRouter()
  const plausible = usePlausible()

  useEffect(() => {
    const onHashChangeStart = (url: string) => {
      const hash = url.split('#')[1]
      plausible(`${formSlug}#${hash}`)
    }

    router.events.on('hashChangeStart', onHashChangeStart)

    return () => {
      router.events.off('hashChangeStart', onHashChangeStart)
    }
  }, [formSlug, plausible, router.events])

  // track initial pageview
  useEffectOnce(() => {
    const hash = router.asPath.split('#')[1]
    plausible(`${formSlug}#${hash}`)
  })
}

const FormPageWrapper = ({ formServerContext }: FormPageWrapperProps) => {
  const { formDefinition, isEmbedded } = formServerContext
  useCustomPlausibleFormPagesTracking(formDefinition.slug)

  return (
    <FormSentRenderer
      // TODO today it does not make sense to have anything else than false in initialFormSent - otherwise we just display "thank you" page on each revisit
      // if it stays this way remove the prop completely
      initialFormSent={false}
      notSentChildren={
        <FormProviders formServerContext={formServerContext}>
          <ConditionalWrap
            condition={!isEmbedded}
            wrap={(children) => <AccountPageLayout>{children}</AccountPageLayout>}
          >
            <FormPage />
          </ConditionalWrap>
        </FormProviders>
      }
      sentChildren={
        <FormContextProvider formServerContext={formServerContext}>
          <ConditionalWrap
            condition={!isEmbedded}
            wrap={(children) => (
              <AccountPageLayout className="bg-gray-50">{children}</AccountPageLayout>
            )}
          >
            <ThankYouFormSection />
          </ConditionalWrap>
        </FormContextProvider>
      }
    />
  )
}

export default FormPageWrapper
