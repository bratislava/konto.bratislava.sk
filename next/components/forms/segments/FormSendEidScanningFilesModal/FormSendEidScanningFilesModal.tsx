import React from 'react'

import { ModalV2Props } from '../../simple-components/ModalV2'
import MessageModal from '../../widget-components/Modals/MessageModal'

enum Type {
  A,
  B,
  C,
}

type FormSendScanningEidFilesModalProps = ModalV2Props & { type: Type }

const content = {
  [Type.A]: 'forms.scanning_modal_1',
  [Type.B]: 'forms.scanning_modal_2',
  [Type.C]: 'forms.scanning_modal_3',
}
const FormSendScanningEidFilesModal = ({ type, ...rest }: FormSendScanningEidFilesModalProps) => {
  return (
    <MessageModal
      title="Nahraté prílohy ešte kontrolujeme"
      confirmLabel="Odoslať cez Bratislavské konto"
      type="warning"
      cancelHandler={() => {
        // setModalShowWarning(false)
      }}
      submitHandler={() => {
        // setModalShowWarning(false)
      }}
      cancelLabel="Späť"
      {...rest}
    >
      {content[type]}
    </MessageModal>
  )
}

export default FormSendScanningEidFilesModal
