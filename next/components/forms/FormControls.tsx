import ArrowRightIcon from '@assets/images/new-icons/ui/arrow-right.svg'
import LeftIcon from '@assets/images/new-icons/ui/chevron-left.svg'
import { useTranslation } from 'next-i18next'

import { useFormState } from './FormStateProvider'
import Button from './simple-components/Button'

const FormControls = () => {
  const { canGoToPreviousStep, goToPreviousStep, canGoToNextStep, skipToNextStep } = useFormState()
  const { t } = useTranslation('forms')

  return (
    <>
      {/* Desktop */}
      <div className="mt-10 hidden md:flex flex-row flex-wrap gap-5">
        <div className="grow">
          {canGoToPreviousStep && (
            <Button
              variant="plain-black"
              onPress={goToPreviousStep}
              text={t('buttons.previous')}
              startIcon={<LeftIcon className="w-6 h-6" />}
            />
          )}
        </div>

        <div className="flex flex-row flex-wrap gap-5">
          {canGoToNextStep && (
            <Button variant="black-outline" onPress={skipToNextStep} text={t('buttons.skip')} />
          )}
          <Button
            type="submit"
            text={t('buttons.continue')}
            endIcon={<ArrowRightIcon className="w-6 h-6" />}
          />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex-col flex mt-4 md:hidden gap-2">
        <Button type="submit" size="sm" fullWidth text={t('buttons.continue')} />
        <div className="flex items-center gap-3">
          {canGoToPreviousStep && (
            <Button
              size="sm"
              fullWidth
              variant="black-outline"
              onPress={goToPreviousStep}
              text={t('buttons.previous')}
            />
          )}
          {canGoToNextStep && (
            <Button
              size="sm"
              fullWidth
              variant="black-outline"
              onPress={skipToNextStep}
              text={t('buttons.skip')}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default FormControls
