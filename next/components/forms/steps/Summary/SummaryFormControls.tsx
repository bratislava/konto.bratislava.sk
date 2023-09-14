import { ChevronLeftIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'

import ButtonNew from '../../simple-components/ButtonNew'
import { useFormSend } from '../../useFormSend'
import { useFormState } from '../../useFormState'
import { useFormSummary } from './useFormSummary'

const SummaryFormControls = () => {
  const { t } = useTranslation('forms')

  const { isReadonly, goToPreviousStep } = useFormState()
  const { submitDisabled } = useFormSummary()
  const { handleSendButtonPress, handleSendEidButtonPress } = useFormSend()

  if (isReadonly) {
    // Cannot be null as RJFS will display its own submit button.
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>
  }

  return (
    <>
      {/* Desktop */}
      <div className="mt-10 hidden flex-row flex-wrap gap-5 md:flex">
        <div className="grow">
          <ButtonNew
            variant="black-plain"
            onPress={goToPreviousStep}
            startIcon={<ChevronLeftIcon className="h-6 w-6" />}
          >
            {t('buttons.previous')}
          </ButtonNew>
        </div>

        <div className="flex flex-row flex-wrap gap-5">
          <ButtonNew
            isDisabled={submitDisabled}
            type="submit"
            variant="black-outline"
            onPress={handleSendEidButtonPress}
          >
            {t('summary.button_send_eid')}
          </ButtonNew>
          <ButtonNew
            isDisabled={submitDisabled}
            type="submit"
            variant="black-solid"
            onPress={handleSendButtonPress}
          >
            {t('summary.button_send')}
          </ButtonNew>
        </div>
      </div>

      {/* Mobile */}
      <div className="mt-4 flex flex-col gap-2 md:hidden">
        <ButtonNew
          isDisabled={submitDisabled}
          size="small"
          fullWidth
          type="submit"
          variant="black-outline"
          onPress={handleSendEidButtonPress}
        >
          {t('summary.button_send_eid')}
        </ButtonNew>
        <ButtonNew
          isDisabled={submitDisabled}
          size="small"
          fullWidth
          type="submit"
          variant="black-solid"
          onPress={handleSendButtonPress}
        >
          {t('summary.button_send')}
        </ButtonNew>
        <ButtonNew size="small" fullWidth variant="black-outline" onPress={goToPreviousStep}>
          {t('buttons.previous')}
        </ButtonNew>
      </div>
    </>
  )
}

export default SummaryFormControls
