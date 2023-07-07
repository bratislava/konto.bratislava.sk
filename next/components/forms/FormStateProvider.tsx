import { FormDefinition } from '@backend/forms/types'
import { formsApi } from '@clients/forms'
import Form from '@rjsf/core'
import {
  ErrorSchema,
  mergeDefaultsWithFormData,
  mergeObjects,
  RJSFSchema,
  RJSFValidationError,
} from '@rjsf/utils'
import { getAccessTokenOrLogout } from 'frontend/utils/auth'
import { cloneDeep } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, {
  ChangeEvent,
  createContext,
  PropsWithChildren,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { formDataToXml, xmlStringToPdf, xmlToFormData } from '../../frontend/api/api'
import useSnackbar from '../../frontend/hooks/useSnackbar'
import { readTextFile } from '../../frontend/utils/file'
import {
  getAllStepData,
  getInitFormData,
  getValidatedSteps,
  validateAsyncProperties,
} from '../../frontend/utils/formStepper'
import { blobToString, downloadBlob } from '../../frontend/utils/general'
import { StepData } from './types/TransformedFormData'
import { InitialFormData } from './useFormDataLoader'

interface FormState {
  stepIndex: number
  setStepIndex: (newIndex: number) => void
  formData: RJSFSchema
  stepTitle: string
  setStepFormData: (stepFormData: RJSFSchema) => void
  errors: RJSFValidationError[][]
  extraErrors: ErrorSchema
  stepData: StepData[]
  validatedSchema: RJSFSchema & { allOf: RJSFSchema[] }
  previous: () => void
  next: () => void
  submitStep: () => void
  skipToStep: (newNextStepIndex: number) => void
  handleOnSubmit: (newFormData: RJSFSchema) => Promise<void>
  handleOnErrors: (newErrors: RJSFValidationError[]) => void
  currentSchema: RJSFSchema
  isComplete: boolean
  // TODO: improve type
  formRef: RefObject<Form<any, RJSFSchema, any>>
  exportXml: () => Promise<void>
  importXml: () => void
  exportPdf: () => Promise<void>
}

const FormStateContext = createContext<FormState | undefined>(undefined)

interface FormStateProviderProps {
  eformSlug: string
  formDefinition: FormDefinition
  initialFormData: InitialFormData
}

export const FormStateProvider = ({
  eformSlug,
  formDefinition,
  initialFormData,
  children,
}: PropsWithChildren<FormStateProviderProps>) => {
  const { schema } = formDefinition
  // since Form can be undefined, useRef<Form> is understood as an overload of useRef returning MutableRef, which does not match expected Ref type be rjsf
  // also, our code expects directly RefObject otherwise it will complain of no `.current`
  // this is probably a bug in their typing therefore the cast
  const formRef = useRef<Form>() as RefObject<Form>

  // main state variables with the most important info
  const [stepIndex, setStepIndex] = useState<number>(0)
  const [formData, setFormData] = useState<RJSFSchema>(initialFormData.formDataJson)
  const [errors, setErrors] = useState<Record<string, RJSFValidationError[]>>({})
  const [extraErrors, setExtraErrors] = useState<ErrorSchema>({})
  const [openSnackbarError] = useSnackbar({ variant: 'error' })
  const [openSnackbarSuccess] = useSnackbar({ variant: 'success' })
  const [openSnackbarInfo, closeSnackbarInfo] = useSnackbar({ variant: 'info' })
  const [openSnackbarWarning] = useSnackbar({ variant: 'warning' })

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
      const currentStepKey = currentSchema.properties
        ? Object.keys(currentSchema.properties)[0]
        : null
      if (currentStepKey && !(currentStepKey in newExtraErrors)) {
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
    if (!currentStepKey) return

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
    return stepData.map(({ stepKey }: StepData) =>
      stepKey && stepKey in errors ? errors[stepKey] : [],
    )
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
    const initStepDefaultData: RJSFSchema = getInitFormData(currentSchema)
    const fullStepFormData: RJSFSchema | undefined = mergeDefaultsWithFormData(
      initStepDefaultData,
      stepFormData,
    )
    if (!fullStepFormData) return
    const mergedFormData: RJSFSchema = mergeObjects(formData, fullStepFormData)
    setFormData(mergedFormData)
  }

  const { t } = useTranslation('forms')

  const exportXml = async () => {
    openSnackbarInfo(t('info_messages.xml_export'))
    try {
      const xml: Blob = await formDataToXml(eformSlug, formData)
      const fileName = `${eformSlug}_output.xml`
      downloadBlob(xml, fileName)
      closeSnackbarInfo()
      openSnackbarSuccess(t('success_messages.xml_export'))
    } catch (error) {
      openSnackbarError(t('errors.xml_export'))
    }
  }

  const importXml = async (e: ChangeEvent<HTMLInputElement>) => {
    openSnackbarInfo(t('info_messages.xml_import'))
    try {
      const xmlData: string = await readTextFile(e)
      const transformedFormData: RJSFSchema = await xmlToFormData(eformSlug, xmlData)
      setFormData(transformedFormData)
      closeSnackbarInfo()
      openSnackbarSuccess(t('success_messages.xml_import'))
    } catch (error) {
      openSnackbarError(t('errors.xml_import'))
    }
  }

  const chooseFilesAndImportXml = () => {
    const importInput = document.createElement('input')
    importInput.type = 'file'
    importInput.multiple = false
    importInput.accept = '.xml'

    importInput.addEventListener('change', (e) => {
      if (!importInput.files) return
      const changeEvent = e as unknown as ChangeEvent<HTMLInputElement>
      importXml(changeEvent).catch((error) => console.log('error', error))
    })

    importInput.click()
  }

  const exportPdf = async () => {
    openSnackbarInfo(t('info_messages.pdf_export'))
    try {
      const xml: Blob = await formDataToXml(eformSlug, formData)
      const xmlData: string = await blobToString(xml)
      const pdf = await xmlStringToPdf(eformSlug, xmlData)
      const fileName = `${eformSlug}_output.pdf`
      downloadBlob(pdf, fileName)
      closeSnackbarInfo()
      openSnackbarSuccess(t('success_messages.pdf_export'))
    } catch (error) {
      openSnackbarError(t('errors.pdf_export'))
    }
  }

  const updateFormData = async () => {
    const token = await getAccessTokenOrLogout()
    if (!initialFormData || !token) {
      return
    }

    try {
      await formsApi.nasesControllerUpdateForm(
        initialFormData.formId,
        /// TS2345: Argument of type '{ formDataJson: string; }' is not assignable to parameter of type 'UpdateFormRequestDto'.
        // Type '{ formDataXml: string; }' is missing the following properties from type 'UpdateFormRequestDto': 'email', 'formDataXml', 'pospVersion', 'messageSubject
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        {
          formDataJson: formData,
        },
        { accessToken: token },
      )
    } catch (error) {
      openSnackbarWarning(t('errors.form_update'))
    }
  }

  const handleOnSubmit = async (newFormData: RJSFSchema) => {
    // handles onSubmit event of form step
    // it is called also if we are going to skip step by 1
    setStepFormData(newFormData)
    const isFormValid = await validate()

    if (isFormValid) {
      await updateFormData()
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

  const context = {
    stepIndex,
    setStepIndex,
    formData,
    stepTitle: stepData[stepIndex]?.title || stepData[stepIndex]?.stepKey || '',
    setStepFormData,
    errors: transformErrorsToArray(),
    extraErrors,
    stepData,
    validatedSchema: { ...schema, allOf: [...steps] },
    previous,
    next,
    submitStep,
    skipToStep,
    handleOnSubmit,
    handleOnErrors,
    currentSchema,
    isComplete,
    formRef,
    exportXml,
    importXml: chooseFilesAndImportXml,
    exportPdf,
  }

  return <FormStateContext.Provider value={context}>{children}</FormStateContext.Provider>
}

export const useFormState = (): FormState => {
  const context = useContext<FormState | undefined>(FormStateContext)
  if (!context) {
    throw new Error('useFormState must be used within a FormStateProvider')
  }
  return context
}
