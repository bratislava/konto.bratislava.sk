import {
  ErrorSchema,
  mergeDefaultsWithFormData,
  mergeObjects,
  RJSFSchema,
  RJSFValidationError,
} from '@rjsf/utils'
import { cloneDeep } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { InitialFormData } from '../../frontend/types/initialFormData'
import {
  getAllStepData,
  getInitFormData,
  getValidatedSteps,
} from '../../frontend/utils/formStepper'
import { StepData } from './types/TransformedFormData'

type SkipModal = { open: true; onSkip: () => void; onClose: () => void } | { open: false }

interface FormState {
  stepIndex: number
  setStepIndex: (newIndex: number) => void
  formSlug: string
  formData: RJSFSchema
  stepTitle: string
  setStepFormData: (stepFormData: RJSFSchema) => void
  setImportedFormData: (importedFormData: RJSFSchema) => void
  errors: RJSFValidationError[][]
  extraErrors: ErrorSchema
  stepData: StepData[]
  validatedSchema: RJSFSchema & { allOf: RJSFSchema[] }
  canGoToPreviousStep: boolean
  goToPreviousStep: () => void
  skipStep: () => void
  canGoToNextStep: boolean
  goToNextStep: () => void
  skipToStep: (newNextStepIndex: number) => void
  handleOnSubmit: (newFormData: RJSFSchema) => Promise<void>
  handleOnErrors: (newErrors: RJSFValidationError[]) => void
  currentSchema: RJSFSchema
  isComplete: boolean
  skipModal: SkipModal
}

const FormStateContext = createContext<FormState | undefined>(undefined)

interface FormStateProviderProps {
  formSlug: string
  schema: RJSFSchema
  initialFormData: InitialFormData
}

