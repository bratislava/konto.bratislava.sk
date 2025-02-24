import cx from 'classnames'
import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'
import React from 'react'

import AccountPageLayout from '../layouts/AccountPageLayout'
import FormContent from './FormContent'
import FormProviders from './FormProviders'
import FormVersionCompareAction from './FormVersionCompareAction'
import IframeResizerChild from './IframeResizerChild'
import ThankYouFormSection from './segments/AccountSections/ThankYouSection/ThankYouFormSection'
import ConditionalWrap from './simple-components/ConditionalWrap'
import { FormContextProvider, FormServerContext, useFormContext } from './useFormContext'
import { FormSentProvider, useFormSent } from './useFormSent'

const FormStateRouter = () => {
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
      <FormContent />
    </FormProviders>
  )
}

const FormLayoutContainer = () => {
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
        <FormStateRouter />
      </ConditionalWrap>
    </IframeResizerChild>
  )
}

export type FormPageProps = {
  formServerContext: FormServerContext
}

const FormPage = ({ formServerContext }: FormPageProps) => {
  return (
    <FormContextProvider formServerContext={formServerContext}>
      <FormSentProvider initialFormSent={formServerContext.initialFormSent}>
        <FormLayoutContainer />
      </FormSentProvider>
    </FormContextProvider>
  )
}

export default FormPage
