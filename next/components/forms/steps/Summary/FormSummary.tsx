import cx from 'classnames'
import { useMemo } from 'react'

import { validateSummary, validator } from '../../../../frontend/dtos/formStepperDto'
import { useFormState } from '../../FormStateProvider'
import { useFormFileUpload } from '../../useFormFileUpload'
import SummaryHeader from '../SummaryHeader'
import SummaryForm from './SummaryForm'

const FormSummary = () => {
  const { formData, schema, uiSchema } = useFormState()
  const { getFileInfoById } = useFormFileUpload()

  const { errorSchema, infectedFiles, scanningFiles, scanErrorFiles } = useMemo(
    () => validateSummary(schema, formData, getFileInfoById),
    [formData, schema, getFileInfoById],
  )

  return (
    <>
      <SummaryHeader
        infectedFiles={infectedFiles}
        scanningFiles={scanningFiles}
        scanErrorFiles={scanErrorFiles}
      />
      <div className={cx('my-10')}>
        <SummaryForm
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          validator={validator}
          extraErrors={errorSchema}
          readonly
        />
      </div>
    </>
  )
}

export default FormSummary
