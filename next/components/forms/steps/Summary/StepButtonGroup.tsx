import { ArrowRightIcon, ChevronLeftIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'

import Button from '../../simple-components/Button'

interface StepButtonGroupProps {
  stepIndex: number
  isFinalStep: boolean
  previous: () => void
  skip: () => void
  submitStep: () => void
  submitForm: () => void
}

const StepButtonGroup = (props: StepButtonGroupProps) => {
  const { stepIndex, isFinalStep, previous, skip, submitStep, submitForm } = props
  const { t } = useTranslation('forms')

  // TODO: Move from here and implement properly
  const isSubmitFormAllowed = true

  return (
    <>
      {/* Desktop */}
      <div className="mt-10 hidden flex-row flex-wrap gap-5 md:flex">
        <div className="grow">
          {stepIndex !== 0 && (
            <Button
              variant="plain-black"
              onPress={previous}
              text={t('buttons.previous')}
              startIcon={<ChevronLeftIcon className="h-6 w-6" />}
            />
          )}
        </div>
        {isFinalStep ? (
          <Button onPress={submitForm} text={t('buttons.send')} disabled={isSubmitFormAllowed} />
        ) : (
          <div className="flex flex-row flex-wrap gap-5">
            <Button variant="black-outline" onPress={skip} text={t('buttons.skip')} />
            <Button
              onPress={submitStep}
              text={t('buttons.continue')}
              endIcon={<ArrowRightIcon className="h-6 w-6" />}
            />
          </div>
        )}
      </div>
      {/* Mobile */}
      <div className="mt-4 flex flex-col gap-2 md:hidden">
        {isFinalStep ? (
          <Button
            size="sm"
            fullWidth
            onPress={submitForm}
            text={t('buttons.send')}
            disabled={isSubmitFormAllowed}
          />
        ) : (
          <Button size="sm" fullWidth onPress={submitStep} text={t('buttons.continue')} />
        )}
        <div className="flex items-center gap-3">
          {stepIndex !== 0 && (
            <Button
              size="sm"
              fullWidth
              variant="black-outline"
              onPress={previous}
              text={t('buttons.previous')}
            />
          )}
          {!isFinalStep && (
            <Button
              size="sm"
              fullWidth
              variant="black-outline"
              onPress={skip}
              text={t('buttons.skip')}
            />
          )}
        </div>
        {/* <div className="grow">
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
          <Button onPress={submitForm} text={t('buttons.send')} />
        ) : (
          <div className="flex flex-row flex-wrap gap-5">
            <Button variant="black-outline" onPress={skip} text={t('buttons.skip')} />
            <Button
              onPress={submitStep}
              text={t('buttons.continue')}
              endIcon={<ArrowRightIcon className="w-6 h-6" />}
            />
          </div>
        )} */}
      </div>
    </>
  )
}

export default StepButtonGroup
