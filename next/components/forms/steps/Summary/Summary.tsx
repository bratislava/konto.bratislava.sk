import Form from '@rjsf/core'
import { ErrorSchema, RJSFValidationError, StrictRJSFSchema, UiSchema } from '@rjsf/utils'
import cx from 'classnames'
import { useEffect, useRef, useState } from 'react'

import { JsonSchema, validator } from '../../../../frontend/dtos/formStepperDto'
import { useFormState } from '../../FormStateProvider'
import SummaryForm from '../../SummaryForm'

interface SummaryProps {
  uiSchema: UiSchema
  formData: Record<string, JsonSchema>
  formErrors: RJSFValidationError[][]
  extraErrors: ErrorSchema
  schema?: StrictRJSFSchema
  onGoToStep: (step: number) => void
}

const Summary = ({ uiSchema, schema }: SummaryProps) => {
  const formState = useFormState()

  const formRef = useRef<Form>(null)
  const divRef = useRef<HTMLDivElement>(null)
  const [validated, setValidated] = useState(false)
  const [errors] = useState(validator.validateFormData(formState.formData, schema!))

  useEffect(() => {
    debugger
    const x = validator.validateFormData(formState.formData, schema!)
    console.log(x)

    // if (formRef.current) {
    //   formRef.current.validateForm()
    //   divRef.current?.className.replace('hidden', '')
    // }
  }, [])
  // const x = validator.validateFormData(schema!, formData)
  // const y = validator.rawValidation(schema!, formData)
  // console.log('errors', x, y)
  // console.log({ schema, formData, formErrors, extraErrors })
  // const { transformedSteps } = useFormDataTransform(formData, formErrors, extraErrors, [], schema)
  // console.log(transformedSteps)

  return (
    // { 'px-5': !validated }
    <div className={cx('my-10')} ref={divRef}>
      <SummaryForm
        // className="[&_legend]:hidden"
        schema={schema!}
        uiSchema={uiSchema}
        formData={formState.formData}
        validator={validator}
        ref={formRef}
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
  )
}

export default Summary
