import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react'

import { InitialFormData } from '../../frontend/types/initialFormData'
import { getFileUuidsNaive } from '../../frontend/utils/form'
import {
  getEvaluatedStepsSchemas,
  getFirstNonEmptyStepIndex,
  getStepperData,
  getStepProperty,
  parseStepFromFieldId,
  removeUnusedPropertiesFromFormData,
  useStepIndex,
} from '../../frontend/utils/formState'
import { FormStepIndex } from './types/Steps'
import { useFormFileUpload } from './useFormFileUpload'
import { useFormLeaveProtection } from './useFormLeaveProtection'

type SkipModal = {
  open: boolean
  skipAllowed: boolean
  onSkip: () => void
  onOpenChange: (value: boolean) => void
}

interface FormStateProviderProps {
  schema: RJSFSchema
  uiSchema: UiSchema
  formSlug: string
  initialFormData: InitialFormData
}

const useGetContext = ({ schema, uiSchema, formSlug, initialFormData }: FormStateProviderProps) => {
  const { query } = useRouter()
  const { t } = useTranslation('forms')
  const { keepFiles, refetchAfterImportIfNeeded } = useFormFileUpload()
  const { turnOnLeaveProtection } = useFormLeaveProtection()

  const [formData, setFormData] = useState<GenericObjectType>(initialFormData.formDataJson)
  const stepsSchemas = useMemo(() => getEvaluatedStepsSchemas(schema, formData), [schema, formData])

  const [currentStepIndex, setCurrentStepIndex] = useStepIndex(
    initialFormData.formId,
    formSlug,
    query,
    stepsSchemas,
  )

  const [skipModal, setSkipModal] = useState<SkipModal>({
    open: false,
    skipAllowed: false,
    onOpenChange: () => {},
    onSkip: () => {},
  })

  /**
   * This set holds indexes of steps that have been submitted (submit button has been pressed, which means they have been validated).
   * A condition in different step might invalidate the step, but it is not easily detectable.
   */
  const [submittedStepsIndexes, setSubmittedStepsIndexes] = useState<Set<number>>(new Set())

  const stepperData = useMemo(
    () => getStepperData(stepsSchemas, submittedStepsIndexes, t('summary.title')),
    [stepsSchemas, submittedStepsIndexes, t],
  )

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentStepperStep = stepperData.find((step) => step.index === currentStepIndex)!

  const currentStepSchema = currentStepIndex === 'summary' ? null : stepsSchemas[currentStepIndex]

  const goToStep = (newIndex: FormStepIndex) => {
    if (stepsSchemas[newIndex] !== null || newIndex === 'summary') {
      setCurrentStepIndex(newIndex)
    }
  }

  const skipToStep = (newStepIndex: FormStepIndex) => {
    if (currentStepIndex === newStepIndex) {
      return
    }
    const isSubmittedStep = stepperData.find((step) => step.index === newStepIndex)?.isSubmitted

    if (!isSubmittedStep && !skipModal.skipAllowed) {
      setSkipModal({
        open: true,
        skipAllowed: skipModal.skipAllowed,
        onSkip: () => {
          setSkipModal({
            open: false,
            skipAllowed: true,
            onSkip: () => {},
            onOpenChange: () => {},
          })
          goToStep(newStepIndex)
        },
        onOpenChange: (value) => {
          if (value) {
            return
          }
          setSkipModal((value) => ({
            open: false,
            skipAllowed: value.skipAllowed,
            onSkip: () => {},
            onOpenChange: () => {},
          }))
        },
      })

      return
    }

    goToStep(newStepIndex)
  }

  const getPreviousStep = () => {
    const prevSteps = stepsSchemas
      .slice(0, currentStepIndex !== 'summary' ? currentStepIndex : 0)
      .reverse()
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
    if (currentStepIndex === 'summary') return null
    const nextSteps = stepsSchemas.slice(currentStepIndex + 1)
    const nextStepIndex = nextSteps.findIndex((step) => step != null)
    return nextStepIndex !== -1 ? currentStepIndex + nextStepIndex + 1 : 'summary'
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

  const setStepFormData = (stepFormData: GenericObjectType) => {
    // Form displays and returns only the data for the current step, so we need to merge it with the
    // existing data, as each step contains only one root property with the data this object spread
    // will overwrite the existing step data with the new ones, which is an expected behaviour.
    const newData = { ...formData, ...stepFormData }
    const pickedPropertiesData = removeUnusedPropertiesFromFormData(schema, newData)

    const fileUuids = getFileUuidsNaive(pickedPropertiesData)
    keepFiles(fileUuids)

    setFormData(pickedPropertiesData)
    turnOnLeaveProtection()
  }

  const setImportedFormData = (importedFormData: GenericObjectType) => {
    const pickedPropertiesData = removeUnusedPropertiesFromFormData(schema, importedFormData)

    const evaluatedSchemas = getEvaluatedStepsSchemas(schema, importedFormData)
    if (
      currentStepIndex !== 'summary' &&
      /* If the current step is empty after the import */
      evaluatedSchemas[currentStepIndex] == null
    ) {
      setCurrentStepIndex(getFirstNonEmptyStepIndex(evaluatedSchemas))
    }

    const fileUuids = getFileUuidsNaive(pickedPropertiesData)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    refetchAfterImportIfNeeded(fileUuids)

    setSubmittedStepsIndexes(new Set())
    setFormData(pickedPropertiesData)
    turnOnLeaveProtection()
  }

  const handleFormOnChange = (newFormData: GenericObjectType | undefined) => {
    if (currentStepIndex === 'summary' || !newFormData) {
      return
    }

    setSubmittedStepsIndexes((prev) => {
      const newSet = new Set(prev)
      newSet.delete(currentStepIndex)
      return newSet
    })

    setStepFormData(newFormData)
  }
  const handleFormOnSubmit = (newFormData: GenericObjectType | undefined) => {
    if (currentStepIndex === 'summary' || !newFormData) {
      return
    }

    setSubmittedStepsIndexes((prev) => new Set([...prev, currentStepIndex]))
    setStepFormData(newFormData)
    goToNextStep()
  }

  const goToStepByFieldId = (fieldId: string) => {
    const stepProperty = parseStepFromFieldId(fieldId)
    if (!stepProperty) return

    const index = stepsSchemas.findIndex((step) => getStepProperty(step) === stepProperty)

    goToStep(index)
  }

  return {
    schema,
    uiSchema,
    formId: initialFormData.formId,
    formSlug,
    formData,
    currentStepIndex,
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
}

const FormStateContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormStateProvider = ({
  children,
  ...rest
}: PropsWithChildren<FormStateProviderProps>) => {
  const context = useGetContext(rest)

  return <FormStateContext.Provider value={context}>{children}</FormStateContext.Provider>
}

export const useFormState = () => {
  const context = useContext(FormStateContext)
  if (!context) {
    throw new Error('useFormState must be used within a FormStateProvider')
  }

  return context
}
