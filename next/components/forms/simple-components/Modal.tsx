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

import { useIframeResizerChildContext } from '../IframeResizerChild'
import cn from '../../../frontend/cn'

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
  const { t } = useTranslation('common')

  // Makes `{ isDismissable: true }` default.
  const modalProps = mergeProps({ isDismissable: true }, rest)

  return (
    <ModalOverlay
      className={cn(
        'fixed left-0 top-0 z-50 flex h-[var(--visual-viewport-height)] w-screen items-center justify-center bg-gray-800/40 pt-[var(--modal-offset-x)]',
        modalOverlayClassname,
      )}
      {...modalProps}
    >
      <ModalInIframeResizerWrapper>
        <AriaModal
          data-cy={dataCy}
          {...modalProps}
          className={cn(
            'bg-gray-0 relative overflow-auto px-4 outline-0 md:mx-4 md:h-min md:max-h-full md:max-w-[592px] md:rounded-2xl md:p-6',
            mobileFullScreen
              ? 'mx-0 h-full w-full max-w-none rounded-none p-4 pt-12'
              : 'mx-4 h-min max-h-full w-full rounded-xl pb-4 pt-6',
            modalClassname,
          )}
        >
          <Dialog className="outline-0">
            {({ close }) => (
              <>
                {noCloseButton ? null : (
                  <AriaButton
                    className="absolute right-3 top-3 cursor-pointer md:right-4 md:top-4"
                    onPress={close}
                    data-cy="close-modal"
                  >
                    <CrossIcon className="size-6" aria-hidden />
                    <span className="sr-only">{t('modal_close_aria')}</span>
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
