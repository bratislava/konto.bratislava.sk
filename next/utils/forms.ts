import { EFormValue } from '@backend/forms'
import Form from '@rjsf/core'
import {
  ErrorSchema,
  FormValidation,
  getDefaultFormState,
  retrieveSchema,
  RJSFSchema,
  RJSFValidationError,
  StrictRJSFSchema,
  ValidatorType,
} from '@rjsf/utils'
import { customizeValidator } from '@rjsf/validator-ajv8'
import {
  ApiError,
  createForm,
  formDataToXml,
  FormDto,
  getForm,
  submitEform,
  updateForm,
  validateKeyword,
  xmlToFormData,
} from '@utils/api'
import { readTextFile } from '@utils/file'
import useAccount from '@utils/useAccount'
import useSnackbar from '@utils/useSnackbar'
import { AnySchemaObject, ErrorObject, FuncKeywordDefinition } from 'ajv'
import { JSONSchema7, JSONSchema7Definition } from 'json-schema'
import { cloneDeep, get, merge } from 'lodash'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ChangeEvent, RefObject, useEffect, useRef, useState } from 'react'

import { StepData } from '../components/forms/types/TransformedFormData'
import logger from './logger'

export type JsonSchemaPropertyTree = JsonSchemaPropertyTreeInterface | undefined
export interface JsonSchemaPropertyTreeInterface {
  [key: string]: JsonSchemaPropertyTree
}

export type JsonSchema = JSONSchema7Definition
interface JsonSchemaProperties {
  [key: string]: JSONSchema7Definition
}

export type JsonSchemaExtraProperty = JSONSchema7Definition & { isConditional?: boolean }
export interface JsonSchemaExtraProperties {
  [key: string]: JsonSchemaExtraProperty
  isConditional?: boolean
}

export const getAllPossibleJsonSchemaProperties = (
  jsonSchema?: JsonSchema,
): JsonSchemaProperties => {
  if (!jsonSchema || jsonSchema === true) {
    return {}
  }

  const properties: JsonSchemaProperties = {}
  if (jsonSchema.properties) {
    Object.assign(properties, { ...jsonSchema.properties })
  }

  if (jsonSchema.if && jsonSchema.then) {
    Object.assign(properties, getAllPossibleJsonSchemaProperties(jsonSchema.then))
  }
  if (jsonSchema.if && jsonSchema.else) {
    Object.assign(properties, getAllPossibleJsonSchemaProperties(jsonSchema.else))
  }

  jsonSchema?.allOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaProperties(s))
  })

  jsonSchema?.oneOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaProperties(s))
  })

  jsonSchema?.anyOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaProperties(s))
  })

  return properties
}

export const getAllPossibleJsonSchemaExtraProperties = (
  jsonSchema?: JsonSchema,
  isConditional?: boolean,
): JsonSchemaExtraProperties => {
  // same function as getAllPossibleJsonSchemaProperties but I need extra info if property is conditional
  // dont want to broke function getAllPossibleJsonSchemaProperties which is used on different places
  // TODO: simplify it together with getAllPossibleJsonSchemaProperties and do CLEAN CODE
  if (!jsonSchema || jsonSchema === true) {
    return {}
  }

  const properties: JsonSchemaProperties = {}
  if (jsonSchema.properties) {
    const newProperties = {}
    Object.entries(jsonSchema.properties).forEach(([key, value]) => {
      const newValue = typeof value !== 'boolean' ? { ...value, isConditional } : value
      Object.assign(newProperties, { [key]: newValue })
    })
    Object.assign(properties, newProperties)
  }

  if (jsonSchema.if && jsonSchema.then) {
    Object.assign(properties, getAllPossibleJsonSchemaExtraProperties(jsonSchema.then, true))
  }
  if (jsonSchema.if && jsonSchema.else) {
    Object.assign(properties, getAllPossibleJsonSchemaExtraProperties(jsonSchema.else, true))
  }

  jsonSchema?.allOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaExtraProperties(s, isConditional))
  })

  jsonSchema?.oneOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaExtraProperties(s, isConditional))
  })

  jsonSchema?.anyOf?.forEach((s) => {
    Object.assign(properties, getAllPossibleJsonSchemaExtraProperties(s, isConditional))
  })

  return properties
}

