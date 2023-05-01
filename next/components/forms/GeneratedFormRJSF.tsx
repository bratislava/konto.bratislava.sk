import { EFormValue } from '@backend/forms'
import { FormValidation, RJSFSchema } from '@rjsf/utils'
import { useFormFiller, useFormRJSFContextMemo, useFormStepper, useFormSubmitter } from '@utils/forms'
import cx from 'classnames'
import SkipStepModal from 'components/forms/segments/SkipStepModal/SkipStepModal'
import { useState } from 'react'

import FinalStep from './steps/FinalStep'
import StepperView from './steps/StepperView'
import StepButtonGroup from './steps/Summary/StepButtonGroup'
import { ThemedForm } from './ThemedForm'

interface FormRJSF {
  eform: EFormValue
  escapedSlug: string
  formSlug: string
  wrapperClassName?: string
}

const GeneratedFormRJSF = ({ eform, escapedSlug, formSlug, wrapperClassName }: FormRJSF) => {
  const filler = useFormFiller(eform)
  const formContext =  useFormRJSFContextMemo(eform, filler.formId)
  const form = useFormStepper(escapedSlug, eform, {
    onStepSumbit: filler.updateFormData,
    onInit: filler.initFormData,
  })
  const [isOnShowSkipModal, setIsOnShowSkipModal] = useState<boolean>(false)
  const [skipModalWasShown, setSkipModalWasShown] = useState<boolean>(false)
  const [skipModalNextStepIndex, setSkipModalNextStepIndex] = useState<number>(form.stepIndex)

  const skipButtonHandler = (nextStepIndex: number = form.stepIndex + 1) => {
    if (skipModalWasShown) {
      form.skipToStep(nextStepIndex)
    } else {
      setSkipModalNextStepIndex(nextStepIndex)
      setIsOnShowSkipModal(true)
    }
  }

  const submitter = useFormSubmitter(formSlug)

  return (
    <div
      className={cx(
        'flex flex-col gap-10 py-10 w-full max-w-screen-lg mx-auto',
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
          onChangeStep={skipButtonHandler}
        />
        <SkipStepModal
          show={isOnShowSkipModal && !skipModalWasShown}
          onClose={() => {
            setIsOnShowSkipModal(false)
            setSkipModalWasShown(true)
          }}
          onSkip={() => {
            form.skipToStep(skipModalNextStepIndex)
            setIsOnShowSkipModal(false)
            setSkipModalWasShown(true)
          }}
        />
      </div>
      <div className={cx('grow px-4', 'lg:px-0')}>
        {form.isComplete ? (
          <FinalStep
            formData={form.formData}
            formErrors={form.errors}
            extraErrors={form.extraErrors}
            schema={form.validatedSchema}
            onGoToStep={(step: number) => form.setStepIndex(step)}
            submitErrors={submitter.errors}
            submitMessage={submitter.successMessage}
          />
        ) : (
          <>
            <h1 className="text-h1-medium font-semibold">{form.stepTitle}</h1>
            <ThemedForm
              className="[&_legend]:hidden"
              key={`form-${escapedSlug}-step-${form.stepIndex}`}
              ref={form.formRef}
              schema={form.currentSchema}
              uiSchema={eform.uiSchema}
              formData={form.formData}
              validator={form.validator}
              customValidate={(formData: RJSFSchema, errors: FormValidation) => {
                return form.customValidate(formData, errors, form.currentSchema)
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
          previous={form.previous}
          skip={() => skipButtonHandler(form.stepIndex + 1)}
          submitStep={form.submitStep}
          submitForm={() => submitter.submitForm(form.formData)}
        />
      </div>
    </div>
  )
}

export default GeneratedFormRJSF
