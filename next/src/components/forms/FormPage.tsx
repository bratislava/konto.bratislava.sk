import { VersionCompareContinueAction } from 'forms-shared/versioning/version-compare'

import FormContent from '@/src/components/forms/FormContent'
import FormProviders from '@/src/components/forms/FormProviders'
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
import FormSentPageContent from '@/src/components/page-contents/FormSentPageContent/FormSentPageContent'
import SeoHead from '@/src/components/simple-components/SeoHead'
import cn from '@/src/utils/cn'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=17622-2066&t=9VxOW0GxS2SEYDIL-4
 */

type FormPageState = 'form' | 'sent' | 'outdated'

const FormPageContent = ({ nonce }: { nonce?: string }) => {
  const { isEmbedded, versionCompareContinueAction } = useFormContext()
  const { formSent } = useFormSent()

  const formPageState: FormPageState = (() => {
    if (formSent) {
      return 'sent'
    }
    if (versionCompareContinueAction !== VersionCompareContinueAction.None) {
      return 'outdated'
    }

    return 'form'
  })()

  return (
    <IframeResizerChild enabled={isEmbedded} nonce={nonce}>
      <ConditionalWrap
        // Only the form itself needs the providers, and `PageLayout` must be rendered inside them
        // for `useConditionalFormRedirects` to work correctly
        condition={formPageState === 'form'}
        wrap={(children) => <FormProviders nonce={nonce}>{children}</FormProviders>}
      >
        <ConditionalWrap
          condition={!isEmbedded}
          wrap={(children) => (
            <PageLayout
              className={cn({
                'bg-gray-0 lg:bg-gray-50': formPageState === 'sent' || formPageState === 'outdated',
              })}
            >
              {children}
            </PageLayout>
          )}
        >
          {formPageState === 'sent' ? <FormSentPageContent /> : null}
          {/* It is not possible to display outdated form in any meaningful way, */}
          {/* so the user needs to first make an action (if possible) */}
          {formPageState === 'outdated' ? <FormVersionCompareAction /> : null}
          {formPageState === 'form' ? <FormContent /> : null}
        </ConditionalWrap>
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
