import { GenericObjectType } from '@rjsf/utils'
import { mergeClientAndServerFilesSummary } from 'forms-shared/form-files/mergeClientAndServerFiles'
import { getFileUuidsNaive } from 'forms-shared/form-utils/fileUtils'
import { validateSummary } from 'forms-shared/summary-renderer/validateSummary'
import { useTranslation } from 'next-i18next'
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import useStateRef from 'react-usestateref'
import { useIsFirstRender } from 'usehooks-ts'

import {
  getEvaluatedStepsSchemas,
  getFirstNonEmptyStepIndex,
  getStepperData,
  getStepProperty,
  parseStepFromFieldId,
  removeUnusedPropertiesFromFormData,
} from '../../frontend/utils/formState'
import { FormStepIndex } from './types/Steps'
import { useFormContext } from './useFormContext'
import { useFormCurrentStepIndex } from './useFormCurrentStepIndex'
import { useFormFileUpload } from './useFormFileUpload'
import { useFormLeaveProtection } from './useFormLeaveProtection'
import { useFormModals } from './useFormModals'

const useGetContext = () => {
  const {
    formDefinition: {
      schemas: { schema, uiSchema },
    },
    formMigrationRequired,
    initialFormDataJson,
    isReadonly,
  } = useFormContext()
  const { t } = useTranslation('forms')
  const { keepFiles, refetchAfterImportIfNeeded, clientFiles, serverFiles } = useFormFileUpload()
  const { turnOnLeaveProtection } = useFormLeaveProtection()
  // eslint-disable-next-line testing-library/render-result-naming-convention
  const isFirst = useIsFirstRender()

  const [formData, setFormData, formDataRef] = useStateRef<GenericObjectType>(initialFormDataJson)
  const stepsSchemas = useMemo(() => getEvaluatedStepsSchemas(schema, formData), [schema, formData])

  /**
   * This set holds indexes of steps that have been submitted (submit button has been pressed, which means they have been validated).
   * A condition in different step might invalidate the step, but it is not easily detectable.
   */
  const [submittedStepsIndexes, setSubmittedStepsIndexes] = useState<Set<number>>(new Set())
  const stepperData = useMemo(
    () => getStepperData(stepsSchemas, uiSchema, submittedStepsIndexes, t('summary.title')),
    [stepsSchemas, submittedStepsIndexes, t, uiSchema],
  )

  const { currentStepIndex, setCurrentStepIndex } = useFormCurrentStepIndex(stepperData)
  const { setMigrationRequiredModal } = useFormModals()
  const scrollToFieldIdRef = useRef<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentStepperStep = stepperData.find((step) => step.index === currentStepIndex)!

  const currentStepSchema = currentStepIndex === 'summary' ? null : stepsSchemas[currentStepIndex]

  const goToStep = (newIndex: FormStepIndex) => {
    if (stepsSchemas[newIndex] !== null || newIndex === 'summary') {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setCurrentStepIndex(newIndex)
    }
  }

  const getPreviousStep = () => {
    const prevSteps = stepsSchemas
      .slice(0, currentStepIndex === 'summary' ? stepsSchemas.length : currentStepIndex)
      .reverse()
    const prevStepIndex = prevSteps.findIndex((step) => step != null)
    return prevStepIndex === -1 ? null : prevSteps.length - prevStepIndex - 1
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
    return nextStepIndex === -1 ? 'summary' : currentStepIndex + nextStepIndex + 1
  }

  const canGoToNextStep = getNextStep() !== null

  const goToNextStep = () => {
    const nextStepIndex = getNextStep()
    if (nextStepIndex !== null) {
      goToStep(nextStepIndex)
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
    // Initially the form triggers onChange with the initial data, which is not a change, so we don't want to activate leave protection.
    if (!isFirst) {
      turnOnLeaveProtection()
    }
  }

  const setImportedFormData = (importedFormData: GenericObjectType) => {
    const pickedPropertiesData = removeUnusedPropertiesFromFormData(schema, importedFormData)

    const evaluatedSchemas = getEvaluatedStepsSchemas(schema, importedFormData)
    if (
      currentStepIndex !== 'summary' &&
      /* If the current step is empty after the import */
      evaluatedSchemas[currentStepIndex] == null
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setCurrentStepIndex(getFirstNonEmptyStepIndex(evaluatedSchemas))
    }

    const fileUuids = getFileUuidsNaive(pickedPropertiesData)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    refetchAfterImportIfNeeded(fileUuids)

    setSubmittedStepsIndexes(new Set())
    setFormData(pickedPropertiesData)
    turnOnLeaveProtection()

    // the next section sets the correct state of the form stepper after import
    // validateSummary validates the entire form and returns errors by sections
    // missing step in errorSummary === no error on the step
    // we treat errorless steps as "complete"
    const fileInfos = mergeClientAndServerFilesSummary(clientFiles, serverFiles)
    const { errorSchema } = validateSummary(schema, pickedPropertiesData, fileInfos)
    const keysWithErrors = Object.keys(errorSchema)
    const stepIndexesWithoutErrors = evaluatedSchemas
      .map((value, index) => {
        // schema.properties should always contain a single key, these are same as errorSchema keys
        if (
          keysWithErrors.some((keyWithError) =>
            Object.keys(value?.properties || {}).includes(keyWithError),
          )
        ) {
          return null
        }
        return index
      })
      .filter((value) => value != null) as Array<number>
    setSubmittedStepsIndexes(new Set(stepIndexesWithoutErrors))
  }

  const handleFormOnChange = (newFormData: GenericObjectType | undefined) => {
    if (currentStepIndex === 'summary' || !newFormData || isReadonly) {
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
    if (formMigrationRequired) {
      setMigrationRequiredModal(true)
    }
    if (currentStepIndex === 'summary' || !newFormData || isReadonly) {
      return
    }

    setSubmittedStepsIndexes((prev) => new Set([...Array.from(prev), currentStepIndex]))
    setStepFormData(newFormData)
    goToNextStep()
  }

  const goToStepByFieldId = (fieldId: string) => {
    const stepProperty = parseStepFromFieldId(fieldId)
    if (!stepProperty) return

    const index = stepsSchemas.findIndex((step) => getStepProperty(step) === stepProperty)

    scrollToFieldIdRef.current = fieldId
    goToStep(index)
  }

  const popScrollToFieldId = () => {
    const fieldId = scrollToFieldIdRef.current
    scrollToFieldIdRef.current = null
    return fieldId
  }

  return {
    formData,
    formDataRef,
    currentStepIndex,
    stepperData,
    currentStepperStep,
    currentStepSchema,
    canGoToPreviousStep,
    goToPreviousStep,
    canGoToNextStep,
    goToNextStep,
    handleFormOnChange,
    handleFormOnSubmit,
    goToStep,
    goToStepByFieldId,
    setImportedFormData,
    popScrollToFieldId,
  }
}

const FormStateContext = createContext<ReturnType<typeof useGetContext> | undefined>(undefined)

export const FormStateProvider = ({ children }: PropsWithChildren) => {
  const context = useGetContext()

  return <FormStateContext.Provider value={context}>{children}</FormStateContext.Provider>
}

export const useFormState = () => {
  const context = useContext(FormStateContext)
  if (!context) {
    throw new Error('useFormState must be used within a FormStateProvider')
  }

  return context
}
