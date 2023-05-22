import { EFormValue } from '@backend/forms'
import { FormValidation, RJSFSchema } from '@rjsf/utils'
import cx from 'classnames'
import RegistrationModal from 'components/forms/segments/RegistrationModal/RegistrationModal'
import SkipStepModal from 'components/forms/segments/SkipStepModal/SkipStepModal'
import MenuList from 'components/forms/steps/MenuList'
import useAccount, { AccountStatus } from 'frontend/hooks/useAccount'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { validator } from '../../frontend/dtos/formStepperDto'
import { useFormFiller } from '../../frontend/hooks/useFormFiller'
import { useFormRJSFContextMemo } from '../../frontend/hooks/useFormRJSFContextMemo'
import { useFormStepper } from '../../frontend/hooks/useFormStepper'
import { useFormSubmitter } from '../../frontend/hooks/useFormSubmitter'
import { customValidate } from '../../frontend/utils/formStepper'
import IdentityVerificationModal from './segments/IdentityVerificationModal/IdentityVerificationModal'
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
  const { t } = useTranslation('account')
  const filler = useFormFiller(eform)
  const formContext = useFormRJSFContextMemo(eform, filler.formId)
  const form = useFormStepper(escapedSlug, eform, {
    onStepSumbit: filler.updateFormData,
    onInit: filler.initFormData,
  })
  const { isAuth, status, userData } = useAccount()
  const [isOnShowSkipModal, setIsOnShowSkipModal] = useState<boolean>(false)
  const [registrationModal, setRegistrationModal] = useState<boolean>(true)
  const [identityVerificationModal, setIdentityVerificationModal] = useState(true)
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
        {!isAuth && (
          <RegistrationModal
            title={t('register_modal.header_sent_title')}
            subtitle={t('register_modal.header_sent_subtitle')}
            show={registrationModal}
            onClose={() => setRegistrationModal(false)}
          />
        )}
        {isAuth && status !== AccountStatus.IdentityVerificationSuccess && (
          <IdentityVerificationModal
            show={identityVerificationModal}
            onClose={() => setIdentityVerificationModal(false)}
            userType={userData?.account_type}
          />
        )}
      </div>
      <div className={cx('grow px-4', 'lg:px-0')}>
        {form.isComplete ? (
          <FinalStep
            formData={form.formData}
            formErrors={form.errors}
            extraErrors={form.extraErrors}
            schema={form.validatedSchema}
            onGoToStep={form.setStepIndex}
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
          previous={form.previous}
          skip={() => skipButtonHandler(form.stepIndex + 1)}
          submitStep={form.submitStep}
          submitForm={() =>
            isAuth
              ? submitter.submitForm(filler.formId, form.formData)
              : setRegistrationModal(true)
          }
        />
        <MenuList />
      </div>
    </div>
  )
}

export default GeneratedFormRJSF
