import CloseIcon from '@assets/images/new-icons/ui/cross.svg'
import { ChevronDownIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import { useRef, useState } from 'react'
import { useButton } from 'react-aria'
import { Button as AriaButton } from 'react-aria-components'

import { useFormState } from '../FormStateProvider'
import { FormStepIndex } from '../types/Steps'
import StepperViewList from './StepperViewList'
import StepperViewRow from './StepperViewRow'

interface StepperViewProps {
  forceMobileSize?: boolean
}

const StepperView = ({ forceMobileSize }: StepperViewProps) => {
  const { t } = useTranslation('forms')
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)
  const { currentStepMetadata, skipToStep } = useFormState()

  const handleOnClickDropdownIcon = () => {
    if (isCollapsed) {
      setIsCollapsed(false)
    }
  }

  const handleOnSkipToStep = (stepIndex: FormStepIndex) => {
    setIsCollapsed(true)
    skipToStep(stepIndex)
  }

  const buttonRef = useRef<HTMLDivElement>(null)
  const { buttonProps } = useButton(
    { onPress: handleOnClickDropdownIcon, elementType: 'div' },
    buttonRef,
  )

  return (
    <>
      <div className={cx('hidden', { 'lg:block': !forceMobileSize })}>
        <StepperViewList onSkipToStep={handleOnSkipToStep} />
      </div>
      <div
        className={cx('flex flex-col', { 'lg:hidden': !forceMobileSize })}
        {...buttonProps}
        ref={buttonRef}
      >
        <div className="flex h-14 w-full cursor-pointer flex-row items-center gap-5 bg-white p-4 drop-shadow-lg">
          <StepperViewRow className="grow" step={currentStepMetadata} isCurrent isButton={false} />
          <ChevronDownIcon className={cx({ 'rotate-180': !isCollapsed })} />
        </div>
        <div
          className={cx('fixed inset-0 z-50 mt-1 flex h-full w-full flex-col gap-0.5 bg-gray-200', {
            'h-screen w-screen transition-all duration-500': true,
            'translate-y-full': isCollapsed,
            'translate-y-0': !isCollapsed,
          })}
        >
          <div className="flex h-14 w-full flex-row items-center gap-1 bg-white p-4 drop-shadow-lg">
            <h6 className="text-h6 grow">{t('all_steps')}</h6>
            <AriaButton
              className="flex h-full cursor-pointer flex-col justify-center"
              onPress={() => setIsCollapsed(true)}
            >
              <CloseIcon className="h-6 w-6" />
            </AriaButton>
          </div>
          <div className="grow overflow-y-scroll overscroll-none bg-white px-4 pb-20 pt-4">
            <StepperViewList onSkipToStep={handleOnSkipToStep} />
          </div>
        </div>
      </div>
    </>
  )
}

export default StepperView
