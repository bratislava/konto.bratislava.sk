import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'
import React from 'react'

import cn from '../../frontend/cn'
import AccountPageLayout from '../layouts/AccountPageLayout'
import FormContent from './FormContent'
import FormVersionCompareAction from './FormVersionCompareAction'
import IframeResizerChild from './IframeResizerChild'
import ThankYouFormSection from './segments/AccountSections/ThankYouSection/ThankYouFormSection'
import ConditionalWrap from './simple-components/ConditionalWrap'
import { FormContextProvider, FormServerContext, useFormContext } from './useFormContext'
import { FormSentProvider, useFormSent } from './useFormSent'

const FormStateRouter = ({ nonce }: { nonce?: string }) => {
  const { formSent } = useFormSent()
  const { versionCompareContinueAction } = useFormContext()

  if (formSent) {
    return <ThankYouFormSection />
  }

  // It is not possible to display outdated form in any meaningful way, user needs to first make an action (if possible)
  if (versionCompareContinueAction !== VersionCompareContinueAction.None) {
    return <FormVersionCompareAction />
  }

  return <FormContent nonce={nonce} />
}

const FormLayoutContainer = ({ nonce }: { nonce?: string }) => {
  const { isEmbedded, versionCompareContinueAction } = useFormContext()
  const { formSent } = useFormSent()

  const accountPageLayoutClassName = cn({
    'bg-gray-50': formSent,
    'bg-gray-0 md:bg-gray-50':
      !formSent && versionCompareContinueAction !== VersionCompareContinueAction.None,
  })

  return (
    <IframeResizerChild enabled={isEmbedded} nonce={nonce}>
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
  nonce?: string
}

const FormPage = ({ formServerContext, nonce }: FormPageProps) => {
  return (
    <FormContextProvider formServerContext={formServerContext}>
      <FormSentProvider initialFormSent={formServerContext.initialFormSent}>
        <FormLayoutContainer nonce={nonce} />
      </FormSentProvider>
    </FormContextProvider>
  )
}

export default FormPage
