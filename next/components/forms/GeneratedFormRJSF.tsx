import { FormValidation, getDefaultFormState, RJSFSchema, UiSchema } from '@rjsf/utils'
import cx from 'classnames'
import MenuList from 'components/forms/steps/MenuList'
import { useEffectOnce } from 'usehooks-ts'

import { validator } from '../../frontend/dtos/formStepperDto'
import { useFormSubmitter } from '../../frontend/hooks/useFormSubmitter'
import FormControls from './FormControls'
import { useFormState } from './FormStateProvider'
import FormModals from './segments/FormModals/FormModals'
import FormHeader from './simple-components/FormHeader'
import StepperView from './steps/StepperView'
import FormSummary from './steps/Summary/FormSummary'
import { ThemedForm } from './ThemedForm'

interface FormRJSF {
  uiSchema: UiSchema
  schema: RJSFSchema
  formSlug: string
  wrapperClassName?: string
}

const GeneratedFormRJSF = ({ uiSchema, schema, formSlug, wrapperClassName }: FormRJSF) => {
  const formState = useFormState()
  const submitter = useFormSubmitter(formSlug)

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const saveConcept = async () => {
    throw new Error('Not implemented')
  }

  useEffectOnce(() => {
    const x = getDefaultFormState(validator, schema, {})
    const y = validator.validateFormData({}, schema)
    console.log('x', x)
    console.log('y', y)
  })

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
        <div>
          <StepperView />
          <FormModals />
        </div>
        <div className={cx('grow px-4', 'lg:px-0')}>
          {formState.stepIndex === 'summary' ? (
            // TODO validatedSchema ?
            <FormSummary uiSchema={uiSchema} schema={schema} />
          ) : (
            <>
              <h1 className="text-h1-medium font-semibold">{formState.currentStepData.title}</h1>
              <ThemedForm
                className="[&_legend]:hidden"
                key={`form-step-${formState.stepIndex}`}
                schema={formState.currentSchema}
                uiSchema={uiSchema}
                formData={formState.formData}
                validator={validator}
                onSubmit={(e) => {
                  formState.handleOnSubmit(e.formData as RJSFSchema)
                }}
                onChange={(e) => {
                  formState.handleOnChange(e.formData as RJSFSchema)
                }}
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
