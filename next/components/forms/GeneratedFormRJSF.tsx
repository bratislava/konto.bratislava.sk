import { FormDefinition } from '@backend/forms/types'
import { FormValidation, RJSFSchema } from '@rjsf/utils'
import cx from 'classnames'
import MenuList from 'components/forms/steps/MenuList'
import useAccount from 'frontend/hooks/useAccount'
import { useRef } from 'react'

import { validator } from '../../frontend/dtos/formStepperDto'
import { useFormRJSFContext } from '../../frontend/hooks/useFormRJSFContext'
import { useFormStepper } from '../../frontend/hooks/useFormStepper'
import { useFormSubmitter } from '../../frontend/hooks/useFormSubmitter'
import { customValidate } from '../../frontend/utils/formStepper'
import FormModals, { FormModalsRef } from './segments/FormModals/FormModals'
import FormHeader from './simple-components/FormHeader'
import FinalStep from './steps/FinalStep'
import StepperView from './steps/StepperView'
import StepButtonGroup from './steps/Summary/StepButtonGroup'
import { ThemedForm } from './ThemedForm'
import { InitialFormData } from './useFormDataLoader'

interface FormRJSF {
  formDefinition: FormDefinition
  escapedSlug: string
  formSlug: string
  wrapperClassName?: string
  initialFormData: InitialFormData
}

const GeneratedFormRJSF = ({
  formDefinition,
  escapedSlug,
  formSlug,
  wrapperClassName,
  initialFormData,
}: FormRJSF) => {
  const formContext = useFormRJSFContext(formDefinition, initialFormData)
  const form = useFormStepper(escapedSlug, formDefinition, initialFormData)
  const submitter = useFormSubmitter(formSlug)
  const formModalsRef = useRef<FormModalsRef>(null)
  const { isAuth } = useAccount()

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const saveConcept = async () => {
    throw new Error('Not implemented')
  }

  return (
    <>
      <FormHeader
        onImportXml={form.importXml}
        onExportXml={form.exportXml}
        onSaveConcept={saveConcept}
        onExportPdf={form.exportPdf}
      />
      <div
        className={cx(
          'flex flex-col gap-10 pt-0 pb-6 lg:py-10 w-full max-w-screen-lg mx-auto',
          'lg:flex-row lg:gap-20',
          wrapperClassName,
        )}
      >
        <div className="">
          <StepperView
            steps={form.stepData}
            currentStep={form.stepIndex}
            // hook useFormStepper is prepared to skip multiple steps but they will not be validated
            // if skip of multiple steps is not wanted, comment out onChangeStep
            onChangeStep={formModalsRef.current?.skipButtonHandler}
          />
          <FormModals stepIndex={form.stepIndex} skipToStep={form.skipToStep} ref={formModalsRef} />
        </div>
        <div className={cx('grow px-4', 'lg:px-0')}>
          {form.isComplete ? (
            <FinalStep
              formData={form.formData}
              formErrors={form.errors}
              extraErrors={form.extraErrors}
              fileScans={formContext.fileScans}
              schema={form.validatedSchema}
              onGoToStep={form.setStepIndex}
              submitErrors={submitter.errors}
              submitMessage={submitter.successMessage}
              onUpdateFileScans={(updatedScans) => {
                formContext.setFileScans(updatedScans)
              }}
            />
          ) : (
            <>
              <h1 className="text-h1-medium font-semibold">{form.stepTitle}</h1>
              <ThemedForm
                className="[&_legend]:hidden"
                key={`form-${escapedSlug}-step-${form.stepIndex}`}
                ref={form.formRef}
                schema={form.currentSchema}
                uiSchema={formDefinition.uiSchema}
                formData={form.formData}
                validator={validator}
                customValidate={(formData: RJSFSchema, errors: FormValidation) => {
                  return customValidate(formData, errors, form.currentSchema)
                }}
                onSubmit={async (e) => {
                  await form.handleOnSubmit(e.formData as RJSFSchema)
                }}
                onChange={(e) => {
                  form.setStepFormData(e.formData as RJSFSchema)
                }}
                onError={form.handleOnErrors}
                extraErrors={form.extraErrors}
                formContext={formContext}
                showErrorList={false}
                omitExtraData
                liveOmit
              />
            </>
          )}
          <StepButtonGroup
            stepIndex={form.stepIndex}
            isFinalStep={form.isComplete}
            fileScans={formContext.fileScans}
            previous={form.previous}
            skip={() => formModalsRef.current?.skipButtonHandler(form.stepIndex + 1)}
            submitStep={form.submitStep}
            submitForm={() =>
              isAuth
                ? submitter.submitForm(form.formData, initialFormData.formId)
                : formModalsRef.current?.openRegistrationModal()
            }
          />
          <MenuList
            onExportXml={form.exportXml}
            onSaveConcept={saveConcept}
            onImportXml={form.importXml}
            onExportPdf={form.exportPdf}
          />
        </div>
      </div>
    </>
  )
}

export default GeneratedFormRJSF
