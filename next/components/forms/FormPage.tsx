import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'
import React from 'react'

import FormContent from '@/components/forms/FormContent'
import FormVersionCompareAction from '@/components/forms/FormVersionCompareAction'
import IframeResizerChild from '@/components/forms/IframeResizerChild'
import ThankYouFormSection from '@/components/forms/segments/AccountSections/ThankYouSection/ThankYouFormSection'
import ConditionalWrap from '@/components/forms/simple-components/ConditionalWrap'
import {
  FormContextProvider,
  FormServerContext,
  useFormContext,
} from '@/components/forms/useFormContext'
import { FormSentProvider, useFormSent } from '@/components/forms/useFormSent'
import PageLayout from '@/components/layouts/PageLayout'
import cn from '@/frontend/cn'

const FormPageContent = () => {
  const { isEmbedded, versionCompareContinueAction } = useFormContext()
  const { formSent } = useFormSent()

  const isFormSent = formSent
  const isFormOutdated = versionCompareContinueAction !== VersionCompareContinueAction.None

  return (
    <IframeResizerChild enabled={isEmbedded}>
      <ConditionalWrap
        condition={!isEmbedded}
        wrap={(childrenToWrap) => (
          <PageLayout
            className={cn({
              'bg-gray-0 md:bg-gray-50': isFormOutdated || isFormSent,
            })}
          >
            {childrenToWrap}
          </PageLayout>
        )}
      >
        {isFormSent ? (
          <ThankYouFormSection />
        ) : isFormOutdated ? (
          // It is not possible to display outdated form in any meaningful way,
          // se the user needs to first make an action (if possible)
          <FormVersionCompareAction />
        ) : (
          <FormContent />
        )}
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
        <FormPageContent />
      </FormSentProvider>
    </FormContextProvider>
  )
}

export default FormPage