export const FormStateProvider = ({
  schema,
  formSlug,
  initialFormData,
  children,
}: PropsWithChildren<FormStateProviderProps>) => {
  // main state variables with the most important info
  const [stepIndex, setStepIndex] = useState<number>(0)
  const [formData, setFormData] = useState<RJSFSchema>(initialFormData.formDataJson)
  const [errors, setErrors] = useState<Record<string, RJSFValidationError[]>>({})
  const [extraErrors, setExtraErrors] = useState<ErrorSchema>({})

  const [skipAllowed, setSkipAllowed] = useState(false)
  const [skipModal, setSkipModal] = useState<SkipModal>({ open: false })

  const steps = useMemo(() => {
    return getValidatedSteps(schema, formData)
  }, [schema, formData])

  // state variables with info about steps for summary and stepper
  // const [steps, setSteps] = useState<RJSFSchema[]>(getValidatedSteps(schema, formData))
  console.log('schema', schema)
  console.log('steps', steps)
  // const validateSteps = () => {
  //   const newValidatedSteps = getValidatedSteps(schema, formData)
  //   setSteps(newValidatedSteps)
  // }
  const stepData = useMemo(() => {
    return getAllStepData(steps)
  }, [steps])
  // const [stepData, setStepData] = useState<StepData[]>(getAllStepData(steps))

  // side info about steps
  const stepsLength: number = steps?.length ?? -1
  const isComplete = stepIndex === stepsLength
  const currentSchema = steps ? cloneDeep(steps[stepIndex]) : {}

  // useEffect(() => {
  //   // stepIndex allowed to climb one step above the length of steps - i.e. to render a final overview or other custom components but still allow to return back
  //   if (stepIndex > stepsLength) {
  //     // stepIndex larger than last step index + 1
  //     setStepIndex(stepsLength)
  //   }
  // }, [stepIndex, steps, stepsLength])

  useEffect(() => window.scrollTo(0, 0), [stepIndex])

  const changeStepData = (targetIndex: number, value: boolean): void => {
    // change isFilled state for last stepData
    const newStepData: StepData[] = stepData.map((step: StepData, index: number) =>
      index === targetIndex ? { ...step, isFilled: value } : { ...step },
    )
    // setStepData(newStepData)
  }

  // const validate = async (): Promise<boolean> => {
  //   // validate submitted form step
  //   let isValid = formRef?.current?.validateForm() ?? false
  //
  //   if (schema.$async === true) {
  //     const newExtraErrors = await validateAsyncProperties(currentSchema, formData, [])
  //     isValid = isValid && Object.keys(newExtraErrors).length === 0
  //     const currentStepKey = currentSchema.properties
  //       ? Object.keys(currentSchema.properties)[0]
  //       : null
  //     if (currentStepKey && !(currentStepKey in newExtraErrors)) {
  //       const updatedExtraErrors = { ...extraErrors }
  //       delete updatedExtraErrors[currentStepKey]
  //       setExtraErrors(updatedExtraErrors)
  //     } else {
  //       setExtraErrors({ ...extraErrors, ...newExtraErrors })
  //     }
  //   }
  //
  //   return isValid
  // }

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

  const canGoToPreviousStep = stepIndex > 0
  const goToPreviousStep = () => {
    if (!canGoToPreviousStep) return

    setStepIndex(stepIndex - 1)
  }

  const skipToStep = (newStepIndex: number) => {
    if (!skipAllowed) {
      setSkipModal({
        open: true,
        onSkip: () => {
          setSkipAllowed(true)
          setSkipModal({ open: false })
          setStepIndex(newStepIndex)
        },
        onClose: () => {
          setSkipModal({ open: false })
        },
      })

      return
    }

    setStepIndex(newStepIndex)
  }

  const skipStep = () => {
    skipToStep(stepIndex + 1)
  }

  const canGoToNextStep = true // TODO: Implement
  const goToNextStep = () => {
    if (!canGoToNextStep) return
    // todo: implement
    // if go next step, just validate steps (show/hide conditional steps) and got to next step
    // validateSteps()
    setStepIndex(stepIndex + 1)
  }

  // const jumpToStep = () => {
  //   // jump through multiple steps
  //   if (nextStepIndex != null) {
  //     // need to save nextStep, because after next step validation (conditional steps), we must jump to our original chosen step
  //     setNextStep(steps[nextStepIndex])
  //   }
  // }

  // useEffect(() => {
  //   if ((nextStepIndex != null && nextStep != null) || nextStepIndex === steps.length) {
  //     // when we save nextStep, we will validate all (conditional) steps
  //     validateSteps()
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [nextStep])
  //
  // useEffect(() => {
  //   // after (conditional) steps are validated, do actions
  //   if (nextStepIndex != null && nextStep != null) {
  //     // find saved next step and find it in new list of steps after validation
  //     const newNextStepIndex: number = steps.findIndex(
  //       (step: RJSFSchema) => JSON.stringify(step) === JSON.stringify(nextStep),
  //     )
  //     const realNextStepIndex: number = newNextStepIndex >= 0 ? newNextStepIndex : nextStepIndex
  //     setStepIndex(realNextStepIndex)
  //     setNextStepIndex(null)
  //     setNextStep(null)
  //   } else if (nextStepIndex != null && nextStep === undefined) {
  //     // if nextStep is undefined, it means we are going to Summary
  //     setStepIndex(steps.length)
  //     setNextStepIndex(null)
  //     setNextStep(null)
  //   }
  //   setStepData(getAllStepData(steps, stepData))
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [steps])

  //
  // useEffect(() => {
  //   // need to handle skipping with submitting and validating (skip step means do submitting and validating but always go to next step)
  //   if (isSkipEnabled) {
  //     if (isComplete) {
  //       // if we are in Summary and want to jump to any step
  //       jumpToStep()
  //       disableSkip()
  //     } else {
  //       // if we are in any other step (not Summary), we will submit Step
  //       submitStep()
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isSkipEnabled])

  // TODO: could be reduced by wrapping nextStepIndex and isSkipEnabled to 1 object
  // useEffect(() => {
  //   // this is needed for skipping multiple steps through Stepper
  //   // we must save it because we are going to submit step even if we are skipping it
  //   if (nextStepIndex != null) {
  //     setIsSkipEnabled(true)
  //   }
  // }, [nextStepIndex])

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

  // const updateFormData = async () => {
  //   const token = await getAccessTokenOrLogout()
  //   if (!initialFormData || !token) {
  //     return
  //   }
  //
  //   try {
  //     await formsApi.nasesControllerUpdateForm(
  //       initialFormData.formId,
  //       /// TS2345: Argument of type '{ formDataJson: string; }' is not assignable to parameter of type 'UpdateFormRequestDto'.
  //       // Type '{ formDataXml: string; }' is missing the following properties from type 'UpdateFormRequestDto': 'email', 'formDataXml', 'pospVersion', 'messageSubject
  //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //       // @ts-expect-error
  //       {
  //         formDataJson: formData,
  //       },
  //       { accessToken: token },
  //     )
  //   } catch (error) {
  //     openSnackbarWarning(t('errors.form_update'))
  //   }
  // }

  const handleOnSubmit = async (newFormData: RJSFSchema) => {
    goToNextStep()
    // handles onSubmit event of form step
    // it is called also if we are going to skip step by 1
    setStepFormData(newFormData)
  }

  const handleOnErrors = (newErrors: RJSFValidationError[]) => {
    // handles onErrors event of form step
    // it is called also if we are going to skip step by 1
    // setUniqueErrors(newErrors, stepIndex)
    // if (isSkipEnabled) {
    //   changeStepData(stepIndex, false)
    //   jumpToStep()
    //   disableSkip()
    // }
  }

  const context = {
    stepIndex,
    setStepIndex,
    formSlug,
    formData,
    stepTitle: stepData[stepIndex]?.title || stepData[stepIndex]?.stepKey || '',
    setStepFormData,
    // TODO: Rework
    setImportedFormData: setFormData,
    errors: transformErrorsToArray(),
    extraErrors,
    stepData,
    validatedSchema: { ...schema, allOf: [...steps] },
    canGoToPreviousStep,
    goToPreviousStep,
    skipStep,
    canGoToNextStep,
    goToNextStep,
    skipToStep,
    handleOnSubmit,
    handleOnErrors,
    currentSchema,
    isComplete,
    skipModal,
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
