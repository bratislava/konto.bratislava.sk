import { ArrowRightIcon, ChevronLeftIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'

import Button from './simple-components/Button'
import { useFormState } from './useFormState'

const FormControls = () => {
  const { canGoToPreviousStep, goToPreviousStep, canGoToNextStep, goToNextStep } = useFormState()
  const { t } = useTranslation('forms')

  return (
    <>
      {/* Desktop */}
      <div className="mt-10 hidden flex-row flex-wrap gap-5 md:flex">
        <div className="grow">
          {canGoToPreviousStep && (
            <Button
              variant="plain-black"
              onPress={goToPreviousStep}
              text={t('buttons.previous')}
              startIcon={<ChevronLeftIcon className="h-6 w-6" />}
            />
          )}
        </div>

        <div className="flex flex-row flex-wrap gap-5">
          {canGoToNextStep && (
            <Button variant="black-outline" onPress={goToNextStep} text={t('buttons.skip')} />
          )}
          <Button
            type="submit"
            text={t('buttons.continue')}
            endIcon={<ArrowRightIcon className="h-6 w-6" />}
          />
        </div>
      </div>

      {/* Mobile */}
      <div className="mt-4 flex flex-col gap-2 md:hidden">
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
              onPress={goToNextStep}
              text={t('buttons.skip')}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default FormControls
