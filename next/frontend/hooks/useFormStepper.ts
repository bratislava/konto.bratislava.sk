// TODO prevent unmounting
// TODO persist state for session
// TODO figure out if we need to step over uiSchemas, or having a single one is enough (seems like it is for now)
import { EFormValue } from '@backend/forms'
import Form from '@rjsf/core'
import {
  ErrorSchema,
  FormValidation,
  retrieveSchema,
  RJSFSchema,
  RJSFValidationError,
  StrictRJSFSchema,
} from '@rjsf/utils'
import { JSONSchema7, JSONSchema7Definition } from 'json-schema'
import { cloneDeep, get, merge } from 'lodash'
import { useTranslation } from 'next-i18next'
import { ChangeEvent, RefObject, useEffect, useRef, useState } from 'react'

import { StepData } from '../../components/forms/types/TransformedFormData'
import { formDataToXml, validateKeyword, xmlToFormData } from '../api/api'
import {
  ajvKeywords, buildRJSFError, createTestFormData,
  customFormats, getAllPossibleJsonSchemaProperties,
  getInitFormData,
  getJsonSchemaPropertyTree, KeywordDefinition,
  mergePropertyTreeToFormData, validator,
} from '../forms'
import { readTextFile } from '../utils/file'
import logger from '../utils/logger'
import useSnackbar from './useSnackbar'

interface Callbacks {
  onStepSumbit?: (formData: any) => Promise<void>
  onInit?: () => Promise<any>
}

const getValidatedSteps = (schema: RJSFSchema, formData: RJSFSchema): RJSFSchema[] => {
  const testFormData = createTestFormData(formData)
  return schema?.allOf
    .map((step) => {
      const typedStep = typeof step !== 'boolean' ? step : {}
      return retrieveSchema(validator, typedStep, schema, testFormData)
    })
    .filter((step) => typeof step !== 'boolean' && Object.keys(step).length > 0)
}

const getAllStepData = (
  schemaAllOf: JSONSchema7Definition[],
  oldStepData?: StepData[],
): StepData[] => {
  if (!schemaAllOf || !Array.isArray(schemaAllOf)) return []
  return schemaAllOf
    .map((step) => {
      if (typeof step === 'boolean') return null
      const transformedStep: JSONSchema7 = step
      if (!transformedStep.properties || Object.values(transformedStep.properties).length === 0)
        return null
      const stepProperties = transformedStep.properties ?? {}
      const [key, value]: [string, JSONSchema7Definition] = Object.entries(stepProperties)[0]
      if (typeof value === 'boolean') return null
      // if step was already filled, we need to find out
      const reuseOldStep = oldStepData?.find((oldStep: StepData) => oldStep.stepKey === key)
      return {
        title: value.title ?? key,
        stepKey: key,
        isFilled: reuseOldStep?.isFilled || false,
      }
    })
    .filter(Boolean) as StepData[]
}

const isFieldRequired = (fieldKey: string, schema: StrictRJSFSchema): boolean => {
  return Object.entries(schema).some(([key, value]: [string, StrictRJSFSchema]) => {
    if (key === 'required' && Array.isArray(value) && value.includes(fieldKey)) {
      return true
    }
    let isRequired = false
    if (key !== 'required' && value && Array.isArray(value)) {
      value.forEach((item: StrictRJSFSchema) => {
        isRequired = isRequired || isFieldRequired(fieldKey, item)
      })
    } else if (key !== 'required' && value && typeof value === 'object') {
      isRequired = isRequired || isFieldRequired(fieldKey, value)
    }
    return isRequired
  })
}

