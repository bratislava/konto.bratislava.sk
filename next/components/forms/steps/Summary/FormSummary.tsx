import { defaultFormStateBehavior, rjfsValidator } from '../../../../frontend/utils/form'
import { useFormState } from '../../useFormState'
import SummaryHeader from '../SummaryHeader'
import SummaryForm from './SummaryForm'
import SummaryFormControls from './SummaryFormControls'
import SummaryFormLegalText from './SummaryFormLegalText'
import { FormSummaryProvider } from './useFormSummary'

const FormSummary = () => {
  const { formData, schema, uiSchema, isReadonly } = useFormState()

  return (
    <FormSummaryProvider>
      <div className="flex flex-col gap-4">
        <SummaryHeader />
        <SummaryForm
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          // The validator is not used, but it's required by the form. We use our own validation in `useFormSummary`.
          validator={rjfsValidator}
          experimental_defaultFormStateBehavior={defaultFormStateBehavior}
          readonly={isReadonly}
          onSubmit={(e) => {
            console.log('form submit', e.formData)
          }}
          // We display the errors in our on way.
          showErrorList={false}
        >
          <div />
        </SummaryForm>
        <SummaryFormLegalText />
        <SummaryFormControls />
      </div>
    </FormSummaryProvider>
  )
}

export default FormSummary
