import cx from 'classnames'
import MenuList from 'components/forms/steps/MenuList'

import { validator } from '../../frontend/dtos/formStepperDto'
import FormControls from './FormControls'
import { useFormState } from './FormStateProvider'
import FormModals from './segments/FormModals/FormModals'
import FormHeader from './simple-components/FormHeader'
import StepperView from './steps/StepperView'
import FormSummary from './steps/Summary/FormSummary'
import ThemedForm from './ThemedForm'

const GeneratedFormRJSF = () => {
  const {
    uiSchema,
    currentStepMetadata,
    currentStepSchema,
    formData,
    handleFormOnSubmit,
    handleFormOnChange,
  } = useFormState()

  return (
    <>
      <FormHeader />
      <div className="flex flex-col gap-10 pt-0 pb-6 lg:py-10 w-full max-w-screen-lg mx-auto lg:flex-row lg:gap-20">
        <div>
          <StepperView />
          <FormModals />
        </div>
        <div className={cx('grow px-4', 'lg:px-0')}>
          {currentStepMetadata.isSummary ? (
            <FormSummary />
          ) : (
            <>
              <h1 className="text-h1-medium font-semibold">{currentStepMetadata.title}</h1>
              <ThemedForm
                key={`form-step-${currentStepMetadata.index}`}
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                schema={currentStepSchema!}
                uiSchema={uiSchema}
                formData={formData}
                validator={validator}
                onSubmit={(e) => {
                  handleFormOnSubmit(e.formData)
                }}
                onChange={(e) => {
                  handleFormOnChange(e.formData)
                }}
                showErrorList={false}
                omitExtraData
                liveOmit
              >
                <FormControls />
              </ThemedForm>
            </>
          )}
          <MenuList />
        </div>
      </div>
    </>
  )
}

export default GeneratedFormRJSF
