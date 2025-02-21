import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'
import React from 'react'

import AccountPageLayout from '../layouts/AccountPageLayout'
import FormPage from './FormPage'
import FormProviders from './FormProviders'
import FormVersionCompareAction from './FormVersionCompareAction'
import IframeResizerChild from './IframeResizerChild'
import ThankYouFormSection from './segments/AccountSections/ThankYouSection/ThankYouFormSection'
import ConditionalWrap from './simple-components/ConditionalWrap'
import { FormContextProvider, FormServerContext, useFormContext } from './useFormContext'
import { FormSentRenderer } from './useFormSent'

const FormPageWrapper = () => {
  const { isEmbedded, versionCompareContinueAction } = useFormContext()
  const showVersionCompareAction =
    versionCompareContinueAction !== VersionCompareContinueAction.None

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
              wrap={(children) => (
                <AccountPageLayout
                  className={showVersionCompareAction ? 'bg-gray-0 md:bg-gray-50' : undefined}
                >
                  {children}
                </AccountPageLayout>
              )}
            >
              {showVersionCompareAction ? <FormVersionCompareAction /> : <FormPage />}
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
