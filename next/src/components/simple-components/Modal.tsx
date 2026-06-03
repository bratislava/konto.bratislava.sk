import React, { PropsWithChildren } from 'react'
import { mergeProps } from 'react-aria/mergeProps'
import {
  Modal as RACModal,
  ModalOverlay as RACModalOverlay,
  ModalOverlayProps,
} from 'react-aria-components/Modal'

import { useIframeResizerChildContext } from '@/src/components/forms/IframeResizerChild'
import cn from '@/src/utils/cn'

export type ModalProps = Omit<ModalOverlayProps, 'className'> & {
  modalClassname?: string
  modalOverlayClassname?: string
  mobileFullScreen?: boolean
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
      className="mt-(--iframe-margin-top) flex h-(--iframe-viewport-height) items-center self-start"
    >
      {children}
    </div>
  )
}

/**
 * A modal is an overlay element which blocks interaction with elements outside it.
 *
 * Docs: https://react-spectrum.adobe.com/react-aria/Modal.html
 *
 * This component only provides the overlay. It must be combined with a `Dialog` to create a fully
 * accessible modal dialog. Overlay props such as `isDismissable`, `isOpen` and `onOpenChange`
 * belong on the `ModalOverlay`, never on the inner `Modal`.
 */
const Modal = ({
  children,
  modalClassname,
  modalOverlayClassname,
  mobileFullScreen,
  dataCy,
  ...rest
}: ModalProps) => {
  // Makes `{ isDismissable: true }` default.
  const modalOverlayProps = mergeProps({ isDismissable: true }, rest)

  return (
    <RACModalOverlay
      className={cn(
        'fixed top-0 left-0 z-50 flex h-(--visual-viewport-height) w-screen items-center justify-center bg-gray-800/40 pt-(--modal-offset-x)',
        modalOverlayClassname,
      )}
      {...modalOverlayProps}
    >
      <ModalInIframeResizerWrapper>
        <RACModal
          data-cy={dataCy}
          className={cn(
            'relative overflow-auto bg-gray-0 px-4 outline-0 md:mx-4 md:h-min md:max-h-full md:max-w-[592px] md:rounded-2xl md:p-6',
            mobileFullScreen
              ? 'mx-0 h-full w-full max-w-none rounded-none p-4 pt-12'
              : 'mx-4 h-min max-h-full w-full rounded-xl pt-6 pb-4',
            modalClassname,
          )}
        >
          {children}
        </RACModal>
      </ModalInIframeResizerWrapper>
    </RACModalOverlay>
  )
}

export default Modal
