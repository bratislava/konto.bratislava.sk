import PageLayout from 'components/layouts/PageLayout'
import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'
import React from 'react'

import cn from '../../frontend/cn'
import FormContent from './FormContent'
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

  // It is not possible to display outdated form in any meaningful way, user needs to first make an action (if possible)
  if (versionCompareContinueAction !== VersionCompareContinueAction.None) {
    return <FormVersionCompareAction />
  }

  return <FormContent />
}

const FormLayoutContainer = () => {
  const { isEmbedded, versionCompareContinueAction } = useFormContext()
  const { formSent } = useFormSent()

  return (
    <IframeResizerChild enabled={isEmbedded}>
      <ConditionalWrap
        condition={!isEmbedded}
        wrap={(children) => (
          <PageLayout className={cn({
            'bg-gray-50': formSent,
            'bg-gray-0 md:bg-gray-50':
              !formSent && versionCompareContinueAction !== VersionCompareContinueAction.None,
          })}>{children}</PageLayout>
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
