import CloseIcon from '@assets/images/new-icons/ui/cross.svg'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import { useRef, useState } from 'react'
import { useButton } from 'react-aria'
import { Button as AriaButton } from 'react-aria-components'

import ChevronDown from '../../../assets/images/forms/chevron-down.svg'
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
        <div className="h-14 p-4 w-full bg-white flex flex-row items-center gap-5 drop-shadow-lg cursor-pointer">
          <StepperViewRow className="grow" step={currentStepMetadata} isCurrent isButton={false} />
          <ChevronDown className={cx({ 'rotate-180': !isCollapsed })} />
        </div>
        <div
          className={cx('fixed bg-gray-200 w-full h-full inset-0 mt-1 z-50 flex flex-col gap-0.5', {
            'transition-all duration-500 h-screen w-screen': true,
            'translate-y-full': isCollapsed,
            'translate-y-0': !isCollapsed,
          })}
        >
          <div className="h-14 p-4 w-full bg-white flex flex-row items-center gap-1 drop-shadow-lg">
            <h6 className="text-h6 grow">{t('all_steps')}</h6>
            <AriaButton
              className="h-full cursor-pointer flex flex-col justify-center"
              onPress={() => setIsCollapsed(true)}
            >
              <CloseIcon className="w-6 h-6" />
            </AriaButton>
          </div>
          <div className="bg-white grow overflow-y-scroll overscroll-none pb-20 px-4 pt-4">
            <StepperViewList onSkipToStep={handleOnSkipToStep} />
          </div>
        </div>
      </div>
    </>
  )
}

export default StepperView
