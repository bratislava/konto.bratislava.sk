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

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=17622-2066&t=9VxOW0GxS2SEYDIL-4
 */

const FormPageContent = ({ nonce }: { nonce?: string }) => {
  const { isEmbedded, versionCompareContinueAction } = useFormContext()
  const { formSent } = useFormSent()

  const isFormSent = formSent
  const isFormOutdated = versionCompareContinueAction !== VersionCompareContinueAction.None

  return (
    <IframeResizerChild enabled={isEmbedded} nonce={nonce}>
      <ConditionalWrap
        condition={!isEmbedded}
        wrap={(children) => (
          <PageLayout
            className={cn({
              'bg-gray-0 md:bg-gray-50': isFormOutdated || isFormSent,
            })}
          >
            {children}
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
  nonce?: string
}

const FormPage = ({ formServerContext, nonce }: FormPageProps) => {
  return (
    <FormContextProvider formServerContext={formServerContext}>
      <FormSentProvider initialFormSent={formServerContext.initialFormSent}>
        <FormPageContent nonce={nonce} />
      </FormSentProvider>
    </FormContextProvider>
  )
}

export default FormPage
