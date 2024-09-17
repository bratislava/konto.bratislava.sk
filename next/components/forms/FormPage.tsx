import cx from 'classnames'
import MenuList from 'components/forms/steps/MenuList'
import { baFormDefaults } from 'forms-shared/form-utils/formDefaults'
import Script from 'next/script'
import { useIsomorphicLayoutEffect } from 'usehooks-ts'

import FormControls from './FormControls'
import FormUploadXmlJson from './FormUploadXmlJson'
import FormModals from './segments/FormModals/FormModals'
import FormHeader from './simple-components/FormHeader'
import StepperView from './steps/StepperView'
import FormSummary from './steps/Summary/FormSummary'
import ThemedForm from './ThemedForm'
import { useFormContext } from './useFormContext'
import { useFormErrorTranslations } from './useFormErrorTranslations'
import { useFormState } from './useFormState'

const FormPage = () => {
  const {
    formDefinition: {
      schemas: { uiSchema },
    },
    isReadonly,
    displayHeaderAndMenu,
    isEmbedded,
  } = useFormContext()
  const {
    currentStepIndex,
    currentStepperStep,
    currentStepSchema,
    formData,
    handleFormOnSubmit,
    handleFormOnChange,
    popScrollToFieldId,
  } = useFormState()

  const { transformErrors } = useFormErrorTranslations()

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
      {/* Must be copied in next.config.js to work correctly. */}
      {isEmbedded && <Script src="/scripts/iframe-resizer-child.js" async />}
      {displayHeaderAndMenu && <FormHeader />}
      <div
        className="mx-auto flex w-full max-w-screen-lg flex-col gap-10 pb-6 pt-0 lg:flex-row lg:gap-20 lg:py-10"
        data-cy="form-container"
      >
        <div>
          <StepperView />
          <FormModals />
        </div>
        <div className={cx('grow px-4', 'lg:px-0')}>
          {currentStepperStep.index === 'summary' ? (
            <FormSummary />
          ) : (
            <ThemedForm
              // This is a hack to force the form to re-render when the step changes, it's hard to say whether it
              // is needed or not, but ensures 100% safety.
              key={`form-step-${currentStepperStep.index}`}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              schema={currentStepSchema!}
              uiSchema={uiSchema}
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
              // This removes the extra conditional data for the current step, for removing the steps themselves see
              // `handleFormOnChange` implementation.
              omitExtraData
              liveOmit
              // HTML validation doesn't work for our use case, therefore it's turned off.
              noHtml5Validate
              {...baFormDefaults}
            >
              {
                // returning null would make RJSF render the default submit button
                // eslint-disable-next-line react/jsx-no-useless-fragment
                isReadonly ? <></> : <FormControls />
              }
            </ThemedForm>
          )}
          {displayHeaderAndMenu && <MenuList />}
        </div>
      </div>
      <FormUploadXmlJson />
    </>
  )
}

export default FormPage
