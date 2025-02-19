import { useRouter } from 'next/router'
import { usePlausible } from 'next-plausible'
import React, { useEffect } from 'react'
import { useEffectOnce } from 'usehooks-ts'

import AccountPageLayout from '../layouts/AccountPageLayout'
import FormPage from './FormPage'
import FormProviders from './FormProviders'
import IframeResizerChild from './IframeResizerChild'
import ThankYouFormSection from './segments/AccountSections/ThankYouSection/ThankYouFormSection'
import ConditionalWrap from './simple-components/ConditionalWrap'
import { FormContextProvider, FormServerContext, useFormContext } from './useFormContext'
import { FormSentRenderer } from './useFormSent'

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

const FormPageWrapper = () => {
  const { formDefinition, isEmbedded } = useFormContext()
  useCustomPlausibleFormPagesTracking(formDefinition.slug)

  return (
    <IframeResizerChild enabled={isEmbedded}>
      <FormSentRenderer
        // TODO today it does not make sense to have anything else than false in initialFormSent - otherwise we just display "thank you" page on each revisit
        // if it stays this way remove the prop completely
        initialFormSent={false}
        notSentChildren={
          <FormProviders>
            <ConditionalWrap
              condition={!isEmbedded}
              wrap={(children) => <AccountPageLayout>{children}</AccountPageLayout>}
            >
              <FormPage />
            </ConditionalWrap>
          </FormProviders>
        }
        sentChildren={
          <ConditionalWrap
            condition={!isEmbedded}
            wrap={(children) => (
              <AccountPageLayout className="bg-gray-50">{children}</AccountPageLayout>
            )}
          >
            <ThankYouFormSection />
          </ConditionalWrap>
        }
      />
    </IframeResizerChild>
  )
}

export type FormPageWrapperWithContextProps = {
  formServerContext: FormServerContext
}

const FormPageWrapperWithContext = ({ formServerContext }: FormPageWrapperWithContextProps) => {
  return (
    <FormContextProvider formServerContext={formServerContext}>
      <FormPageWrapper />
    </FormContextProvider>
  )
}

export default FormPageWrapperWithContext
