import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'
import React from 'react'

import FormContent from '@/src/components/forms/FormContent'
import FormVersionCompareAction from '@/src/components/forms/FormVersionCompareAction'
import IframeResizerChild from '@/src/components/forms/IframeResizerChild'
import {
  FormContextProvider,
  FormServerContext,
  useFormContext,
} from '@/src/components/forms/useFormContext'
import { FormSentProvider, useFormSent } from '@/src/components/forms/useFormSent'
import ConditionalWrap from '@/src/components/layouts/ConditionalWrap'
import PageLayout from '@/src/components/layouts/PageLayout'
import ThankYouFormPageContent from '@/src/components/page-contents/ThankYouPageContent/ThankYouFormPageContent'
import cn from '@/src/utils/cn'

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
          <ThankYouFormPageContent />
        ) : isFormOutdated ? (
          // It is not possible to display outdated form in any meaningful way,
          // so the user needs to first make an action (if possible)
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