export const getJsonSchemaPropertyTree = (jsonSchema?: JsonSchema): JsonSchemaPropertyTree => {
  const properties = getAllPossibleJsonSchemaProperties(jsonSchema)
  const propertiesEntries = Object.entries(properties)

  if (propertiesEntries.length === 0) {
    return undefined
  }

  const result = propertiesEntries.map(([key, value]: [string, JSONSchema7]) => {
    return { [key]: getJsonSchemaPropertyTree(value) }
  })

  return Object.assign({}, ...result) as JsonSchemaPropertyTree
}

export const mergePropertyTreeToFormData = (
  formData: RJSFSchema,
  tree: JsonSchemaPropertyTree,
): RJSFSchema => {
  if (!tree || Array.isArray(formData)) return formData
  const newFormData: RJSFSchema = formData ? { ...formData } : ({} as RJSFSchema)

  Object.entries(tree).forEach(([key, value]: [string, JsonSchemaPropertyTree]) => {
    if (key in newFormData) {
      const property: RJSFSchema = newFormData[key]
      const merged = mergePropertyTreeToFormData(property, value)
      Object.assign(newFormData, { [key]: merged })
    } else {
      Object.assign(newFormData, { [key]: value })
    }
  })

  return newFormData
}

export const buildRJSFError = (path: string[], errorMsg: string | undefined): ErrorSchema => {
  return path.reduceRight(
    (memo: object, arrayValue: string) => {
      const error: ErrorSchema = {}
      error[arrayValue] = memo
      return error
    },
    { __errors: [errorMsg || 'error'] },
  ) as ErrorSchema
}

export const exampleAsyncValidation = (
  schema: AnySchemaObject,
  value: unknown,
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(!!value), 500)
  })
}

export interface KeywordDefinition extends FuncKeywordDefinition {
  validate?: (
    schema: AnySchemaObject,
    value: unknown,
    parentSchema?: AnySchemaObject,
  ) => boolean | Promise<boolean>
}

export const ajvKeywords: KeywordDefinition[] = [
  {
    keyword: 'isExampleAsyncValidation',
    async: true,
    type: 'string',
    validate: exampleAsyncValidation,
  },
  {
    keyword: 'example',
  },
  {
    keyword: 'timeFromTo',
  },
  {
    keyword: 'dateFromTo',
  },
  {
    keyword: 'pospID',
  },
  {
    keyword: 'pospVersion',
  },
]

