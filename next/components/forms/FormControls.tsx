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
      <div className="mt-10 hidden flex-wrap gap-5 md:flex md:items-center md:justify-between">
        <div className="grow">
          {canGoToPreviousStep && (
            <Button
              variant="black-plain"
              onPress={goToPreviousStep}
              startIcon={<ChevronLeftIcon />}
            >
              {t('form_controls.back')}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-5">
          {canGoToNextStep && (
            <Button variant="black-outline" onPress={goToNextStep}>
              {t('form_controls.skip')}
            </Button>
          )}
          <Button
            variant="black-solid"
            type="submit"
            data-cy="continue-button-desktop"
            endIcon={<ArrowRightIcon />}
          >
            {t('form_controls.continue')}
          </Button>
        </div>
      </div>

      {/* Mobile */}
      <div className="mt-4 flex flex-col gap-2 md:hidden">
        <Button variant="black-solid" type="submit" fullWidth data-cy="continue-button-mobile">
          {t('form_controls.continue')}
        </Button>
        <div className="flex items-center gap-3">
          {canGoToPreviousStep && (
            <Button variant="black-outline" fullWidth onPress={goToPreviousStep}>
              {t('form_controls.back')}
            </Button>
          )}
          {canGoToNextStep && (
            <Button variant="black-outline" fullWidth onPress={goToNextStep}>
              {t('form_controls.skip')}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default FormControls
