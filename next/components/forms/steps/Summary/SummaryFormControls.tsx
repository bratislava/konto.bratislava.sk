import { useTranslation } from 'next-i18next'
import React from 'react'

import ButtonNew from '../../simple-components/ButtonNew'
import { useFormSend } from '../../useFormSend'
import { useFormSummary } from './useFormSummary'

const SummaryFormControls = () => {
  const { t } = useTranslation('forms')

  const { submitDisabled } = useFormSummary()
  const { handleSendButtonPress, handleSendEidButtonPress } = useFormSend()

  return (
    <>
      <h3 className="text-h3">{t('summary.vop_agreement_title')}</h3>
      <p>{t('summary.vop_agreement_content')}</p>


      <ButtonNew isDisabled={submitDisabled} type="submit" variant="black-solid" onPress={handleSendEidButtonPress}>
        {t('summary.button_send_eid')}
      </ButtonNew>
      <ButtonNew isDisabled={submitDisabled} type="submit" variant="black-solid" onPress={handleSendButtonPress}>
        {t('summary.button_send')}
      </ButtonNew>
      </>
  )
}

export default SummaryFormControls