export const ajvFormats = {
  zip: /\b\d{5}\b/,
  time: /^[0-2]\d:[0-5]\d$/,
  ciselnik: () => true,
  file: () => true,
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
    const schemaProperty: any =
      typeof schema.properties[key] === 'boolean' ? {} : schema.properties[key]
    if (
      schema?.properties &&
      schemaProperty &&
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
    const schemaProperty: any =
      typeof schema.properties[key] === 'boolean' ? {} : schema.properties[key]
    if (
      schema?.properties &&
      schemaProperty &&
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

export const customFormats: Record<string, RegExp> = {
  zip: /\b\d{5}\b/,
  time: /^[0-2]\d:[0-5]\d$/,
}
export const validator: ValidatorType = customizeValidator({
  customFormats,
  ajvOptionsOverrides: { keywords: ajvKeywords },
})

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

interface Callbacks {
  onStepSumbit?: (formData: any) => Promise<void>
  onInit?: () => Promise<any>
}

export const getInitFormData = (schema: RJSFSchema): RJSFSchema => {
  const formData: RJSFSchema = {}

  schema?.allOf.forEach((step) => {
    if (typeof step !== 'boolean') {
      const stepFormData = getDefaultFormState(validator, step, formData, schema, true)
      Object.assign(formData, stepFormData)
    }
  })

  return formData
}

export const createTestFormData = (formData: RJSFSchema): RJSFSchema => {
  const newFormData: RJSFSchema = {}
  if (!formData || typeof formData === 'boolean') return newFormData

  Object.entries(formData).forEach(([key, value]: [string, RJSFSchema]) => {
    if (typeof value !== 'boolean') {
      if (value === undefined) {
        Object.assign(newFormData, { [key]: null })
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(newFormData, { [key]: createTestFormData(value) })
      } else {
        Object.assign(newFormData, { [key]: value })
      }
    }
  })

  return newFormData
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

interface Callbacks {
  onStepSumbit?: (formData: any) => Promise<void>
  onInit?: () => Promise<any>
}

const updateUploadWidgets = (folderName: string, schema?: JSONSchema7Definition) => {
  if (!schema || typeof schema !== 'object') return

  const isSchemaUploadWidget = (schema.type === 'string' && ['file', 'data-url'].includes(schema.format)) ||
    ( schema.type === 'array' && schema.items &&
      typeof schema.items === 'object' && !Array.isArray(schema.items) &&
      schema.items.type === 'string' && ['file', 'data-url'].includes(schema.items.format) )

  if (Array.isArray(schema)) {
    schema.forEach((property: JSONSchema7Definition) => updateUploadWidgets(folderName, property))
  } else if (isSchemaUploadWidget ) {
    Object.assign(schema, { folder: folderName })
  } else {
    Object.values(schema).forEach((value: JSONSchema7Definition) => {
      updateUploadWidgets(folderName, value)
    })
  }
}

const updateUploadWidgetsInSchema = (schema: RJSFSchema, formId?: string) => {
  if (!formId) return

  const folderName = `/${String(schema.pospID)}/${formId}`

  schema.allOf.forEach(step => {
    updateUploadWidgets(folderName, step)
  })
}


// TODO prevent unmounting
// TODO persist state for session
// TODO figure out if we need to step over uiSchemas, or having a single one is enough (seems like it is for now)
export const useFormStepper = (eformSlug: string, eform: EFormValue, callbacks: Callbacks, formId?: string) => {
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
    updateUploadWidgetsInSchema(schema, formId)
  }, [schema, formId])

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

export const useFormFiller = (eform: EFormValue) => {
  const [formId, setFormId] = useState<string | undefined>()

  const { getAccessToken } = useAccount()
  const [openSnackbarWarning] = useSnackbar({ variant: 'warning' })
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const { t } = useTranslation('forms')

  const updateFormData = async (formData: any) => {
    const token = await getAccessToken()
    if (!formId || !token) {
      return
    }

    try {
      await updateForm(token, formId, { formDataJson: formData })
    } catch (error) {
      openSnackbarWarning(t('errors.form_update'))
    }
  }

  const router = useRouter()
  const initFormData = async (): Promise<RJSFSchema> => {
    let formData: RJSFSchema
    const token = await getAccessToken()
    if (!token) {
      return undefined
    }

    const queryId =
      router.query.id && typeof router.query.id === 'string' ? router.query.id : undefined
    try {
      if (queryId) {
        const { formDataJson, id }: FormDto = await getForm(token, queryId)
        setFormId(id)
        formData = formDataJson
      } else {
        const { id }: FormDto = await createForm(token, {
          pospID: eform.schema.pospID,
          pospVersion: eform.schema.pospVersion,
          messageSubject: eform.schema.pospID,
          isSigned: false,
          formName: eform.schema.title || eform.schema.pospID,
          fromDescription: eform.schema.description || eform.schema.pospID,
        })
        setFormId(id)
      }
    } catch (error) {
      openSnackbarError(t('errors.form_init'))
    }
    return formData
  }

  return {
    initFormData,
    updateFormData,
    formId
  }
}

export const useFormSubmitter = (slug: string) => {
  const [errors, setErrors] = useState<Array<ErrorObject | string>>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { t } = useTranslation('forms')

  const submitForm = async (formData: RJSFSchema) => {
    try {
      // TODO do something more with the result then just showing success
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await submitEform(slug, formData)
      setErrors([])
      setSuccessMessage(t('success'))
    } catch (error) {
      logger.error(error)
      if (error instanceof ApiError) {
        setErrors(error.errors)
        logger.warn('Form api errors', error.errors)
      } else if (error instanceof Error) {
        logger.warn('Form non-api errors', error?.message)
        setErrors([t([`errors.${error?.message}`, 'errors.unknown'])])
      } else {
        logger.error('Form unknown error', error)
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
