import ArrowRightIcon from '@assets/images/new-icons/ui/arrow-right.svg'
import LeftIcon from '@assets/images/new-icons/ui/chevron-left.svg'
import { useTranslation } from 'next-i18next'

import { FileScan } from '../../../../frontend/dtos/formStepperDto'
import Button from '../../simple-components/Button'

interface StepButtonGroupProps {
  stepIndex: number
  isFinalStep: boolean
  fileScans: FileScan[]
  previous: () => void
  skip: () => void
  submitStep: () => void
  submitForm: () => void
}

const StepButtonGroup = (props: StepButtonGroupProps) => {
  const { stepIndex, isFinalStep, fileScans, previous, skip, submitStep, submitForm } = props
  const { t } = useTranslation('forms')

  const isSubmitFormAllowed = !fileScans.some(scan => scan.fileState === 'error')

  return (
    <div className="mt-10 flex flex-row flex-wrap gap-5">
      <div className="grow">
        {stepIndex !== 0 && (
          <Button
            variant="plain-black"
            onPress={previous}
            text={t('buttons.previous')}
            startIcon={<LeftIcon className="w-6 h-6" />}
          />
        )}
      </div>
      {isFinalStep ? (
        <Button onPress={submitForm} text={t('buttons.send')} disabled={isSubmitFormAllowed}/>
      ) : (
        <div className="flex flex-row flex-wrap gap-5">
          <Button variant="black-outline" onPress={skip} text={t('buttons.skip')} />
          <Button
            onPress={submitStep}
            text={t('buttons.continue')}
            endIcon={<ArrowRightIcon className="w-6 h-6" />}
          />
        </div>
      )}
    </div>
  )
}

export default StepButtonGroup
