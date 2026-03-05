import { defaultUiSchema, getBaFormDefaults } from 'forms-shared/form-utils/formDefaults'
import { useIsomorphicLayoutEffect } from 'usehooks-ts'

import FormControls from '@/src/components/forms/FormControls'
import FormProviders from '@/src/components/forms/FormProviders'
import FormUploadXmlJson from '@/src/components/forms/FormUploadXmlJson'
import StepperView from '@/src/components/forms/steps/StepperView'
import FormSummary from '@/src/components/forms/steps/Summary/FormSummary'
import ThemedForm from '@/src/components/forms/ThemedForm'
import { useFormContext } from '@/src/components/forms/useFormContext'
import { useFormData } from '@/src/components/forms/useFormData'
import { useFormErrorTranslations } from '@/src/components/forms/useFormErrorTranslations'
import { useFormState } from '@/src/components/forms/useFormState'
import { useFormValidatorRegistry } from '@/src/components/forms/useFormValidatorRegistry'
import FormModals from '@/src/components/modals/FormModals/FormModals'
import FormBottomMenu from '@/src/components/simple-components/FormBottomMenu'
import FormHeader from '@/src/components/simple-components/FormHeader'

const FormStep = () => {
  const { isReadonly } = useFormContext()
  const { formData } = useFormData()
  const { currentStepperStep, currentStepSchema, handleFormOnSubmit, handleFormOnChange } =
    useFormState()
  const validatorRegistry = useFormValidatorRegistry()
  const { transformErrors } = useFormErrorTranslations()

  return (
    <ThemedForm
      key={`form-step-${currentStepperStep.index}`}
      schema={currentStepSchema!}
      uiSchema={defaultUiSchema}
      formData={formData}
      readonly={isReadonly}
      onSubmit={(e) => {
        handleFormOnSubmit(e.formData)
      }}
      onChange={(e) => {
        handleFormOnChange(e.formData)
      }}
      transformErrors={transformErrors}
      showErrorList={false}
      omitExtraData
      liveOmit
      noHtml5Validate
      {...getBaFormDefaults(currentStepSchema!, validatorRegistry)}
    >
      {/* returning null would make RJSF render the default submit button */}
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      {isReadonly ? <></> : <FormControls />}
    </ThemedForm>
  )
}

const FormContentInner = () => {
  const { displayHeaderAndMenu } = useFormContext()
  const { currentStepIndex, currentStepperStep, popScrollToFieldId } = useFormState()

  useIsomorphicLayoutEffect(() => {
    const fieldId = popScrollToFieldId()
    const element = fieldId ? document.querySelector(`#${fieldId}`) : null

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // We don't want popScrollToFieldId to trigger the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex])

  return (
    <>
      <FormModals />
      <FormUploadXmlJson />
      {displayHeaderAndMenu && <FormHeader />}
      <div
        className="mx-auto flex w-full max-w-(--breakpoint-xl) flex-col gap-10 px-4 pt-0 pb-6 lg:flex-row lg:gap-20 lg:px-8 lg:py-10"
        data-cy="form-container"
      >
        <StepperView />
        <div className="grow px-4 lg:px-0">
          {currentStepperStep.index === 'summary' ? <FormSummary /> : <FormStep />}
          {displayHeaderAndMenu && <FormBottomMenu />}
        </div>
      </div>
    </>
  )
}

const FormContent = ({ nonce }: { nonce?: string }) => {
  return (
    <FormProviders nonce={nonce}>
      <FormContentInner />
    </FormProviders>
  )
}

export default FormContent
