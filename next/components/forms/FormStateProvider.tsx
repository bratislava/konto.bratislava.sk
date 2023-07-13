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
  const [stepIndex, setStepIndex] = useState<number>(0)
  const [formData, setFormData] = useState<RJSFSchema>(initialFormData.formDataJson)

  const [skipAllowed, setSkipAllowed] = useState(false)
  const [skipModal, setSkipModal] = useState<SkipModal>({ open: false })

  const steps = useMemo(() => {
    return getValidatedSteps(schema, formData)
  }, [schema, formData])

  console.log(steps)

  const stepData = useMemo(() => {
    return getAllStepData(steps)
  }, [steps])

  const validatedSchema = useMemo(() => ({ ...schema, allOf: [...steps] }), [schema, steps])

  // side info about steps
  const currentSchema = steps[stepIndex]

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

  const setStepFormData = (stepFormData: RJSFSchema) => {
    // save formData for step with all properties including conditional fields and unfilled fields
    const initStepDefaultData: RJSFSchema = getInitFormData(currentSchema)
    const fullStepFormData: RJSFSchema | undefined = mergeDefaultsWithFormData(
      initStepDefaultData,
      stepFormData,
    )
    if (!fullStepFormData) return
    const mergedFormData: RJSFSchema = mergeObjects(formData, fullStepFormData)
    console.log('mergedFormData - setStepFormData', mergedFormData)
    setFormData(mergedFormData)
  }

  const { t } = useTranslation('forms')

  const handleOnSubmit = async (newFormData: RJSFSchema) => {
    goToNextStep()
    // handles onSubmit event of form step
    // it is called also if we are going to skip step by 1
    setStepFormData(newFormData)
  }

  const handleOnErrors = (newErrors: RJSFValidationError[]) => {}

  const context = {
    stepIndex,
    setStepIndex,
    formSlug,
    formData,
    stepTitle: stepData[stepIndex]?.title || stepData[stepIndex]?.stepKey || '',
    setStepFormData,
    // TODO: Rework
    setImportedFormData: setFormData,
    errors: [],
    // TODO extra errors
    extraErrors: {},
    stepData,
    validatedSchema,
    canGoToPreviousStep,
    goToPreviousStep,
    skipStep,
    canGoToNextStep,
    goToNextStep,
    skipToStep,
    handleOnSubmit,
    handleOnErrors,
    currentSchema,
    isComplete: false,
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
