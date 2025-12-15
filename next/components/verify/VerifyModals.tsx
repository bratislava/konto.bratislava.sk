import Button from 'components/forms/simple-components/ButtonNew'
import MessageModal, {
  MessageModalProps,
} from 'components/forms/widget-components/Modals/MessageModal'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { useVerifyModals } from './useVerifyModals'

/**
 * Heavily inspired by `FormModals` component.
 */

const VerifyModals = () => {
  const { t } = useTranslation('account')

  const {
    eidVerifyingModal,
    setEidVerifyingModal,
    eidSendErrorModal,
    setEidSendErrorModal,
    sendEidPending,
    verifyingConfirmationEidLegalModal,
    setVerifyingConfirmationEidLegalModal,
    redirectingToSlovenskoSkLogin,
  } = useVerifyModals()

  const messageModals: (MessageModalProps & { key: string })[] = [
    {
      key: 'verifyingConfirmationEidLegalModal',
      isOpen: verifyingConfirmationEidLegalModal.isOpen,
      onOpenChange: (value) => {
        if (!value) {
          setVerifyingConfirmationEidLegalModal({ isOpen: false })
        }
      },
      title: t('auth.verify_confirmation_eid_legal_modal.title'),
      type: 'info',
      buttons: [
        <Button
          variant="black-plain"
          onPress={() => setVerifyingConfirmationEidLegalModal({ isOpen: false })}
          isDisabled={redirectingToSlovenskoSkLogin}
          fullWidthMobile
        >
          {t('auth.verify_modals_close_button_title')}
        </Button>,
        <Button
          variant="black-solid"
          size="small"
          onPress={() =>
            verifyingConfirmationEidLegalModal.isOpen &&
            verifyingConfirmationEidLegalModal.confirmCallback()
          }
          isLoading={redirectingToSlovenskoSkLogin}
          isLoadingText={t('auth.verify_confirmation_eid_legal_modal.button_title_loading')}
          fullWidthMobile
        >
          {t('auth.verify_confirmation_eid_legal_modal.button_title')}
        </Button>,
      ],
      isDismissable: !redirectingToSlovenskoSkLogin,
      noCloseButton: redirectingToSlovenskoSkLogin,
      children: t('auth.verify_confirmation_eid_legal_modal.content'),
    },
    {
      key: 'eidVerifyingModal',
      isOpen: eidVerifyingModal,
      onOpenChange: setEidVerifyingModal,
      title: t('auth.eid_verifying_modal.title'),
      type: 'info',
      buttons: [
        // Faux button that show only is loading
        <Button isLoading={sendEidPending} onPress={() => {}} />,
      ],
      isDismissable: false,
      noCloseButton: true,
      children: t('auth.eid_verifying_modal.content'),
    },
    {
      key: 'eidSendErrorModal',
      isOpen: eidSendErrorModal,
      onOpenChange: (value) => {
        if (!value) {
          setEidSendErrorModal(false)
        }
      },
      title: t('auth.eid_verifying_error_modal.title'),
      type: 'info',
      buttons: [
        <Button
          variant="black-solid"
          onPress={() => setEidSendErrorModal(false)}
          isDisabled={sendEidPending}
          fullWidthMobile
        >
          {t('auth.verify_modals_close_button_title')}
        </Button>,
      ],
      isDismissable: !sendEidPending,
      noCloseButton: sendEidPending,
      children: t('auth.eid_verifying_error_modal.content'),
    },
  ]

  return (
    <>
      {messageModals.map((modalProps) => {
        // To avoid "A props object containing a "key" prop is being spread into JSX" error
        const { key, ...restModalProps } = modalProps
        return <MessageModal key={key} {...restModalProps} />
      })}
    </>
  )
}

export default VerifyModals
