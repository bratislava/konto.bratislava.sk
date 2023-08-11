import { useTranslation } from 'next-i18next'
import React from 'react'

import { ModalV2Props } from '../../simple-components/ModalV2'
import MessageModal from '../../widget-components/Modals/MessageModal'

type SkipStepModalProps = {
  onSkip?: () => void
} & ModalV2Props

const SkipStepModal = ({ onSkip, ...rest }: SkipStepModalProps) => {
  const { t } = useTranslation('forms')

  return (
    <MessageModal
      title={t('skip_step_modal.title')}
      confirmLabel={t('skip_step_modal.button_submit_text')}
      type="error"
      cancelHandler={() => {
        ;() => rest?.onOpenChange?.(false)
      }}
      submitHandler={onSkip}
      cancelLabel="Späť"
      {...rest}
    >
      {t('skip_step_modal.text')}
    </MessageModal>
  )
}

export default SkipStepModal
