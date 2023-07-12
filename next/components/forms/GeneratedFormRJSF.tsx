import { FormValidation, RJSFSchema, UiSchema } from '@rjsf/utils'
import cx from 'classnames'
import MenuList from 'components/forms/steps/MenuList'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { useRef } from 'react'

import { validator } from '../../frontend/dtos/formStepperDto'
import { useFormSubmitter } from '../../frontend/hooks/useFormSubmitter'
import { InitialFormData } from '../../frontend/types/initialFormData'
import { customValidate } from '../../frontend/utils/formStepper'
import { useFormState } from './FormStateProvider'
import FormModals, { FormModalsRef } from './segments/FormModals/FormModals'
import FormHeader from './simple-components/FormHeader'
import FinalStep from './steps/FinalStep'
import StepperView from './steps/StepperView'
import StepButtonGroup from './steps/Summary/StepButtonGroup'
import { ThemedForm } from './ThemedForm'

interface FormRJSF {
  uiSchema: UiSchema
  formSlug: string
  wrapperClassName?: string
  initialFormData: InitialFormData
}

const GeneratedFormRJSF = ({ uiSchema, formSlug, wrapperClassName, initialFormData }: FormRJSF) => {
  const formState = useFormState()
  const submitter = useFormSubmitter(formSlug)
  const formModalsRef = useRef<FormModalsRef>(null)
  const { isAuthenticated } = useServerSideAuth()

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const saveConcept = async () => {
    throw new Error('Not implemented')
  }

  return (
    <>
      <FormHeader onSaveConcept={saveConcept} />
      <div
        className={cx(
          'flex flex-col gap-10 pt-0 pb-6 lg:py-10 w-full max-w-screen-lg mx-auto',
          'lg:flex-row lg:gap-20',
          wrapperClassName,
        )}
      >
        <div className="">
          <StepperView
            steps={formState.stepData}
            currentStep={formState.stepIndex}
            // hook useFormStepper is prepared to skip multiple steps but they will not be validated
            // if skip of multiple steps is not wanted, comment out onChangeStep
            onChangeStep={formModalsRef.current?.skipButtonHandler}
          />
          <FormModals
            stepIndex={formState.stepIndex}
            skipToStep={formState.skipToStep}
            ref={formModalsRef}
          />
        </div>
        <div className={cx('grow px-4', 'lg:px-0')}>
          {formState.isComplete ? (
            <FinalStep
              formData={formState.formData}
              formErrors={formState.errors}
              extraErrors={formState.extraErrors}
              schema={formState.validatedSchema}
              onGoToStep={formState.setStepIndex}
              submitErrors={submitter.errors}
              submitMessage={submitter.successMessage}
            />
          ) : (
            <>
              <h1 className="text-h1-medium font-semibold">{formState.stepTitle}</h1>
              <ThemedForm
                className="[&_legend]:hidden"
                key={`form-step-${formState.stepIndex}`}
                ref={formState.formRef}
                schema={formState.currentSchema}
                uiSchema={uiSchema}
                formData={formState.formData}
                validator={validator}
                customValidate={(formData: RJSFSchema, errors: FormValidation) => {
                  return customValidate(formData, errors, formState.currentSchema)
                }}
                onSubmit={async (e) => {
                  await formState.handleOnSubmit(e.formData as RJSFSchema)
                }}
                onChange={(e) => {
                  formState.setStepFormData(e.formData as RJSFSchema)
                }}
                onError={formState.handleOnErrors}
                extraErrors={formState.extraErrors}
                showErrorList={false}
                omitExtraData
                liveOmit
              />
            </>
          )}
          <StepButtonGroup
            stepIndex={formState.stepIndex}
            isFinalStep={formState.isComplete}
            previous={formState.previous}
            skip={() => formModalsRef.current?.skipButtonHandler(formState.stepIndex + 1)}
            submitStep={formState.submitStep}
            submitForm={() =>
              isAuthenticated
                ? submitter.submitForm(formState.formData, initialFormData.formId)
                : formModalsRef.current?.openRegistrationModal()
            }
          />
          <MenuList onSaveConcept={saveConcept} />
        </div>
      </div>
    </>
  )
}

export default GeneratedFormRJSF
