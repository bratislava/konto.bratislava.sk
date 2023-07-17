import Form from '@rjsf/core'
import { getDefaultFormState, StrictRJSFSchema, UiSchema } from '@rjsf/utils'
import cx from 'classnames'
import { useEffect, useMemo, useRef, useState } from 'react'

import { validator } from '../../../../frontend/dtos/formStepperDto'
import { useFormState } from '../../FormStateProvider'
import SummaryForm from '../../SummaryForm'
import SummaryHeader from '../SummaryHeader'

interface SummaryProps {
  uiSchema: UiSchema
  schema: StrictRJSFSchema
}

const FormSummary = ({ uiSchema, schema }: SummaryProps) => {
  const formState = useFormState()

  const errors = useMemo(() => {
    const defaultFormData = getDefaultFormState(validator, schema, formState.formData)
    return validator.validateFormData(defaultFormData, schema)
  }, [formState.formData, schema])

  return (
    <>
      <SummaryHeader />
      <div className={cx('my-10')}>
        <SummaryForm
          // className="[&_legend]:hidden"
          schema={schema}
          uiSchema={uiSchema}
          formData={formState.formData}
          validator={validator}
          // customValidate={(formData: RJSFSchema, errors: FormValidation) => {
          //   return customValidate(formData, errors, formState.currentSchema)
          // }}
          onSubmit={(e) => {
            // console.log('onSubmit', e)
            // formState.handleOnSubmit(e.formData as RJSFSchema)
          }}
          onChange={(e) => {
            // formState.handleOnChange(e.formData as RJSFSchema)
          }}
          onError={(e) => {
            // console.log('onError', e)
          }}
          // onError={formState.handleOnErrors}
          extraErrors={errors.errorSchema}
          // showErrorList={false}
          // omitExtraData
          // liveOmit
          readonly
        />
        {/* {transformedSteps.map((step: TransformedFormStep, key: number) => { */}
        {/*  return step.data.length > 0 ? ( */}
        {/*    <SummaryStep key={key} step={step} onGoToStep={() => onGoToStep(key)} /> */}
        {/*  ) : null */}
        {/* })} */}
      </div>
    </>
  )
}

export default FormSummary
