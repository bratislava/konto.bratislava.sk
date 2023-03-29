import Form from '@rjsf/core'
import { ErrorSchema, RJSFSchema, RJSFValidationError } from '@rjsf/utils'
import { ApiError, formDataToXml, submitEform, xmlToFormData } from '@utils/api'
import { readTextFile } from '@utils/file'
import {
  ajvKeywords,
  customFormats,
  customValidate,
  getAllStepData,
  getInitFormData,
  getJsonSchemaPropertyTree,
  getValidatedSteps,
  mergePropertyTreeToFormData,
  validateAsyncProperties,
  validator,
} from '@utils/forms-helper'
import useSnackbar from '@utils/useSnackbar'
import { ErrorObject } from 'ajv'
import { cloneDeep } from 'lodash'
import { useTranslation } from 'next-i18next'
import { ChangeEvent, RefObject, useEffect, useRef, useState } from 'react'

import { StepData } from '../components/forms/types/TransformedFormData'

// TODO prevent unmounting
// TODO persist state for session
// TODO figure out if we need to step over uiSchemas, or having a single one is enough (seems like it is for now)
export const useFormStepper = (eformSlug: string, schema: RJSFSchema) => {
  // since Form can be undefined, useRef<Form> is understood as an overload of useRef returning MutableRef, which does not match expected Ref type be rjsf
  // also, our code expects directly RefObject otherwise it will complain of no `.current`
  // this is probably a bug in their typing therefore the cast
  const formRef = useRef<Form>() as RefObject<Form>

  // main state variables with the most important info
  const [stepIndex, setStepIndex] = useState<number>(0)
  const [formData, setFormData] = useState<RJSFSchema>(getInitFormData(schema))
  const [errors, setErrors] = useState<Record<string, RJSFValidationError[]>>({})
  const [extraErrors, setExtraErrors] = useState<ErrorSchema>({})

  // state variables helping in stepper
  const [nextStepIndex, setNextStepIndex] = useState<number | null>(null)
  const [nextStep, setNextStep] = useState<RJSFSchema | null>(null)
  const [isSkipEnabled, setIsSkipEnabled] = useState<boolean>(false)
  const disableSkip = () => setIsSkipEnabled(false)

  // state variables with info about steps for summary and stepper
  const [steps, setSteps] = useState<RJSFSchema[]>(getValidatedSteps(schema, formData))
  const validateSteps = () => {
    const newValidatedSteps = getValidatedSteps(schema, formData)
    setSteps(newValidatedSteps)
  }
  const [stepData, setStepData] = useState<StepData[]>(getAllStepData(steps))

  // side info about steps
  const stepsLength: number = steps?.length ?? -1
  const isComplete = stepIndex === stepsLength
  const currentSchema = steps ? cloneDeep(steps[stepIndex]) : {}

  useEffect(() => {
    // effect to reset all internal state when critical input 'props' change
    setFormData(getInitFormData(schema))
    setStepIndex(0)
    validateSteps()
  }, [eformSlug, schema])

  useEffect(() => {
    // stepIndex allowed to climb one step above the length of steps - i.e. to render a final overview or other custom components but still allow to return back
    if (stepIndex > stepsLength) {
      // stepIndex larger than last step index + 1
      setStepIndex(stepsLength)
    }
  }, [stepIndex, steps, stepsLength])

  useEffect(() => window.scrollTo(0, 0), [stepIndex])

  const changeStepData = (targetIndex: number, value: boolean): void => {
    // change isFilled state for last stepData
    const newStepData: StepData[] = stepData.map((step: StepData, index: number) =>
      index === targetIndex ? { ...step, isFilled: value } : { ...step },
    )
    setStepData(newStepData)
  }

  const validate = async (): Promise<boolean> => {
    // validate submitted form step
    let isValid = formRef?.current?.validateForm() ?? false

    if (schema.$async === true) {
      const newExtraErrors = await validateAsyncProperties(currentSchema, formData, [])
      isValid = isValid && Object.keys(newExtraErrors).length === 0
      setExtraErrors({ ...extraErrors, ...newExtraErrors })
    }

    return isValid
  }

  // TODO: update for conditional steps
  const setUniqueErrors = (newErrors: RJSFValidationError[], actualStepIndex: number) => {
    // update form errors - update even if there is no error
    const actualStepKey = stepData[actualStepIndex].stepKey
    const oldErrors: RJSFValidationError[] =
      actualStepKey in errors ? [...errors[actualStepKey]] : []

    const updatedErrors: Record<string, RJSFValidationError[]> = {
      ...errors,
      [actualStepKey]: [...oldErrors, ...newErrors].filter(
        (item, index) => oldErrors.indexOf(item) !== index,
      ),
    }

    setErrors(updatedErrors)
  }

  const transformErrorsToArray = (): RJSFValidationError[][] => {
    return stepData.map(({ stepKey }: StepData) => (stepKey in errors ? errors[stepKey] : []))
  }

  const previous = () => setStepIndex(stepIndex - 1)
  const next = () => {
    // if go next step, just validate steps (show/hide conditional steps) and got to next step
    validateSteps()
    setStepIndex(stepIndex + 1)
  }
  const jumpToStep = () => {
    // jump through multiple steps
    if (nextStepIndex != null) {
      // need to save nextStep, because after next step validation (conditional steps), we must jump to our original chosen step
      setNextStep(steps[nextStepIndex])
    }
  }

  useEffect(() => {
    if ((nextStepIndex != null && nextStep != null) || nextStepIndex === steps.length) {
      // when we save nextStep, we will validate all (conditional) steps
      validateSteps()
    }
  }, [nextStep])

  useEffect(() => {
    // after (conditional) steps are validated, do actions
    if (nextStepIndex != null && nextStep != null) {
      // find saved next step and find it in new list of steps after validation
      const newNextStepIndex: number = steps.findIndex(
        (step: RJSFSchema) => JSON.stringify(step) === JSON.stringify(nextStep),
      )
      const realNextStepIndex: number = newNextStepIndex >= 0 ? newNextStepIndex : nextStepIndex
      setStepIndex(realNextStepIndex)
      setNextStepIndex(null)
      setNextStep(null)
    } else if (nextStepIndex != null && nextStep === undefined) {
      // if nextStep is undefined, it means we are going to Summary
      setStepIndex(steps.length)
      setNextStepIndex(null)
      setNextStep(null)
    }
    setStepData(getAllStepData(steps, stepData))
  }, [steps])

  const submitStep = () => {
    formRef?.current?.submit()
  }

  useEffect(() => {
    // need to handle skipping with submitting and validating (skip step means do submitting and validating but always go to next step)
    if (isSkipEnabled) {
      if (isComplete) {
        // if we are in Summary and want to jump to any step
        jumpToStep()
        disableSkip()
      } else {
        // if we are in any other step (not Summary), we will submit Step
        submitStep()
      }
    }
  }, [isSkipEnabled])

  // TODO: could be reduced by wrapping nextStepIndex and isSkipEnabled to 1 object
  useEffect(() => {
    // this is needed for skipping multiple steps through Stepper
    // we must save it because we are going to submit step even if we are skipping it
    if (nextStepIndex != null) {
      setIsSkipEnabled(true)
    }
  }, [nextStepIndex])

  const skipToStep = (newNextStepIndex: number) => {
    setNextStepIndex(newNextStepIndex)
  }

  const setStepFormData = (stepFormData: RJSFSchema) => {
    // save formData for step with all properties including conditional fields and unfilled fields
    const tree = getJsonSchemaPropertyTree(currentSchema)
    const fullStepFormData = mergePropertyTreeToFormData(stepFormData, tree)
    setFormData({ ...formData, ...fullStepFormData })
  }

  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const { t } = useTranslation('forms')

  const exportXml = async () => {
    try {
      const xml = await formDataToXml(eformSlug, formData)
      const link = document.createElement('a')
      link.href = URL.createObjectURL(xml)
      link.download = `${eformSlug}_output.xml`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      openSnackbarError(t('errors.xml_export'))
    }
  }

  const importXml = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const xmlData = await readTextFile(e)
      const formData = await xmlToFormData(eformSlug, xmlData)
      setFormData(formData)
    } catch (error) {
      openSnackbarError(t('errors.xml_import'))
    }
  }

  const handleOnSubmit = async (newFormData: RJSFSchema) => {
    // handles onSubmit event of form step
    // it is called also if we are going to skip step by 1
    setStepFormData(newFormData)
    const isFormValid = await validate()

    if (isFormValid) {
      setUniqueErrors([], stepIndex)
    }
    if (isFormValid && !isSkipEnabled) {
      changeStepData(stepIndex, true)
      next()
      disableSkip()
    }
    if (!isFormValid || (isFormValid && isSkipEnabled)) {
      jumpToStep()
      disableSkip()
    }
  }

  const handleOnErrors = (newErrors: RJSFValidationError[]) => {
    // handles onErrors event of form step
    // it is called also if we are going to skip step by 1
    setUniqueErrors(newErrors, stepIndex)
    if (isSkipEnabled) {
      changeStepData(stepIndex, false)
      jumpToStep()
      disableSkip()
    }
  }

  return {
    stepIndex,
    setStepIndex,
    formData,
    setStepFormData,
    errors: transformErrorsToArray(),
    extraErrors,
    validate,
    setErrors: setUniqueErrors,
    stepData,
    validatedSchema: { ...schema, allOf: [...steps] },
    previous,
    next,
    submitStep,
    skipToStep,
    isSkipEnabled,
    disableSkip,
    customValidate,
    handleOnSubmit,
    handleOnErrors,
    currentSchema,
    isComplete,
    formRef,
    keywords: ajvKeywords,
    customFormats,
    validator,
    exportXml,
    importXml,
  }
}

export const useFormSubmitter = (slug: string) => {
  const [errors, setErrors] = useState<Array<ErrorObject | string>>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { t } = useTranslation('forms')

  const submitForm = async (formData: RJSFSchema) => {
    try {
      // TODO do something more with the result then just showing success
      const result = await submitEform(slug, formData)
      setErrors([])
      setSuccessMessage(t('success'))
    } catch (error) {
      console.log('Form submission error')
      console.log(error)
      if (error instanceof ApiError) {
        setErrors(error.errors)
      } else if (error instanceof Error) {
        setErrors([t([`errors.${error?.message}`, 'errors.unknown'])])
      } else {
        setErrors([t('errors.unknown')])
      }
    }
  }

  return {
    submitForm,
    errors,
    successMessage,
  }
}
