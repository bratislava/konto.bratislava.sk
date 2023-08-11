import { useTranslation } from 'next-i18next'
import React from 'react'

import { ModalV2Props } from '../../simple-components/ModalV2'
import MessageModal from '../../widget-components/Modals/MessageModal'

enum Type {
  A,
  B,
  C,
}

type FormSendScanningFilesModalProps = ModalV2Props & {
  type: Type
  submitHandler?: () => void
  cancelHandler?: () => void
}

const FormSendScanningFilesModal = ({ type, ...rest }: FormSendScanningFilesModalProps) => {
  const { t } = useTranslation('forms')

  const content = {
    [Type.A]: t('summary.scanning_modal_1_content'),
    [Type.B]: t('summary.scanning_modal_2_content'),
    [Type.C]: t('summary.scanning_modal_3_content'),
  }

  const confirmLabel = {
    [Type.A]: t('summary.scanning_modal_1_button'),
    [Type.B]: t('summary.scanning_modal_2_button'),
    [Type.C]: t('summary.scanning_modal_3_button'),
  }

  return (
    <MessageModal
      title={t('summary.scanning_modal_title')}
      confirmLabel={confirmLabel[type]}
      type="warning"
      cancelLabel={t('summary.scanning_modal_back_button')}
      {...rest}
    >
      {content[type]}
    </MessageModal>
  )
}

export default FormSendScanningFilesModal
