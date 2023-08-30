import { CheckIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { twMerge } from 'tailwind-merge'

import { FormStepperStep } from '../types/Steps'

interface StepperViewRowProps {
  step: FormStepperStep
  isCurrent: boolean
  className?: string
}

const StepperViewRow = ({ step, isCurrent, className }: StepperViewRowProps) => {
  const { t } = useTranslation('forms')

  const { title, isSubmitted, displayIndex } = step
  const iconClassName = cx(
    'min-w-8 flex h-8 w-8 shrink-0 flex-row items-center justify-center rounded-full border-2',
    {
      'border-gray-700 bg-gray-700 text-white': isSubmitted || isCurrent,
      'border-gray-300 bg-transparent text-gray-300': !isSubmitted && !isCurrent,
    },
  )

  return (
    <div className={twMerge('flex flex-row items-center gap-3', className)}>
      <div className={iconClassName}>
        {isCurrent || !isSubmitted ? displayIndex : <CheckIcon fill="white" className="h-6 w-6" />}
      </div>
      <p className="text-p3-medium w-72 ">
        {isCurrent ? <span className="sr-only">{t('steps.current_sr')}</span> : null}
        {isSubmitted && !isCurrent ? (
          <span className="sr-only">{t('steps.submitted_sr')}</span>
        ) : null}
        {title}
      </p>
    </div>
  )
}

export default StepperViewRow
