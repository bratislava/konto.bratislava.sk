import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import { JSONSchema7 } from 'json-schema'
import pick from 'lodash/pick'
import { useTranslation } from 'next-i18next'
import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react'

import { InitialFormData } from '../../frontend/types/initialFormData'
import { getFileUuidsNaive } from '../../frontend/utils/form'
import {
  getEvaluatedStepsSchemas,
  getStepperData,
  getStepProperty,
  parseStepFromFieldId,
} from '../../frontend/utils/formState'
import { isDefined } from '../../frontend/utils/general'
import { FormStepIndex, FormStepperStep } from './types/Steps'
import { useFormFileUpload } from './useFormFileUpload'

type SkipModal =
  | { open: true; skipAllowed: false; onSkip: () => void; onClose: () => void }
  | { open: false; skipAllowed: boolean }

interface FormState {
  schema: RJSFSchema
  uiSchema: UiSchema
  formId: string
  formSlug: string
  formData: GenericObjectType
  skipModal: SkipModal
  stepperData: FormStepperStep[]
  currentStepperStep: FormStepperStep
  currentStepSchema: JSONSchema7 | null
  skipToStep: (newIndex: FormStepIndex) => void
  canGoToPreviousStep: boolean
  goToPreviousStep: () => void
  canGoToNextStep: boolean
  goToNextStep: () => void
  skipToNextStep: () => void
  handleFormOnChange: (newFormData: GenericObjectType | undefined) => void
  handleFormOnSubmit: (newFormData: GenericObjectType | undefined) => void
  goToStepByFieldId: (fieldId: string) => void
  setImportedFormData: (importedFormData: RJSFSchema) => void
}

const FormStateContext = createContext<FormState | undefined>(undefined)

interface FormStateProviderProps {
  schema: RJSFSchema
  uiSchema: UiSchema
  formSlug: string
  initialFormData: InitialFormData
}

export const FormStateProvider = ({
  schema,
  uiSchema,
  formSlug,
  initialFormData,
  children,
}: PropsWithChildren<FormStateProviderProps>) => {
  const { t } = useTranslation('forms')
  const { keepFiles, refetchAfterImportIfNeeded } = useFormFileUpload()

  const [stepIndex, setStepIndex] = useState<FormStepIndex>(0)
  const [formData, setFormData] = useState<GenericObjectType>(initialFormData.formDataJson)

  const [skipModal, setSkipModal] = useState<SkipModal>({ open: false, skipAllowed: false })

  const [submittedStepsIndexes, setSubmittedStepsIndexes] = useState<Set<number>>(new Set())

  const stepsSchemas = useMemo(() => getEvaluatedStepsSchemas(schema, formData), [schema, formData])

  const stepperData = useMemo(
    () => getStepperData(stepsSchemas, submittedStepsIndexes, t('summary')),
    [stepsSchemas, submittedStepsIndexes, t],
  )

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentStepperStep = stepperData.find((step) => step.index === stepIndex)!

  const currentStepSchema = stepIndex === 'summary' ? null : stepsSchemas[stepIndex]

  const goToStep = (newIndex: FormStepIndex) => {
    if (stepsSchemas[newIndex] !== null || newIndex === 'summary') {
      setStepIndex(newIndex)
    }
  }

  const skipToStep = (newStepIndex: FormStepIndex) => {
    if (stepIndex === newStepIndex) {
      return
    }
    const isSubmittedStep = stepperData.find((step) => step.index === newStepIndex)?.isSubmitted

    if (!isSubmittedStep && !skipModal.skipAllowed) {
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

  const getPreviousStep = () => {
    const prevSteps = stepsSchemas.slice(0, stepIndex !== 'summary' ? stepIndex : 0).reverse()
    const prevStepIndex = prevSteps.findIndex((step) => step != null)
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
    const nextSteps = stepsSchemas.slice(stepIndex + 1)
    const nextStepIndex = nextSteps.findIndex((step) => step != null)
    return nextStepIndex !== -1 ? stepIndex + nextStepIndex + 1 : 'summary'
  }

  const canGoToNextStep = getNextStep() !== null

  const goToNextStep = () => {
    const nextStepIndex = getNextStep()
    if (nextStepIndex !== null) {
      goToStep(nextStepIndex)
    }
  }

  const skipToNextStep = () => {
    const nextStepIndex = getNextStep()
    if (nextStepIndex !== null) {
      skipToStep(nextStepIndex)
    }
  }

  // TODO: Add explanation
  const setStepFormData = (stepFormData: GenericObjectType) => {
    const newData = { ...formData, ...stepFormData }
    const evaluatedSchemas = getEvaluatedStepsSchemas(schema, newData)
    const propertiesToKeep = evaluatedSchemas
      .filter(isDefined)
      .map((innerSchema) => innerSchema.properties && Object.keys(innerSchema.properties)[0])
      .filter(isDefined)
    const pickedPropertiesData = pick(newData, propertiesToKeep)

    const fileUuids = getFileUuidsNaive(pickedPropertiesData)
    keepFiles(fileUuids)

    setFormData(pickedPropertiesData)
  }

  const setImportedFormData = (importedFormData: GenericObjectType) => {
    const evaluatedSchemas = getEvaluatedStepsSchemas(schema, importedFormData)

    const propertiesToKeep = evaluatedSchemas
      .filter(isDefined)
      .map((innerSchema) => innerSchema.properties && Object.keys(innerSchema.properties)[0])
      .filter(isDefined)
    const pickedPropertiesData = pick(importedFormData, propertiesToKeep)

    if (stepIndex !== 'summary' && evaluatedSchemas[stepIndex] == null) {
      setStepIndex(0)
    }

    const fileUuids = getFileUuidsNaive(pickedPropertiesData)
    refetchAfterImportIfNeeded(fileUuids)
    setSubmittedStepsIndexes(new Set())

    setFormData(pickedPropertiesData)
  }

  const handleFormOnChange = (newFormData: GenericObjectType | undefined) => {
    if (stepIndex === 'summary' || !newFormData) {
      return
    }

    setSubmittedStepsIndexes((prev) => {
      const newSet = new Set(prev)
      newSet.delete(stepIndex)
      return newSet
    })

    setStepFormData(newFormData)
  }
  const handleFormOnSubmit = (newFormData: GenericObjectType | undefined) => {
    if (stepIndex === 'summary' || !newFormData) {
      return
    }

    setSubmittedStepsIndexes((prev) => new Set([...prev, stepIndex]))
    setStepFormData(newFormData)
    goToNextStep()
  }

  const goToStepByFieldId = (fieldId: string) => {
    const stepId = parseStepFromFieldId(fieldId)
    if (!stepId) return

    const index = stepsSchemas.findIndex((step) => getStepProperty(step) === stepId)

    goToStep(index)
  }

  const context = {
    schema,
    uiSchema,
    formId: initialFormData.formId,
    formSlug,
    formData,
    skipModal,
    stepperData,
    currentStepperStep,
    currentStepSchema,
    skipToStep,
    canGoToPreviousStep,
    goToPreviousStep,
    canGoToNextStep,
    goToNextStep,
    skipToNextStep,
    handleFormOnChange,
    handleFormOnSubmit,
    goToStepByFieldId,
    setImportedFormData,
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
