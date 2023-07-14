import { FormValidation, RJSFSchema, UiSchema } from '@rjsf/utils'
import cx from 'classnames'
import MenuList from 'components/forms/steps/MenuList'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { useRef } from 'react'

import { validator } from '../../frontend/dtos/formStepperDto'
import { useFormSubmitter } from '../../frontend/hooks/useFormSubmitter'
import { InitialFormData } from '../../frontend/types/initialFormData'
import { customValidate } from '../../frontend/utils/formStepper'
import FormControls from './FormControls'
import { useFormState } from './FormStateProvider'
import FormModals from './segments/FormModals/FormModals'
import FormHeader from './simple-components/FormHeader'
import FinalStep from './steps/FinalStep'
import StepperView from './steps/StepperView'
import { ThemedForm } from './ThemedForm'

interface FormRJSF {
  uiSchema: UiSchema
  formSlug: string
  wrapperClassName?: string
}

const GeneratedFormRJSF = ({ uiSchema, formSlug, wrapperClassName }: FormRJSF) => {
  const formState = useFormState()
  const submitter = useFormSubmitter(formSlug)

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const saveConcept = async () => {
    throw new Error('Not implemented')
  }

  console.log('GeneratedFormRJSF', { formState })

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
          <StepperView steps={formState.stepData} currentStep={formState.stepIndex} />
          <FormModals />
        </div>
        <div className={cx('grow px-4', 'lg:px-0')}>
          {formState.stepIndex === 'summary' ? (
            <FinalStep
              formData={formState.formData}
              formErrors={formState.errors}
              extraErrors={formState.extraErrors}
              schema={formState.validatedSchema}
              onGoToStep={formState.setStepIndex}
              submitErrors={submitter.errors}
              submitMessage={submitter.successMessage}
              uiSchema={uiSchema}
            />
          ) : (
            <>
              <h1 className="text-h1-medium font-semibold">{formState.stepTitle}</h1>
              <ThemedForm
                className="[&_legend]:hidden"
                key={`form-step-${formState.stepIndex}`}
                schema={formState.currentSchema}
                uiSchema={uiSchema}
                formData={formState.formData}
                validator={validator}
                customValidate={(formData: RJSFSchema, errors: FormValidation) => {
                  return customValidate(formData, errors, formState.currentSchema)
                }}
                onSubmit={(e) => {
                  formState.handleOnSubmit(e.formData as RJSFSchema)
                }}
                onChange={(e) => {
                  formState.handleOnChange(e.formData as RJSFSchema)
                }}
                onError={formState.handleOnErrors}
                extraErrors={formState.extraErrors}
                showErrorList={false}
                omitExtraData
                liveOmit
              >
                <FormControls />
              </ThemedForm>
            </>
          )}
          <MenuList onSaveConcept={saveConcept} />
        </div>
      </div>
    </>
  )
}

export default GeneratedFormRJSF
