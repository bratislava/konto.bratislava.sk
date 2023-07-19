import { getDefaultFormState } from '@rjsf/utils'
import cx from 'classnames'
import { useMemo } from 'react'

import { validator } from '../../../../frontend/dtos/formStepperDto'
import { useFormState } from '../../FormStateProvider'
import SummaryForm from '../../SummaryForm'
import SummaryHeader from '../SummaryHeader'

const FormSummary = () => {
  const { formData, schema, uiSchema } = useFormState()

  const errors = useMemo(() => {
    const defaultFormData = getDefaultFormState(validator, schema, formData)
    return validator.validateFormData(defaultFormData, schema)
  }, [formData, schema])

  return (
    <>
      <SummaryHeader />
      <div className={cx('my-10')}>
        <SummaryForm
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          validator={validator}
          extraErrors={errors.errorSchema}
          readonly
        />
      </div>
    </>
  )
}

export default FormSummary
