import cx from 'classnames'
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
import { FormSentProvider, useFormSent } from './useFormSent'

const FormPageWrapperInner = () => {
  const { formSent } = useFormSent()
  const { versionCompareContinueAction } = useFormContext()

  if (formSent) {
    return <ThankYouFormSection />
  }

  if (versionCompareContinueAction !== VersionCompareContinueAction.None) {
    return <FormVersionCompareAction />
  }

  return (
    <FormProviders>
      <FormPage />
    </FormProviders>
  )
}

const FormPageWrapper = () => {
  const { isEmbedded, versionCompareContinueAction } = useFormContext()
  const { formSent } = useFormSent()

  const accountPageLayoutClassName = cx({
    'bg-gray-50': formSent,
    'bg-gray-0 md:bg-gray-50':
      !formSent && versionCompareContinueAction !== VersionCompareContinueAction.None,
  })

  return (
    <IframeResizerChild enabled={isEmbedded}>
      <ConditionalWrap
        condition={!isEmbedded}
        wrap={(children) => (
          <AccountPageLayout className={accountPageLayoutClassName}>{children}</AccountPageLayout>
        )}
      >
        <FormPageWrapperInner />
      </ConditionalWrap>
    </IframeResizerChild>
  )
}

export type FormPageWrapperWithContextProps = {
  formServerContext: FormServerContext
}

const FormPageWrapperWithContext = ({ formServerContext }: FormPageWrapperWithContextProps) => {
  return (
    <FormContextProvider formServerContext={formServerContext}>
      <FormSentProvider initialFormSent={formServerContext.formSent}>
        <FormPageWrapper />
      </FormSentProvider>
    </FormContextProvider>
  )
}

export default FormPageWrapperWithContext
