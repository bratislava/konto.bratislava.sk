import { ErrorSchema, GenericObjectType, RJSFSchema, RJSFValidationError } from '@rjsf/utils'
import { useTranslation } from 'next-i18next'
import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react'

import { InitialFormData } from '../../frontend/types/initialFormData'
import { getAllStepData, getValidatedSteps } from '../../frontend/utils/formStepper'
import { StepData } from './types/TransformedFormData'

type SkipModal =
  | { open: true; skipAllowed: false; onSkip: () => void; onClose: () => void }
  | { open: false; skipAllowed: boolean }

interface FormState {
  stepIndex: number | 'summary'
  formSlug: string
  formData: RJSFSchema
  setImportedFormData: (importedFormData: RJSFSchema) => void
  errors: RJSFValidationError[][]
  extraErrors: ErrorSchema
  stepData: StepData[]
  currentStepData: StepData
  validatedSchema: RJSFSchema & { allOf: RJSFSchema[] }
  // goToStep: (newIndex: number | 'summary') => void
  canGoToPreviousStep: boolean
  goToPreviousStep: () => void
  canGoToNextStep: boolean
  goToNextStep: () => void
  skipToNextStep: () => void
  skipToStep: (newIndex: number | 'summary') => void
  handleOnChange: (newFormData: RJSFSchema) => void
  handleOnSubmit: (newFormData: RJSFSchema) => void
  handleOnErrors: (newErrors: RJSFValidationError[]) => void
  currentSchema: RJSFSchema
  skipModal: SkipModal
  goToStepOfField: (fieldId: string) => void
}

const FormStateContext = createContext<FormState | undefined>(undefined)

interface FormStateProviderProps {
  formSlug: string
  schema: RJSFSchema
  initialFormData: InitialFormData
}

const parseFieldId = (fieldId: string) => {
  const arr = fieldId.split('_')
  if (arr[0] === 'root' && arr[1]) {
    return arr[1]
  }
  return null
}

export const FormStateProvider = ({
  schema,
  formSlug,
  initialFormData,
  children,
}: PropsWithChildren<FormStateProviderProps>) => {
  const { t } = useTranslation('forms')

  const [stepIndex, setStepIndex] = useState<number | 'summary'>(0)
  const [formData, setFormData] = useState<GenericObjectType>(initialFormData.formDataJson)

  const [skipModal, setSkipModal] = useState<SkipModal>({ open: false, skipAllowed: false })

  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set())

  const steps = useMemo(() => {
    return getValidatedSteps(schema, formData)
  }, [schema, formData])

  // console.log('steps', steps)

  const stepData = useMemo(() => {
    return getAllStepData(steps, submittedSteps, t('summary'))
  }, [steps, submittedSteps, t])

  const currentStepData = stepData.find((step) => step.index === stepIndex)!

  const validatedSchema = useMemo(() => ({ ...schema, allOf: [...steps] }), [schema, steps])

  // side info about steps
  const currentSchema = steps[stepIndex]

  const goToStep = (newIndex: number | 'summary') => {
    if (steps[newIndex] !== null || newIndex === 'summary') {
      setStepIndex(newIndex)
    }
  }

  const getPreviousStep = () => {
    const prevSteps = steps.slice(0, stepIndex !== 'summary' ? stepIndex : 0).reverse()
    const prevStepIndex = prevSteps.findIndex((step) => Object.keys(step).length > 0)
    return prevStepIndex !== -1 ? prevSteps.length - prevStepIndex - 1 : null
  }

  const canGoToPreviousStep = getPreviousStep() !== null

  const goToPreviousStep = () => {
    const prevStepIndex = getPreviousStep()
    if (prevStepIndex !== null) {
      goToStep(prevStepIndex)
    }
  }

  const getNextStep = () => {
    if (stepIndex === 'summary') return null
    const nextSteps = steps.slice(stepIndex + 1)
    const nextStepIndex = nextSteps.findIndex((step) => Object.keys(step).length > 0)
    return nextStepIndex !== -1 ? stepIndex + nextStepIndex + 1 : 'summary'
  }

  const canGoToNextStep = getNextStep() !== null

  const goToNextStep = () => {
    const nextStepIndex = getNextStep()
    if (nextStepIndex !== null) {
      goToStep(nextStepIndex)
    }
  }

  const skipToStep = (newStepIndex: number | 'summary') => {
    if (stepIndex === newStepIndex) {
      return
    }
    const isFilledStep = stepData.find((step) => step.index === newStepIndex)?.isFilled

    if (!isFilledStep && !skipModal.skipAllowed) {
      setSkipModal({
        open: true,
        skipAllowed: skipModal.skipAllowed,
        onSkip: () => {
          setSkipModal({ open: false, skipAllowed: true })
          goToStep(newStepIndex)
        },
        onClose: () => {
          setSkipModal((value) => ({ open: false, skipAllowed: value.skipAllowed }))
        },
      })

      return
    }

    goToStep(newStepIndex)
  }

  const skipToNextStep = () => {
    const nextStepIndex = getNextStep()
    if (nextStepIndex !== null) {
      skipToStep(nextStepIndex)
    }
  }

  const setStepFormData = (stepFormData: RJSFSchema) => {
    console.log('setStepFormData', formData, stepFormData)
    setFormData({ ...formData, ...stepFormData })
  }

  const handleOnChange = (newFormData: RJSFSchema) => {
    if (stepIndex === 'summary') {
      return
    }

    setSubmittedSteps((prev) => {
      const newSet = new Set(prev)
      newSet.delete(stepIndex)
      return newSet
    })

    setStepFormData(newFormData)
  }
  const handleOnSubmit = (newFormData: RJSFSchema) => {
    if (stepIndex === 'summary') {
      return
    }

    setSubmittedSteps((prev) => new Set([...prev, stepIndex]))
    goToNextStep()
    // handles onSubmit event of form step
    // it is called also if we are going to skip step by 1
    setStepFormData(newFormData)
  }

  const goToStepByFieldId = (fieldId: string) => {
    const stepId = parseFieldId(fieldId)
    if (!stepId) return

    const getBlabla = (step: any) => {
      if (!step?.properties) {
        return null
      }
      const keys = Object.keys(step.properties)
      return keys[0] ?? null
    }
    const index = steps.findIndex((step) => getBlabla(step) === stepId)
    goToStep(index)
  }

  const handleOnErrors = (newErrors: RJSFValidationError[]) => {}

  const context = {
    stepIndex,
    formSlug,
    formData,
    // TODO: Rework
    setImportedFormData: setFormData,
    errors: [],
    // TODO extra errors
    extraErrors: {},
    stepData,
    currentStepData,
    validatedSchema,
    canGoToPreviousStep,
    goToPreviousStep,
    canGoToNextStep,
    goToNextStep,
    skipToStep,
    skipToNextStep,
    handleOnChange,
    handleOnSubmit,
    handleOnErrors,
    currentSchema,
    skipModal,
    steps,
    goToStepOfField: goToStepByFieldId,
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
