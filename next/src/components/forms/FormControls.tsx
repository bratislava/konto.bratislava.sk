import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import { useFormState } from '@/src/components/forms/useFormState'
import Icon from '@/src/components/icon-components/Icon'

const FormControls = () => {
  const { t } = useTranslation()

  const { canGoToPreviousStep, goToPreviousStep, canGoToNextStep, goToNextStep } = useFormState()

  return (
    <>
      {/* Desktop */}
      <div className="mt-10 hidden flex-wrap gap-5 lg:flex lg:items-center lg:justify-between">
        <div className="grow">
          {canGoToPreviousStep && (
            <Button
              variant="plain"
              onPress={goToPreviousStep}
              startIcon={<Icon name="chevron-left" />}
            >
              {t('FormControls.back')}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-5">
          {canGoToNextStep && (
            <Button variant="outline" onPress={goToNextStep}>
              {t('FormControls.skip')}
            </Button>
          )}
          <Button
            variant="solid"
            type="submit"
            data-cy="continue-button-desktop"
            endIcon={<Icon name="arrow-right" />}
          >
            {t('FormControls.continue')}
          </Button>
        </div>
      </div>

      {/* Mobile */}
      <div className="mt-4 flex flex-col gap-2 lg:hidden">
        <Button variant="solid" type="submit" fullWidth data-cy="continue-button-mobile">
          {t('FormControls.continue')}
        </Button>
        <div className="flex items-center gap-3">
          {canGoToPreviousStep && (
            <Button variant="outline" fullWidth onPress={goToPreviousStep}>
              {t('FormControls.back')}
            </Button>
          )}
          {canGoToNextStep && (
            <Button variant="outline" fullWidth onPress={goToNextStep}>
              {t('FormControls.skip')}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

export default FormControls
