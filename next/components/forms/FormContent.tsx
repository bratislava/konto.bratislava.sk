import { defaultUiSchema, getBaFormDefaults } from 'forms-shared/form-utils/formDefaults'
import { useIsomorphicLayoutEffect } from 'usehooks-ts'

import FormControls from '@/components/forms/FormControls'
import FormProviders from '@/components/forms/FormProviders'
import FormUploadXmlJson from '@/components/forms/FormUploadXmlJson'
import FormModals from '@/components/forms/segments/FormModals/FormModals'
import FormHeader from '@/components/forms/simple-components/FormHeader'
import MenuList from '@/components/forms/steps/MenuList'
import StepperView from '@/components/forms/steps/StepperView'
import FormSummary from '@/components/forms/steps/Summary/FormSummary'
import ThemedForm from '@/components/forms/ThemedForm'
import { useFormContext } from '@/components/forms/useFormContext'
import { useFormData } from '@/components/forms/useFormData'
import { useFormErrorTranslations } from '@/components/forms/useFormErrorTranslations'
import { useFormState } from '@/components/forms/useFormState'
import { useFormValidatorRegistry } from '@/components/forms/useFormValidatorRegistry'

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
        className="mx-auto flex w-full max-w-(--breakpoint-lg) flex-col gap-10 pt-0 pb-6 lg:flex-row lg:gap-20 lg:py-10"
        data-cy="form-container"
      >
        <StepperView />
        <div className="grow px-4 lg:px-0">
          {currentStepperStep.index === 'summary' ? <FormSummary /> : <FormStep />}
          {displayHeaderAndMenu && <MenuList />}
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
