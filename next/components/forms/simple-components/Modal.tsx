import { CrossIcon } from '@assets/ui-icons'
import { useTranslation } from 'next-i18next'
import React, { PropsWithChildren } from 'react'
import { mergeProps } from 'react-aria'
import {
  Button as AriaButton,
  Dialog,
  Modal as AriaModal,
  ModalOverlay,
  ModalOverlayProps,
} from 'react-aria-components'

import cn from '../../../frontend/cn'
import { useIframeResizerChildContext } from '../IframeResizerChild'

export type ModalProps = Omit<ModalOverlayProps, 'className'> & {
  modalClassname?: string
  modalOverlayClassname?: string
  mobileFullScreen?: boolean
  noCloseButton?: boolean
  dataCy?: string
} & PropsWithChildren

const ModalInIframeResizerWrapper = ({ children }: PropsWithChildren) => {
  const iframe = useIframeResizerChildContext()

  if (!iframe) {
    return <>{children}</>
  }

  /**
   * When the modal is rendered inside an iframe with iframeResizer:
   * 1. We need a container with explicit height matching the iframe's viewport to ensure proper
   *    modal centering and scrolling behavior
   *
   * 2. The container needs to be offset from the top based on scroll position:
   *    - If scrolled down: offset = scrolled distance (iframe.iframe.y is negative)
   *    - Maximum offset is limited to prevent the modal from extending beyond iframe
   *      content (full height - viewport height)
   *    - This keeps the modal visually centered relative to the viewport while
   *      respecting the iframe's content boundaries
   */
  const offset = iframe.iframe.y < 0 ? -iframe.iframe.y : 0
  const maxOffsetFromBottom = iframe.iframe.height - iframe.viewport.height
  const marginTop = Math.min(offset, maxOffsetFromBottom)

  return (
    <div
      style={
        {
          '--iframe-viewport-height': `${iframe.viewport.height}px`,
          '--iframe-margin-top': `${marginTop}px`,
        } as React.CSSProperties
      }
      className="mt-[var(--iframe-margin-top)] flex h-[var(--iframe-viewport-height)] items-center self-start"
    >
      {children}
    </div>
  )
}

const Modal = ({
  children,
  modalClassname,
  modalOverlayClassname,
  mobileFullScreen,
  noCloseButton,
  dataCy,
  ...rest
}: ModalProps) => {
  const { t } = useTranslation('account')

  // Makes `{ isDismissable: true }` default.
  const modalProps = mergeProps({ isDismissable: true }, rest)

  return (
    <ModalOverlay
      className={cn(
        'fixed top-0 left-0 z-50 flex h-[var(--visual-viewport-height)] w-screen items-center justify-center bg-gray-800/40 pt-[var(--modal-offset-x)]',
        modalOverlayClassname,
      )}
      {...modalProps}
    >
      <ModalInIframeResizerWrapper>
        <AriaModal
          data-cy={dataCy}
          {...modalProps}
          className={cn(
            'relative overflow-auto bg-gray-0 px-4 outline-0 md:mx-4 md:h-min md:max-h-full md:max-w-[592px] md:rounded-2xl md:p-6',
            mobileFullScreen
              ? 'mx-0 h-full w-full max-w-none rounded-none p-4 pt-12'
              : 'mx-4 h-min max-h-full w-full rounded-xl pt-6 pb-4',
            modalClassname,
          )}
        >
          <Dialog className="outline-0">
            {({ close }) => (
              <>
                {noCloseButton ? null : (
                  <AriaButton
                    className="absolute top-3 right-3 cursor-pointer md:top-4 md:right-4"
                    onPress={close}
                    data-cy="close-modal"
                  >
                    <CrossIcon className="size-6" aria-hidden />
                    <span className="sr-only">{t('Modal.aria.close')}</span>
                  </AriaButton>
                )}
                {children}
              </>
            )}
          </Dialog>
        </AriaModal>
      </ModalInIframeResizerWrapper>
    </ModalOverlay>
  )
}

export default Modal