const validateDateFromToFormat = (
  formData: RJSFSchema,
  errors: FormValidation,
  schema: RJSFSchema,
) => {
  const formDataKeys = Object.entries(formData)
  formDataKeys?.forEach(([key, value]: [string, RJSFSchema]) => {
    const schemaProperty: JSONSchema7Definition = schema.properties[key]
    if (
      schema?.properties &&
      schemaProperty &&
      typeof schemaProperty !== 'boolean' &&
      'dateFromTo' in schemaProperty &&
      schemaProperty.dateFromTo &&
      value.startDate &&
      value.endDate
    ) {
      const startDate = new Date(value.startDate as string)
      const endDate = new Date(value.endDate as string)

      if (endDate <= startDate) {
        errors[key]?.endDate?.addError('End date must be greater than start date')
      }
    }
  })
}
const validateTimeFromToFormat = (
  formData: RJSFSchema,
  errors: FormValidation,
  schema: RJSFSchema,
) => {
  const formDataKeys = Object.entries(formData)
  formDataKeys?.forEach(([key, value]: [string, RJSFSchema]) => {
    const schemaProperty: JSONSchema7Definition = schema.properties[key]
    if (
      schema?.properties &&
      schemaProperty &&
      typeof schemaProperty !== 'boolean' &&
      'timeFromTo' in schemaProperty &&
      schemaProperty.timeFromTo &&
      value.startTime &&
      value.endTime
    ) {
      const startTime: number[] = (value.startTime as string)
        ?.split(':')
        .map((time: string) => parseInt(time, 10))

      const endTime: number[] = (value.endTime as string)
        ?.split(':')
        .map((time: string) => parseInt(time, 10))

      const startTimeSeconds = startTime[0] * 60 * 60 + startTime[1] * 60
      const endTimeSeconds = endTime[0] * 60 * 60 + endTime[1] * 60

      if (endTimeSeconds <= startTimeSeconds) {
        errors[key]?.endTime?.addError('End time must be greater than start time')
      }
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validateRequiredFormat = (
  formData: RJSFSchema,
  errors: FormValidation,
  schema: StrictRJSFSchema,
) => {
  const REQUIRED_VALUE = 'Required input'
  Object.entries(formData).forEach(([key, value]: [string, RJSFSchema]) => {
    const currentErrors = errors[key]
    if (value && currentErrors && typeof value === 'object') {
      validateRequiredFormat(value, currentErrors, schema)
    } else if (!value && currentErrors && isFieldRequired(key, schema)) {
      currentErrors.addError(REQUIRED_VALUE)
    }
  })
}

const customValidate = (formData: RJSFSchema, errors: FormValidation, schema: StrictRJSFSchema) => {
  // validateRequiredFormat(formData, errors, schema)
  validateDateFromToFormat(formData, errors, schema)
  validateTimeFromToFormat(formData, errors, schema)
  return errors
}

const validateAsyncProperties = async (
  schema: RJSFSchema,
  data: unknown,
  path: string[],
): Promise<ErrorSchema> => {
  let errors = {}

  await Promise.all(
    ajvKeywords.map(async (k: KeywordDefinition) => {
      const keyword: string = k.keyword as string
      if (k.async === true && schema[keyword]) {
        const isValid = await validateKeyword(keyword, schema[keyword], get(data, path), schema)
        if (!isValid) {
          const schemaErrorMessage: string = (schema[keyword] as RJSFSchema).errorMsg as string
          errors = merge(errors, buildRJSFError(path, schemaErrorMessage))
        }
      }
    }),
  )

  const properties = getAllPossibleJsonSchemaProperties(schema)
  await Promise.all(
    Object.keys(properties).map(async (key) => {
      const childSchema = properties[key] as RJSFSchema
      errors = merge(errors, await validateAsyncProperties(childSchema, data, [...path, key]))
    }),
  )

  return errors
}


export const useFormStepper = (eformSlug: string, eform: EFormValue, callbacks: Callbacks) => {
  const { schema } = eform
  // since Form can be undefined, useRef<Form> is understood as an overload of useRef returning MutableRef, which does not match expected Ref type be rjsf
  // also, our code expects directly RefObject otherwise it will complain of no `.current`
  // this is probably a bug in their typing therefore the cast
  const formRef = useRef<Form>() as RefObject<Form>

  // main state variables with the most important info
  const [stepIndex, setStepIndex] = useState<number>(0)
  const [formData, setFormData] = useState<RJSFSchema>(getInitFormData(schema))
  const [errors, setErrors] = useState<Record<string, RJSFValidationError[]>>({})
  const [extraErrors, setExtraErrors] = useState<ErrorSchema>({})
  const [openSnackbarError] = useSnackbar({ variant: 'error' })

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

  const initFormData = async () => {
    const loadedFormData: RJSFSchema = await callbacks.onInit?.()
    if (loadedFormData) {
      setFormData(loadedFormData)
    } else {
      setFormData(getInitFormData(schema))
    }
  }

  useEffect(() => {
    // effect to reset all internal state when critical input 'props' change
    initFormData()
      .then(() => {
        setStepIndex(0)
        validateSteps()
        return null
      })
      .catch((error_) => logger.error('Init FormData failed', error_))
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const currentStepKey: string = Object.keys(currentSchema.properties)[0]
      if (!(currentStepKey in newExtraErrors)) {
        const updatedExtraErrors = { ...extraErrors }
        delete updatedExtraErrors[currentStepKey]
        setExtraErrors(updatedExtraErrors)
      } else {
        setExtraErrors({ ...extraErrors, ...newExtraErrors })
      }
    }

    return isValid
  }

  const setUniqueErrors = (newErrors: RJSFValidationError[], currentStepIndex: number) => {
    // update form errors - update even if there is no error
    const currentStepKey = stepData[currentStepIndex].stepKey
    const oldErrors: RJSFValidationError[] =
      currentStepKey in errors ? [...errors[currentStepKey]] : []

    const updatedErrors: Record<string, RJSFValidationError[]> = {
      ...errors,
      [currentStepKey]: [...oldErrors, ...newErrors].filter(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const transformedFormData: RJSFSchema = await xmlToFormData(eformSlug, xmlData)
      setFormData(transformedFormData)
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
      await callbacks.onStepSumbit?.(formData)
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
    stepTitle: stepData[stepIndex]?.title || stepData[stepIndex]?.stepKey || '',
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
