import {
  ErrorSchema,
  FormValidation,
  RJSFSchema,
  RJSFValidationError,
  StrictRJSFSchema,
  UiSchema,
} from '@rjsf/utils'

import { JsonSchema, validator } from '../../../../frontend/dtos/formStepperDto'
import { customValidate } from '../../../../frontend/utils/formStepper'
import { useFormDataTransform } from '../../../../frontend/utils/rjsfSchemaHandler'
import { useFormState } from '../../FormStateProvider'
import SummaryForm from '../../SummaryForm'
import SummaryStep from './SummaryStep'
import { TransformedFormStep } from './TransformedFormData'

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

  // const x = validator.validateFormData(schema!, formData)
  // const y = validator.rawValidation(schema!, formData)
  // console.log('errors', x, y)
  // console.log({ schema, formData, formErrors, extraErrors })
  // const { transformedSteps } = useFormDataTransform(formData, formErrors, extraErrors, [], schema)
  // console.log(transformedSteps)

  return (
    <div className="my-10">
      <SummaryForm
        // className="[&_legend]:hidden"
        schema={schema!}
        uiSchema={uiSchema}
        formData={formState.formData}
        validator={validator}
        // customValidate={(formData: RJSFSchema, errors: FormValidation) => {
        //   return customValidate(formData, errors, formState.currentSchema)
        // }}
        onSubmit={(e) => {
          console.log('onSubmit', e)
          // formState.handleOnSubmit(e.formData as RJSFSchema)
        }}
        onChange={(e) => {
          // formState.handleOnChange(e.formData as RJSFSchema)
        }}
        onError={(e) => {
          console.log('onError', e)
        }}
        // onError={formState.handleOnErrors}
        extraErrors={formState.extraErrors}
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
