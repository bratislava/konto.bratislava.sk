import cx from 'classnames'

import { useFormState } from '../../FormStateProvider'
import SummaryHeader from '../SummaryHeader'
import SummaryForm from './SummaryForm'
import { FormSummaryProvider } from './useFormSummary'
import { defaultFormStateBehavior, rjfsValidator } from '../../../../frontend/utils/form'

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
          validator={rjfsValidator}
          experimental_defaultFormStateBehavior={defaultFormStateBehavior}
          readonly
          onSubmit={(e) => {
            console.log('form submit', e.formData)
          }}
          showErrorList={false}
        />
      </div>
    </FormSummaryProvider>
  )
}

export default FormSummary
