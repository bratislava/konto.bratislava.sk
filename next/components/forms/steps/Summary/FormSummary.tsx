import cx from 'classnames'

import { defaultFormStateBehavior, rjfsValidator } from '../../../../frontend/utils/form'
import { useFormState } from '../../FormStateProvider'
import SummaryHeader from '../SummaryHeader'
import SummaryForm from './SummaryForm'
import SummaryFormControls from './SummaryFormControls'
import { FormSummaryProvider } from './useFormSummary'

const FormSummary = () => {
  const { formData, schema, uiSchema } = useFormState()

  return (
    <FormSummaryProvider>
      <SummaryHeader />
      <div className={cx('my-10')}>
        <SummaryForm
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          // The validator is not used, but it's required by the form. We use our own validation in `useFormSummary`.
          validator={rjfsValidator}
          experimental_defaultFormStateBehavior={defaultFormStateBehavior}
          readonly
          onSubmit={(e) => {
            console.log('form submit', e.formData)
          }}
          // We display the errors in our on way.
          showErrorList={false}
        >
          <div />
        </SummaryForm>
        <SummaryFormControls />
      </div>
    </FormSummaryProvider>
  )
}

export default FormSummary
