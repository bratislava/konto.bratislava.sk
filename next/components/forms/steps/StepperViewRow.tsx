import { CheckIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { twMerge } from 'tailwind-merge'

import { FormStepperStep } from '../types/Steps'
import { useFormState } from '../useFormState'

interface StepperViewRowProps {
  step: FormStepperStep
  isCurrent: boolean
  className?: string
}

const StepperViewRow = ({ step, isCurrent, className }: StepperViewRowProps) => {
  const { submittedStepsIndexes } = useFormState()
  const { t } = useTranslation('forms')

  const isSubmitted = step.index === 'summary' ? false : submittedStepsIndexes.has(step.index)
  const getTitle = () => {
    if (step.index === 'summary') {
      return t('summary.title')
    }

    return step.stepperTitle ?? step.title
  }

  const iconClassName = cx(
    'flex h-8 w-8 min-w-8 shrink-0 flex-row items-center justify-center rounded-full border-2',
    {
      'border-gray-700 bg-gray-700 text-white': isSubmitted || isCurrent,
      'border-gray-300 bg-transparent text-gray-300': !isSubmitted && !isCurrent,
    },
  )

  return (
    <div className={twMerge('flex flex-row items-center gap-3', className)}>
      <div className={iconClassName} data-cy={isCurrent ? 'stepper-step-active' : null}>
        {isCurrent || !isSubmitted ? (
          step.displayIndex
        ) : (
          <CheckIcon fill="white" className="size-6" />
        )}
      </div>
      <span className="text-p3-medium text-left">
        {isCurrent ? <span className="sr-only">{t('steps.current_sr')}</span> : null}
        {isSubmitted && !isCurrent ? (
          <span className="sr-only">{t('steps.submitted_sr')}</span>
        ) : null}
        {getTitle()}
      </span>
    </div>
  )
}

export default StepperViewRow
