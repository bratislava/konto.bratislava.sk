import MenuList from 'components/forms/steps/MenuList'
import { defaultUiSchema, getBaFormDefaults } from 'forms-shared/form-utils/formDefaults'
import { useIsomorphicLayoutEffect } from 'usehooks-ts'

import FormControls from './FormControls'
import FormProviders from './FormProviders'
import FormUploadXmlJson from './FormUploadXmlJson'
import FormModals from './segments/FormModals/FormModals'
import FormHeader from './simple-components/FormHeader'
import StepperView from './steps/StepperView'
import FormSummary from './steps/Summary/FormSummary'
import ThemedForm from './ThemedForm'
import { useFormContext } from './useFormContext'
import { useFormData } from './useFormData'
import { useFormErrorTranslations } from './useFormErrorTranslations'
import { useFormState } from './useFormState'
import { useFormValidatorRegistry } from './useFormValidatorRegistry'

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
        className="max-w-(--breakpoint-lg) mx-auto flex w-full flex-col gap-10 pb-6 pt-0 lg:flex-row lg:gap-20 lg:py-10"
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

const FormContent = () => {
  return (
    <FormProviders>
      <FormContentInner />
    </FormProviders>
  )
}

export default FormContent
