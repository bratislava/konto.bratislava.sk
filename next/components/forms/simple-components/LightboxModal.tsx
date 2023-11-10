import { CrossIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import React from 'react'
import {
  Button as AriaButton,
  Dialog,
  Modal,
  ModalOverlay,
  ModalOverlayProps,
} from 'react-aria-components'

export type LightboxModalProps = Omit<ModalOverlayProps, 'className'> & {
  imageUrl: string
}

const LightboxModal = ({ imageUrl, ...rest }: LightboxModalProps) => {
  const { t } = useTranslation('common')

  // Makes `{ isDismissable: true }` default.
  const modalProps = { isDismissable: true, ...rest }

  return (
    <ModalOverlay
      className="fixed left-0 top-0 z-50 flex h-[var(--visual-viewport-height)] w-screen items-center justify-center bg-gray-800/40"
      {...modalProps}
    >
      <Modal {...modalProps} className="flex items-center justify-center p-4">
        <Dialog className="outline-0">
          {({ close }) => (
            <div className="relative">
              <img
                src={imageUrl}
                alt=""
                // TODO: Examine why is this needed.
                className="max-h-[calc(var(--visual-viewport-height)-32px)]"
              />
              <AriaButton
                className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-category-200 p-2"
                onPress={close}
              >
                <CrossIcon className="h-6 w-6" aria-hidden />
                <span className="sr-only">{t('modal_close_aria')}</span>
              </AriaButton>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}

export default LightboxModal
